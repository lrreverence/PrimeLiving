// Supabase Edge Function for inviting apartment managers
// Creates a user account and sends an invitation email with password setup link

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
    // Parse request body first to get better error messages
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body. Expected JSON.',
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
      });
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
          hint: 'Please set these environment variables in Supabase Edge Function secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Extract data from request body
    const { first_name, last_name, email, contact_number, branch } = requestBody;

    // Validate required fields
    const missingFields: string[] = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!branch) missingFields.push('branch');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received: { first_name: !!first_name, last_name: !!last_name, email: !!email, branch: !!branch }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if apartment manager with this email already exists
    const { data: existingManager, error: checkError } = await supabaseAdmin
      .from('apartment_managers')
      .select('apartment_manager_id, email, user_id')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
      console.error('Error checking existing manager:', checkError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check if email already exists',
          details: checkError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (existingManager) {
      return new Response(
        JSON.stringify({ 
          error: `Apartment manager with email ${email} already exists`,
          hint: 'Please use a different email address or update the existing manager'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables for email service
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'noreply@caesarisidrovaay.online';
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://prime-living-eosin.vercel.app';
    const useResend = !!RESEND_API_KEY;

    let userData;
    let userError;

    if (useResend) {
      // Use custom email flow with Resend
      console.log('Using Resend for invitation email');
      const result = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: false, // Keep unconfirmed so we can send signup link
        user_metadata: {
          name: `${first_name} ${last_name}`,
          role: 'apartment_manager',
          uiRole: 'apartment_manager',
          branch: branch
        }
      });
      userData = result.data;
      userError = result.error;
    } else {
      // Use Supabase's default email
      console.log('Using Supabase default invitation email');
      const result = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            name: `${first_name} ${last_name}`,
            role: 'apartment_manager',
            uiRole: 'apartment_manager',
            branch: branch
          },
          redirectTo: `${SITE_URL}/setup-password`
        }
      );
      userData = result.data;
      userError = result.error;
    }

    if (userError) {
      console.error('Error creating user:', userError);
      console.error('User error details:', JSON.stringify(userError, null, 2));
      
      // Provide more specific error messages
      let errorMessage = `Failed to create user: ${userError.message}`;
      if (userError.message?.includes('already registered')) {
        errorMessage = `User with email ${email} already exists. Please use a different email.`;
      } else if (userError.message?.includes('Invalid email')) {
        errorMessage = `Invalid email address: ${email}`;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: userError.message,
          code: userError.status || userError.code
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user: No user data returned' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use upsert to handle case where record might already exist
    // This will insert if new, or update if email already exists
    const { error: managerError } = await supabaseAdmin
      .from('apartment_managers')
      .upsert({
        user_id: userData.user.id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        contact_number: contact_number || null,
        branch: branch,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      });

    if (managerError) {
      // If apartment manager creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      console.error('Error upserting apartment manager:', managerError);
      
      // Provide more specific error messages
      let errorMessage = `Failed to create/update apartment manager record: ${managerError.message}`;
      if (managerError.code === '23505') { // Unique constraint violation
        errorMessage = `Email ${email} already exists in the system. Please use a different email address.`;
      } else if (managerError.code === '23503') { // Foreign key violation
        errorMessage = `Invalid reference. Please check that all related data is valid.`;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: managerError.message,
          code: managerError.code,
          hint: managerError.code === '23505' ? 'The email address is already registered. Try a different email or check if the manager already exists.' : undefined
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send custom email with Resend (only if using Resend flow)
    if (useResend) {
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: `${SITE_URL}/setup-password`
        }
      });

      if (inviteError) {
        console.error('Error generating invite link:', inviteError);
        // Clean up: delete the created user
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate invitation link',
            details: inviteError.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const invitationLink = inviteData?.properties?.action_link;

      if (!invitationLink) {
        console.error('No invitation link generated');
        // Clean up: delete the created user
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate invitation link'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Sending invitation email via Resend to:', email);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Prime Living</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed;">Welcome to Prime Living!</h1>
            <p>Hello ${first_name} ${last_name},</p>
            <p>You have been invited to join Prime Living as an Apartment Manager for the <strong>${branch}</strong> branch.</p>
            <p>Please click the link below to set up your password and activate your account:</p>
            <p style="margin: 30px 0;">
              <a href="${invitationLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Up Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${invitationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Prime Living - Property Management System</p>
          </div>
        </body>
        </html>
      `;

      const emailText = `
Welcome to Prime Living!

Hello ${first_name} ${last_name},

You have been invited to join Prime Living as an Apartment Manager for the ${branch} branch.

Please click the link below to set up your password and activate your account:

${invitationLink}

This link will expire in 24 hours.

If you did not expect this invitation, please ignore this email.

Prime Living - Property Management System
      `;

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [email],
          subject: 'Welcome to Prime Living - Set Up Your Account',
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        console.error('Resend API error:', errorData);

        // Delete the created user since email failed
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);

        return new Response(
          JSON.stringify({
            error: 'Failed to send invitation email',
            details: errorData,
            hint: 'Please check your Resend API key and email configuration'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Invitation email sent successfully via Resend');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: useResend
          ? 'Apartment manager created and custom invitation email sent via Resend'
          : 'Apartment manager created and invitation email sent via Supabase',
        user_id: userData.user.id,
        email_service: useResend ? 'resend' : 'supabase'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in invite-apartment-manager function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage || 'Internal server error',
        details: errorStack,
        type: error instanceof Error ? error.constructor.name : typeof error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

