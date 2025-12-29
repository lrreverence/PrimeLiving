/**
 * SMS Service
 * 
 * Service for interacting with TextBee SMS Gateway API
 * Documentation: https://textbee.dev/docs
 */

export interface SMSResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface Device {
  id: string;
  name?: string;
  status?: string;
  [key: string]: any;
}

class SMSService {
  private apiKey: string | null = null;
  private deviceId: string | null = null;

  constructor() {
    // Get API key from environment (for direct API calls if needed)
    if (typeof window !== 'undefined') {
      this.apiKey = import.meta.env.VITE_TEXTBEE_API_KEY || null;
      this.deviceId = import.meta.env.VITE_TEXTBEE_DEVICE_ID || null;
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone) return phone;
    
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // Handle Philippines numbers (09XXXXXXXXX)
    if (cleaned.startsWith('09') && cleaned.length === 11) {
      return `+63${cleaned.substring(1)}`;
    }

    // Handle Philippines numbers without leading 0 (9XXXXXXXXX)
    if (cleaned.startsWith('9') && cleaned.length === 10) {
      return `+63${cleaned}`;
    }

    // If no country code detected, try to add + if it's a reasonable length
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return `+${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Send SMS via TextBee API
   */
  async sendSMS(options: {
    recipients: string[];
    message: string;
    deviceId?: string;
  }): Promise<SMSResponse> {
    try {
      if (!options.recipients || options.recipients.length === 0) {
        return { success: false, error: 'At least one recipient is required' };
      }

      if (!options.message || options.message.trim().length === 0) {
        return { success: false, error: 'Message cannot be empty' };
      }

      if (!this.apiKey) {
        return { success: false, error: 'TextBee API key not configured. Please set VITE_TEXTBEE_API_KEY in your .env file' };
      }

      const targetDeviceId = options.deviceId || this.deviceId;
      if (!targetDeviceId) {
        return { success: false, error: 'Device ID is required. Please set VITE_TEXTBEE_DEVICE_ID in your .env file or select a device' };
      }

      // Format phone numbers
      const formattedRecipients = options.recipients.map(phone => 
        this.formatPhoneNumber(phone)
      );

      // Call TextBee API directly
      const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${targetDeviceId}/send-sms`;
      
      const response = await fetch(textbeeUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: formattedRecipients,
          message: options.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'Failed to send SMS via TextBee';
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        return { success: false, error: errorMessage };
      }

      // Parse successful response
      let result;
      try {
        result = await response.json();
      } catch {
        result = { success: true };
      }

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  /**
   * List all registered TextBee devices
   */
  async listDevices(): Promise<Device[]> {
    try {
      if (!this.apiKey) {
        throw new Error('TextBee API key not configured. Please set VITE_TEXTBEE_API_KEY in your .env file');
      }

      const response = await fetch('https://api.textbee.dev/api/v1/gateway/devices', {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to list devices: ${errorText}`);
      }

      const data = await response.json();
      return data.devices || data || [];
    } catch (error: any) {
      console.error('Error listing devices:', error);
      throw error;
    }
  }

  /**
   * Get received SMS messages from a device
   */
  async getReceivedSMS(deviceId?: string): Promise<any[]> {
    try {
      const targetDeviceId = deviceId || this.deviceId;
      
      if (!targetDeviceId) {
        throw new Error('Device ID is required');
      }

      if (!this.apiKey) {
        throw new Error('TextBee API key not configured');
      }

      const response = await fetch(
        `https://api.textbee.dev/api/v1/gateway/devices/${targetDeviceId}/messages`,
        {
          method: 'GET',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get received SMS: ${errorText}`);
      }

      const data = await response.json();
      return data.messages || data || [];
    } catch (error: any) {
      console.error('Error getting received SMS:', error);
      throw error;
    }
  }

  /**
   * Send a test SMS message
   */
  async testSMS(phoneNumber: string, deviceId?: string): Promise<SMSResponse> {
    return this.sendSMS({
      recipients: [phoneNumber],
      message: 'Test SMS from PrimeLiving - SMS service is working! 📱',
      deviceId,
    });
  }

  /**
   * Get the device ID from environment
   */
  getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Get the API key status (without exposing the key)
   */
  hasApiKey(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const smsService = new SMSService();

// Make available globally for browser console testing (as mentioned in docs)
if (typeof window !== 'undefined') {
  (window as any).smsService = smsService;
  (window as any).testSMS = (phoneNumber: string, deviceId?: string) => {
    return smsService.testSMS(phoneNumber, deviceId);
  };
}

