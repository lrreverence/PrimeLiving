# Edge Function Deployment Guide - Invite Apartment Manager

## Issue
If you're seeing the error: "Failed to send invitation: failed to send a request to the edge function", it means the edge function hasn't been deployed yet.

## Solution: Deploy the Edge Function

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/your-project-ref`

4. **Deploy the function**:
   ```bash
   supabase functions deploy invite-apartment-manager
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click **Create a new function**
4. Name it: `invite-apartment-manager`
5. Copy the contents from `supabase/functions/invite-apartment-manager/index.ts`
6. Paste into the editor and click **Deploy**

## Required Environment Variables

After deploying, you need to set these environment variables in Supabase:

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the following secrets:

   **SUPABASE_URL** (usually auto-configured, but verify):
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   **SUPABASE_SERVICE_ROLE_KEY** (usually auto-configured, but verify):
   - Value: Your Supabase service role key (found in Project Settings → API)

   **SITE_URL** (optional, for custom redirect URLs):
   - Value: Your site URL (e.g., `https://yourdomain.com` or `http://localhost:5173` for development)

   **RESEND_API_KEY** (optional, if you want custom emails):
   - Value: Your Resend API key (if using custom email templates)

   **EMAIL_FROM** (optional, if using Resend):
   - Value: Your verified sender email (e.g., `noreply@yourdomain.com`)

## Verify Deployment

After deploying, test the function:

1. Go to your Super Admin Dashboard
2. Try adding a new apartment manager
3. Check that the invitation email is sent successfully

## Troubleshooting

### Function still not found after deployment
- Make sure the function name matches exactly: `invite-apartment-manager`
- Check that you're deploying to the correct project
- Wait a few seconds after deployment for the function to be available

### Permission errors
- Make sure the `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- The service role key has admin privileges needed to create users

### Email not sending
- Supabase's `inviteUserByEmail` automatically sends an email
- If emails aren't arriving, check:
  - Supabase email settings in Authentication → Email Templates
  - Spam folder
  - Email provider settings

