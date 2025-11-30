/**
 * Notification Service
 * 
 * This service handles sending notifications via Email and SMS.
 * 
 * Current Implementation:
 * - Notifications are saved to the database and appear in tenant dashboards
 * - Email/SMS sending is prepared but needs actual service integration
 * 
 * To enable actual email/SMS sending, you can:
 * 
 * 1. Email Options:
 *    - Use Supabase Edge Functions with SendGrid, AWS SES, or similar
 *    - Use Supabase's built-in email (limited functionality)
 *    - Integrate with services like Resend, Mailgun, etc.
 * 
 * 2. SMS Options:
 *    - Use Supabase Edge Functions with Twilio
 *    - Use other SMS providers like AWS SNS, MessageBird, etc.
 * 
 * Example Edge Function for Email (supabase/functions/send-email/index.ts):
 * ```typescript
 * import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 * 
 * serve(async (req) => {
 *   const { to, subject, message } = await req.json()
 *   
 *   // Use your email service here
 *   // Example with SendGrid:
 *   const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
 *     method: "POST",
 *     headers: {
 *       "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({
 *       personalizations: [{ to: [{ email: to }] }],
 *       from: { email: "noreply@primeliving.com" },
 *       subject: subject,
 *       content: [{ type: "text/plain", value: message }],
 *     }),
 *   })
 *   
 *   return new Response(JSON.stringify({ success: response.ok }), {
 *     headers: { "Content-Type": "application/json" },
 *   })
 * })
 * ```
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
    // Use Supabase Edge Function for email sending
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: subject,
        message: message,
      },
    });

    if (error) {
      console.error('Error calling email function:', error);
      return { success: false, error };
    }

    // Check if the function returned an error
    if (data && !data.success) {
      console.error('Email function returned error:', data.error);
      return { success: false, error: data.error || 'Unknown error' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error };
  }
};

/**
 * Send SMS notification to a tenant
 * NOTE: SMS functionality is saved for later implementation
 * @param phoneNumber - Tenant's phone number
 * @param message - SMS message body
 * @returns Promise with success status
 */
export const sendSMSNotification = async (
  phoneNumber: string,
  message: string
): Promise<NotificationResult> => {
  try {
    // SMS functionality saved for later implementation
    // When ready to implement, uncomment and set up:
    /*
    // Option 1: Use Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        to: phoneNumber,
        message: message,
      },
    });

    if (error) {
      console.error('Error calling SMS function:', error);
      return { success: false, error };
    }

    return { success: true };
    */

    // For now, just log (notifications are saved to database)
    // SMS will be implemented later
    console.log('SMS notification saved for later implementation:', phoneNumber);
    return { success: true };
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return { success: false, error };
  }
};

