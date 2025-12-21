# SMS Integration - Deployment Guide

## Quick Start

The SMS integration code is complete! Follow these steps to deploy and activate it.

## Step 1: Deploy the SMS Edge Function

### Option A: Using Supabase CLI

```bash
# Make sure you're in the project root
cd /Users/cnvaay/PrimeLiving

# Deploy the SMS edge function
supabase functions deploy send-sms
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click **Create a new function**
4. Name it `send-sms`
5. Copy the contents from `supabase/functions/send-sms/index.ts`
6. Paste into the editor and save

## Step 2: Configure Environment Variables

You need to set two environment variables in Supabase:

### In Supabase Dashboard:

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the following secrets:

   **Secret 1:**
   - Name: `TEXTBEE_API_KEY`
   - Value: Your TextBee API key (from your TextBee dashboard)

   **Secret 2:**
   - Name: `TEXTBEE_DEVICE_ID`
   - Value: Your TextBee device ID (from your TextBee dashboard)

### Finding Your TextBee Credentials:

1. Log in to your TextBee dashboard at https://app.textbee.dev
2. Go to your device settings
3. Find your **API Key** and **Device ID**
4. Copy these values to the Supabase secrets

## Step 3: Test the Integration

### Test via Apartment Manager Dashboard:

1. Log in to your Apartment Manager Dashboard
2. Navigate to the **Notifications** tab
3. Compose a notification
4. Select **SMS Only** or **SMS + Email** as delivery method
5. Select a tenant with a valid phone number
6. Send the notification
7. Check if the SMS is received

### Test Phone Number Format:

The function automatically formats phone numbers. It supports:
- Philippines: `09123456789` → `+639123456789`
- US/Canada: `1234567890` → `+11234567890`
- Already formatted: `+1234567890` → `+1234567890`

## Step 4: Verify Everything Works

### Checklist:

- [ ] Edge function deployed successfully
- [ ] Environment variables configured
- [ ] Test SMS sent successfully
- [ ] SMS received on test phone
- [ ] Notification saved to database
- [ ] Error handling works (test with invalid phone number)

## Troubleshooting

### SMS Not Sending?

1. **Check Edge Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → `send-sms` → Logs
   - Look for error messages

2. **Verify Environment Variables:**
   - Make sure `TEXTBEE_API_KEY` and `TEXTBEE_DEVICE_ID` are set correctly
   - Check for typos in the secret names

3. **Check TextBee Device Status:**
   - Log in to TextBee dashboard
   - Verify your device is connected and active
   - Check if you have sufficient credits/quota

4. **Phone Number Format:**
   - Ensure phone numbers are valid
   - Check the logs to see what format was sent
   - The function will return an error if it can't format the number

### Common Errors:

**Error: "TextBee API not configured"**
- Solution: Make sure both `TEXTBEE_API_KEY` and `TEXTBEE_DEVICE_ID` are set in Supabase secrets

**Error: "Invalid phone number format"**
- Solution: Check the phone number format. The function tries to auto-format, but some formats may not be supported.

**Error: "Failed to send SMS via TextBee"**
- Solution: Check TextBee API status, verify device is connected, check API key validity

## Code Files Created/Modified

### New Files:
- `supabase/functions/send-sms/index.ts` - SMS Edge Function

### Modified Files:
- `src/lib/notificationService.ts` - Updated `sendSMSNotification` function

## Next Steps After Deployment

1. **Monitor Usage:**
   - Check Supabase Edge Function logs regularly
   - Monitor TextBee dashboard for message delivery

2. **Optimize:**
   - Consider implementing delivery status tracking
   - Add SMS templates for common messages
   - Implement rate limiting if needed

3. **Enhance:**
   - Add two-way SMS support (receiving replies)
   - Implement scheduled SMS
   - Add bulk SMS optimization

## Support

If you encounter issues:
1. Check the Edge Function logs in Supabase
2. Review the TextBee API documentation: https://api.textbee.dev/
3. Check the integration plan: `SMS_INTEGRATION_PLAN.md`

---

**Ready to deploy!** 🚀

