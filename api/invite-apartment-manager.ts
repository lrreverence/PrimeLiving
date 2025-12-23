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

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists using database-level case-insensitive function
    // This is more reliable than client-side checks due to PostgreSQL's case-sensitive UNIQUE constraints
    const { data: emailCheck, error: emailCheckError } = await supabaseAdmin
      .rpc('check_email_exists_case_insensitive', { check_email: normalizedEmail })
      .single();

    if (emailCheckError) {
      console.error('Error checking existing email:', emailCheckError);
      // Fall back to direct queries if RPC fails
      const { data: existingManager } = await supabaseAdmin
        .from('apartment_managers')
        .select('email')
        .ilike('email', normalizedEmail)
        .maybeSingle();
      
      const { data: existingTenant } = await supabaseAdmin
        .from('tenants')
        .select('email')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (existingManager) {
        return res.status(400).json({
          error: `Apartment manager with email ${email} already exists`,
          hint: `Found existing email: ${existingManager.email}. Please use a different email address.`,
          existing_email: existingManager.email
        });
      }

      if (existingTenant) {
        return res.status(400).json({
          error: `Email ${email} is already registered as a tenant`,
          hint: `Found existing email: ${existingTenant.email}. Please use a different email address.`,
          existing_email: existingTenant.email
        });
      }
    } else if (emailCheck) {
      // Check results from database function
      if (emailCheck.exists_in_managers || emailCheck.manager_email) {
        return res.status(400).json({
          error: `Apartment manager with email ${email} already exists`,
          hint: `Found existing email: ${emailCheck.manager_email || email}. Please use a different email address.`,
          existing_email: emailCheck.manager_email || email
        });
      }

      if (emailCheck.exists_in_tenants || emailCheck.tenant_email) {
        return res.status(400).json({
          error: `Email ${email} is already registered as a tenant`,
          hint: `Found existing email: ${emailCheck.tenant_email || email}. Please use a different email address.`,
          existing_email: emailCheck.tenant_email || email
        });
      }
    }

    // Get SITE_URL for redirect
    const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://prime-living-eosin.vercel.app').replace(/\/$/, '');
    
    // Redirect URL where user will land after clicking email link
    // Following EMAIL_PASSWORD_SETUP_GUIDE.md: redirect to callback route first
    const redirectTo = `${SITE_URL}/auth/callback`;

    // Check if auth user already exists before inviting
    // Try to get user by email (this method may not exist in all Supabase versions)
    let existingAuthUser = null;
    try {
      const result = await supabaseAdmin.auth.admin.listUsers();
      if (result.data?.users) {
        existingAuthUser = result.data.users.find(u => 
          u.email && u.email.toLowerCase().trim() === normalizedEmail
        );
      }
    } catch (error) {
      // If listUsers fails or doesn't exist, we'll handle it in the inviteUserByEmail error
      console.log('Could not check for existing auth user, will handle in inviteUserByEmail:', error);
    }
    
    if (existingAuthUser) {
      // Check if this user already has an apartment_manager record
      const { data: existingManagerForUser } = await supabaseAdmin
        .from('apartment_managers')
        .select('email, apartment_manager_id')
        .eq('user_id', existingAuthUser.id)
        .maybeSingle();
      
      if (existingManagerForUser) {
        return res.status(400).json({
          error: `Email ${email} is already registered as an apartment manager`,
          hint: 'This email is already associated with an apartment manager account.',
          existing_email: existingManagerForUser.email
        });
      }
      
      // User exists in auth but not in apartment_managers - this is an orphaned user
      // We should delete it and create a new one, or we could reuse it
      // For safety, let's delete the orphaned user and create fresh
      console.log('Found orphaned auth user, cleaning up:', existingAuthUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
    }

    // Use Supabase's inviteUserByEmail (automatically sends invitation email)
    console.log('Inviting apartment manager with Supabase inviteUserByEmail:', normalizedEmail);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      normalizedEmail, // Use normalized email for consistency
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
      if (userError.message?.includes('already registered') || userError.message?.includes('User already registered')) {
        errorMessage = `User with email ${email} already exists in the system. Please use a different email.`;
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
    // Note: We rely on the database unique constraint to prevent duplicates
    // The checks above should catch most cases, but if there's a race condition,
    // the database constraint will catch it and we'll handle it gracefully
    // Use normalized email (already normalized above)
    const { error: managerError } = await supabaseAdmin
      .from('apartment_managers')
      .insert({
        user_id: userData.user.id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        contact_number: contact_number ? contact_number.trim() : null,
        branch: branch.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (managerError) {
      console.error('Error creating apartment manager:', managerError);
      
      // Check if this is a duplicate key error
      const isDuplicateError = managerError.message?.includes('duplicate key') || 
          managerError.message?.includes('unique constraint') || 
          managerError.message?.includes('landlords_email_key') ||
          managerError.message?.includes('apartment_managers_email_lower_unique') ||
          managerError.code === '23505';
      
      if (isDuplicateError) {
        // Check if the record actually exists now (might have been created by concurrent request)
        const { data: existingRecord } = await supabaseAdmin
          .from('apartment_managers')
          .select('email, apartment_manager_id, user_id')
          .ilike('email', normalizedEmail)
          .maybeSingle();
        
        if (existingRecord) {
          // Record exists - check if it was created by our user_id (success case) or another request
          if (existingRecord.user_id === userData.user.id) {
            // Our record was created! This is actually success, just a timing issue
            return res.status(200).json({
              success: true,
              message: 'Apartment manager created and invitation email sent via Supabase',
              user_id: userData.user.id,
              email_service: 'supabase',
              note: 'Record was created successfully (duplicate error was a false positive)'
            });
          } else {
            // Record exists with different user_id - legitimate duplicate
            // Clean up our auth user since the record belongs to someone else
            await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
            return res.status(400).json({
              error: `Email ${email} is already registered${existingRecord.email !== normalizedEmail ? ` (found as: ${existingRecord.email})` : ''}. Please use a different email address.`,
              hint: 'This email address is already in use. Please use a different email address.',
              existing_email: existingRecord.email
            });
          }
        } else {
          // Duplicate error but record doesn't exist - this is a race condition
          // The record might have been created and deleted, or there's a timing issue
          // Clean up auth user and suggest retry
          await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
          return res.status(400).json({
            error: `Email ${email} registration encountered a conflict. Please try again.`,
            hint: 'This may have been a temporary conflict. Please wait a moment and try again.',
            details: managerError.message
          });
        }
      } else {
        // Not a duplicate error - some other issue
        // Clean up auth user
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        return res.status(400).json({
          error: `Failed to create apartment manager record: ${managerError.message}`,
          details: managerError.message,
          code: managerError.code,
          hint: 'Please try again or contact support if the issue persists.'
        });
      }
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

