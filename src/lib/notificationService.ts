/**
 * Notification Service
 * 
 * This service handles sending notifications via Email and SMS.
 * 
 * Current Implementation:
 * - Notifications are saved to the database and appear in tenant dashboards
 * - Email sending via Supabase Edge Function (Resend/SendGrid)
 * - SMS sending via direct TextBee API calls
 */

import { supabase } from '@/integrations/supabase/client';

export interface NotificationResult {
  success: boolean;
  error?: any;
}

/**
 * Send email notification to a tenant
 * @param email - Tenant's email address
 * @param subject - Email subject
 * @param message - Email message body
 * @returns Promise with success status
 */
export const sendEmailNotification = async (
  email: string,
  subject: string,
  message: string
): Promise<NotificationResult> => {
  try {
    console.log('Calling send-email Edge Function with:', { email, subject, messageLength: message.length });
    
    // Use Supabase Edge Function for email sending
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: subject,
        message: message,
      },
    });

    console.log('Edge Function response:', { data, error });

    if (error) {
      console.error('Error calling email function:', error);
      return { success: false, error };
    }

    // Check if the function returned an error
    if (data && !data.success) {
      console.error('Email function returned error:', data.error);
      return { success: false, error: data.error || 'Unknown error' };
    }

    console.log('Email sent successfully via Edge Function');
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error };
  }
};

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string | null {
  if (!phone || phone === 'N/A') {
    return null;
  }

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

  return null;
}

/**
 * Send SMS notification to a tenant via TextBee API (direct call, no Edge Function)
 * @param phoneNumber - Tenant's phone number (will be formatted to E.164)
 * @param message - SMS message body
 * @returns Promise with success status
 */
export const sendSMSNotification = async (
  phoneNumber: string,
  message: string
): Promise<NotificationResult> => {
  try {
    // Validate phone number
    if (!phoneNumber || phoneNumber === 'N/A' || phoneNumber.trim().length === 0) {
      console.warn('Invalid or missing phone number:', phoneNumber);
      return { success: false, error: 'Invalid or missing phone number' };
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      console.warn('Invalid or empty message');
      return { success: false, error: 'Message cannot be empty' };
    }

    // Get TextBee API credentials from environment
    const apiKey = import.meta.env.VITE_TEXTBEE_API_KEY;
    const deviceId = import.meta.env.VITE_TEXTBEE_DEVICE_ID;

    if (!apiKey) {
      console.error('TextBee API key not configured');
      return { success: false, error: 'TextBee API key not configured. Please set VITE_TEXTBEE_API_KEY in your .env file' };
    }

    if (!deviceId) {
      console.error('TextBee Device ID not configured');
      return { success: false, error: 'TextBee Device ID not configured. Please set VITE_TEXTBEE_DEVICE_ID in your .env file' };
    }

    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone) {
      return { success: false, error: `Invalid phone number format: ${phoneNumber}. Please provide a valid phone number.` };
    }

    console.log('Calling TextBee API directly with:', { 
      phoneNumber: formattedPhone, 
      messageLength: message.length 
    });

    // Call TextBee API directly
    const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`;
    
    const response = await fetch(textbeeUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: [formattedPhone],
        message: message,
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
      console.error('TextBee API error:', errorMessage);
      return { success: false, error: errorMessage };
    }

    // Parse successful response
    let result;
    try {
      result = await response.json();
    } catch {
      result = { success: true };
    }

    console.log('SMS sent successfully via TextBee API');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error sending SMS notification:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

