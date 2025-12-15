// Supabase Edge Function for sending SMS notifications via TextBee API
// Documentation: https://api.textbee.dev/

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Format phone number to E.164 format
 * Handles various input formats and normalizes them
 */
function formatPhoneNumber(phone: string): string | null {
  if (!phone || phone === 'N/A') {
    return null;
  }

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If it already starts with +, return as is (assuming it's in E.164)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Handle Philippines numbers (common format: 09XXXXXXXXX)
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    return `+63${cleaned.substring(1)}`;
  }

  // Handle Philippines numbers without leading 0 (9XXXXXXXXX)
  if (cleaned.startsWith('9') && cleaned.length === 10) {
    return `+63${cleaned}`;
  }

  // Handle US/Canada numbers (10 digits)
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    return `+1${cleaned}`;
  }

  // If it's 11 digits and starts with 1, assume US/Canada
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // If no country code detected, try to add + if it's a reasonable length
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  // Return null if we can't format it
  return null;
}

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
    const { to, message } = await req.json();

    // Validate required fields
    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate message is not empty
    if (message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(to);
    
    if (!formattedPhone) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone number format',
          details: `Unable to format phone number: ${to}. Please provide a valid phone number in E.164 format (e.g., +1234567890)`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get TextBee API credentials from environment variables
    const TEXTBEE_API_KEY = Deno.env.get('TEXTBEE_API_KEY');
    const TEXTBEE_DEVICE_ID = Deno.env.get('TEXTBEE_DEVICE_ID');

    if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'TextBee API not configured',
          hint: 'Please set TEXTBEE_API_KEY and TEXTBEE_DEVICE_ID environment variables in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call TextBee API
    const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`;
    
    const textbeeResponse = await fetch(textbeeUrl, {
      method: 'POST',
      headers: {
        'x-api-key': TEXTBEE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: [formattedPhone],
        message: message,
      }),
    });

    if (!textbeeResponse.ok) {
      const errorData = await textbeeResponse.text();
      console.error('TextBee API error:', errorData);
      
      // Try to parse error response as JSON
      let errorMessage = 'Failed to send SMS via TextBee';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorData || errorMessage;
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: errorData,
          statusCode: textbeeResponse.status
        }),
        { 
          status: textbeeResponse.status >= 400 && textbeeResponse.status < 500 ? textbeeResponse.status : 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse successful response
    let result;
    try {
      result = await textbeeResponse.json();
    } catch {
      // If response is not JSON, assume success
      result = { success: true };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        provider: 'textbee',
        phoneNumber: formattedPhone,
        ...result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-sms function:', error);
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
