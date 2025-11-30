// Supabase Edge Function for sending email notifications
// This function can be used with various email providers (SendGrid, Resend, AWS SES, etc.)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { to, subject, message } = await req.json();

    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Option 1: Use Resend (Recommended - Easy setup, good free tier, works without custom domain)
    // Get API key from environment variable
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (RESEND_API_KEY) {
      // Resend allows using their test domain without verification
      // Use onboarding@resend.dev for testing, or your verified domain if you have one
      const fromEmail = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';
      
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: message.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
          text: message, // Plain text version
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        console.error('Resend API error:', errorData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to send email via Resend',
            details: errorData 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const result = await resendResponse.json();
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.id,
          provider: 'resend'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Option 2: Use SendGrid (Alternative - requires sender verification)
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    if (SENDGRID_API_KEY) {
      // SendGrid requires a verified sender email
      // For testing without domain, you can use a verified single sender
      const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'noreply@example.com';
      const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'PrimeLiving';
      
      const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { 
            email: fromEmail,
            name: fromName
          },
          subject: subject,
          content: [
            { type: 'text/plain', value: message },
            { type: 'text/html', value: message.replace(/\n/g, '<br>') }
          ],
        }),
      });

      if (!sendgridResponse.ok) {
        const errorData = await sendgridResponse.text();
        console.error('SendGrid API error:', errorData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to send email via SendGrid',
            details: errorData 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'sendgrid'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Option 3: Use Supabase's built-in email (limited, but works without external service)
    // This uses Supabase's auth email functionality
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Note: Supabase doesn't have a direct email API, but you can use it for auth emails
      // For general notifications, you'll need an external service
      // This is a placeholder - you'd need to implement your own email sending logic here
      console.log('Supabase email sending would go here (requires custom implementation)');
    }

    // If no email provider is configured, return an error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'No email provider configured. Please set RESEND_API_KEY or SENDGRID_API_KEY environment variable.',
        hint: 'Set up Resend (recommended) or SendGrid API key in Supabase Edge Function secrets'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

