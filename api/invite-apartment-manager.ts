// Vercel Serverless Function for inviting apartment managers
// Uses Supabase Auth's inviteUserByEmail method (following EMAIL_PASSWORD_SETUP_GUIDE.md)

import { createClient } from '@supabase/supabase-js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req: any, res: any) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).setHeader('Access-Control-Allow-Origin', '*');
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
      });
      return res.status(500).json({
        error: 'Server configuration error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
        hint: 'Please set these environment variables in Vercel project settings'
      });
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
    const { first_name, last_name, email, contact_number, branch } = req.body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!branch) missingFields.push('branch');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        received: { 
          first_name: !!first_name, 
          last_name: !!last_name, 
          email: !!email, 
          branch: !!branch 
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if apartment manager with this email already exists
    const { data: existingManager, error: checkError } = await supabaseAdmin
      .from('apartment_managers')
      .select('apartment_manager_id, email, user_id')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
      console.error('Error checking existing manager:', checkError);
      return res.status(500).json({
        error: 'Failed to check if email already exists',
        details: checkError.message
      });
    }

    if (existingManager) {
      return res.status(400).json({
        error: `Apartment manager with email ${email} already exists`,
        hint: 'Please use a different email address or update the existing manager'
      });
    }

    // Get SITE_URL for redirect
    const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://prime-living-eosin.vercel.app').replace(/\/$/, '');
    
    // Redirect URL where user will land after clicking email link
    // Following EMAIL_PASSWORD_SETUP_GUIDE.md: redirect to callback route first
    const redirectTo = `${SITE_URL}/auth/callback`;

    // Use Supabase's inviteUserByEmail (automatically sends invitation email)
    console.log('Inviting apartment manager with Supabase inviteUserByEmail:', email);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name: `${first_name} ${last_name}`,
          role: 'apartment_manager',
          uiRole: 'apartment_manager',
          branch: branch
        },
        redirectTo: redirectTo,
      }
    );

    if (userError) {
      console.error('Error creating user:', userError);
      
      // Provide more specific error messages
      let errorMessage = `Failed to create user: ${userError.message}`;
      if (userError.message?.includes('already registered')) {
        errorMessage = `User with email ${email} already exists. Please use a different email.`;
      } else if (userError.message?.includes('Invalid email')) {
        errorMessage = `Invalid email address: ${email}`;
      }

      return res.status(400).json({
        error: errorMessage,
        details: userError.message,
        code: userError.status || userError.code
      });
    }

    if (!userData.user) {
      return res.status(500).json({ 
        error: 'Failed to create user: No user data returned' 
      });
    }

    // Create apartment_manager record in apartment_managers table
    const { error: managerError } = await supabaseAdmin
      .from('apartment_managers')
      .insert({
        user_id: userData.user.id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        contact_number: contact_number || null,
        branch: branch,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (managerError) {
      // If apartment manager creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      console.error('Error creating apartment manager:', managerError);
      return res.status(400).json({ 
        error: `Failed to create apartment manager record: ${managerError.message}` 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Apartment manager created and invitation email sent via Supabase',
      user_id: userData.user.id,
      email_service: 'supabase'
    });
  } catch (error) {
    console.error('Error in invite-apartment-manager API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      error: errorMessage || 'Internal server error',
      details: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
  }
}

