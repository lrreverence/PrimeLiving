/**
 * Notification Service
 * 
 * This service handles sending notifications via Email and SMS.
 * 
 * Current Implementation:
 * - Notifications are saved to the database and appear in tenant dashboards
 * - Email sending via Supabase Edge Function (Resend/SendGrid)
 * - SMS sending via Supabase Edge Function (TextBee API)
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
 * Send SMS notification to a tenant via TextBee API
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

    console.log('Calling send-sms Edge Function with:', { 
      phoneNumber, 
      messageLength: message.length 
    });
    
    // Use Supabase Edge Function for SMS sending via TextBee
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        to: phoneNumber,
        message: message,
      },
    });

    console.log('SMS Edge Function response:', { data, error });

    if (error) {
      console.error('Error calling SMS function:', error);
      return { success: false, error };
    }

    // Check if the function returned an error
    if (data && !data.success) {
      console.error('SMS function returned error:', data.error);
      return { success: false, error: data.error || 'Unknown error' };
    }

    console.log('SMS sent successfully via Edge Function');
    return { success: true, data };
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return { success: false, error };
  }
};

