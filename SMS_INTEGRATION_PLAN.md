# SMS Integration Plan - TextBee API

## Overview

This document outlines the plan for integrating TextBee SMS API (https://api.textbee.dev/) into the PrimeLiving application. The integration will enable sending SMS notifications to tenants through the existing notification system.

## Current State

### Existing Implementation
- ✅ SMS notification function stub exists in `src/lib/notificationService.ts` (`sendSMSNotification`)
- ✅ ApartmentManagerDashboard already calls `sendSMSNotification` when sending notifications
- ✅ Notification system saves messages to database regardless of delivery method
- ✅ Email integration is already working via Supabase Edge Function (`supabase/functions/send-email/index.ts`)
- ✅ TextBee account is configured and already sending messages

### What Needs to Be Done
1. Create a Supabase Edge Function for SMS (similar to the email function)
2. Update `notificationService.ts` to call the SMS edge function
3. Configure environment variables for TextBee API credentials
4. Test SMS sending functionality

## TextBee API Details

### API Endpoint
```
POST https://api.textbee.dev/api/v1/gateway/devices/{DEVICE_ID}/send-sms
```

### Authentication
- Header: `x-api-key: YOUR_API_KEY`

### Request Body
```json
{
  "recipients": ["+1234567890"],
  "message": "Your message here"
}
```

### Response
- Success: Returns message ID or success status
- Error: Returns error message with details

## Implementation Steps

### Step 1: Create Supabase Edge Function for SMS

**File:** `supabase/functions/send-sms/index.ts`

**Purpose:** Handle SMS sending via TextBee API, similar to the email function

**Key Features:**
- Accept phone number and message from request body
- Validate phone number format
- Call TextBee API with proper authentication
- Handle errors gracefully
- Return success/error response
- Support CORS for browser requests

**Required Environment Variables:**
- `TEXTBEE_API_KEY` - Your TextBee API key
- `TEXTBEE_DEVICE_ID` - Your TextBee device ID

### Step 2: Update Notification Service

**File:** `src/lib/notificationService.ts`

**Changes:**
- Uncomment and update the `sendSMSNotification` function
- Replace placeholder code with actual Supabase Edge Function call
- Add proper error handling
- Format phone numbers to ensure they're in the correct format (E.164 format recommended)

**Phone Number Formatting:**
- Ensure phone numbers are in E.164 format (e.g., `+1234567890`)
- Handle various input formats and normalize them
- Validate phone numbers before sending

### Step 3: Configure Environment Variables

**Supabase Dashboard:**
1. Go to Project Settings → Edge Functions → Secrets
2. Add the following secrets:
   - `TEXTBEE_API_KEY` - Your TextBee API key
   - `TEXTBEE_DEVICE_ID` - Your TextBee device ID

**Local Development (.env file):**
- Add these variables for local testing (if needed)

### Step 4: Deploy Edge Function

**Commands:**
```bash
# Deploy the SMS edge function
supabase functions deploy send-sms
```

**Or via Supabase Dashboard:**
- Upload the function through the Supabase dashboard

### Step 5: Testing

**Test Scenarios:**
1. ✅ Send SMS to a single tenant
2. ✅ Send SMS to multiple tenants (bulk)
3. ✅ Send SMS + Email combination
4. ✅ Handle invalid phone numbers gracefully
5. ✅ Handle API errors (rate limits, invalid credentials, etc.)
6. ✅ Verify notifications are saved to database even if SMS fails
7. ✅ Test with different phone number formats

## Technical Implementation Details

### Edge Function Structure

```typescript
// Similar structure to send-email function
- CORS handling
- Authentication check
- Request validation
- Phone number formatting
- TextBee API call
- Error handling
- Response formatting
```

### Phone Number Handling

**Considerations:**
- TextBee expects phone numbers in E.164 format
- Current tenant data may have various formats
- Need to normalize phone numbers before sending
- Handle cases where phone number is missing or invalid

**Format Examples:**
- `09123456789` → `+639123456789` (Philippines)
- `+1-234-567-8900` → `+12345678900` (US)
- `(123) 456-7890` → `+12345678900`

### Error Handling Strategy

1. **Invalid Phone Number:**
   - Log warning
   - Skip SMS for that tenant
   - Continue with other tenants
   - Still save notification to database

2. **API Errors:**
   - Log error details
   - Return error to caller
   - Allow notification to be saved to database
   - Show user-friendly error message

3. **Rate Limiting:**
   - Handle rate limit errors gracefully
   - Potentially implement retry logic
   - Queue messages if needed

### Message Length Considerations

- SMS messages have a 160-character limit for single messages
- Longer messages are split into multiple parts
- TextBee handles message splitting automatically
- Consider truncating very long messages or splitting them

## File Structure

```
supabase/
  functions/
    send-sms/
      index.ts          # New SMS edge function
    send-email/
      index.ts          # Existing email function (reference)

src/
  lib/
    notificationService.ts  # Update sendSMSNotification function
```

## Environment Variables Checklist

### Required in Supabase Edge Function Secrets:
- [ ] `TEXTBEE_API_KEY` - Your TextBee API key
- [ ] `TEXTBEE_DEVICE_ID` - Your TextBee device ID

### Optional (for local development):
- Add to `.env` file if testing locally

## Integration Points

### 1. ApartmentManagerDashboard.tsx
- Already calls `sendSMSNotification` when delivery method includes SMS
- No changes needed here initially
- May need updates for better error display

### 2. notificationService.ts
- Main integration point
- Update `sendSMSNotification` function
- Add phone number formatting utility

### 3. Database
- Notifications are already saved to database
- No database changes needed
- May want to track SMS delivery status in the future

## Future Enhancements (Post-Integration)

1. **Delivery Status Tracking:**
   - Track SMS delivery status
   - Store delivery receipts in database
   - Show delivery status in UI

2. **SMS Templates:**
   - Pre-defined SMS message templates
   - Variable substitution (tenant name, unit number, etc.)

3. **Scheduled SMS:**
   - Schedule SMS messages for future delivery
   - Integration with existing schedule functionality

4. **Two-Way SMS:**
   - Receive SMS replies from tenants
   - Handle incoming messages via webhook
   - TextBee supports receiving SMS

5. **Bulk SMS Optimization:**
   - Batch API calls for better performance
   - Rate limiting and queuing
   - Progress tracking for large batches

6. **Phone Number Validation:**
   - Validate phone numbers before saving
   - Format phone numbers on tenant creation
   - Show validation errors in UI

## Testing Checklist

### Unit Tests
- [ ] Phone number formatting function
- [ ] Edge function request validation
- [ ] Error handling scenarios

### Integration Tests
- [ ] Send SMS to single tenant
- [ ] Send SMS to multiple tenants
- [ ] SMS + Email combination
- [ ] Invalid phone number handling
- [ ] API error handling

### Manual Testing
- [ ] Test with real phone numbers
- [ ] Verify messages are received
- [ ] Check notification appears in tenant dashboard
- [ ] Test error scenarios
- [ ] Verify database records are created

## Security Considerations

1. **API Key Security:**
   - Never expose API keys in client-side code
   - Store keys only in Supabase Edge Function secrets
   - Rotate keys periodically

2. **Phone Number Privacy:**
   - Ensure phone numbers are handled securely
   - Don't log full phone numbers in production
   - Comply with data protection regulations

3. **Rate Limiting:**
   - Implement rate limiting to prevent abuse
   - Monitor API usage
   - Set up alerts for unusual activity

## Rollout Plan

### Phase 1: Development
1. Create SMS edge function
2. Update notification service
3. Test locally (if possible)

### Phase 2: Staging
1. Deploy to Supabase
2. Configure environment variables
3. Test with real TextBee account
4. Verify end-to-end flow

### Phase 3: Production
1. Deploy to production
2. Monitor initial usage
3. Gather feedback
4. Iterate based on feedback

## Support and Troubleshooting

### Common Issues

1. **SMS Not Sending:**
   - Check API key and device ID
   - Verify phone number format
   - Check TextBee dashboard for device status
   - Review edge function logs

2. **Invalid Phone Numbers:**
   - Implement phone number validation
   - Format phone numbers correctly
   - Handle country codes properly

3. **API Errors:**
   - Check TextBee API status
   - Verify account has sufficient credits
   - Review rate limits
   - Check edge function logs

### Debugging

- Check Supabase Edge Function logs
- Review browser console for client-side errors
- Check TextBee dashboard for message status
- Verify environment variables are set correctly

## Resources

- TextBee API Documentation: https://api.textbee.dev/
- TextBee Quickstart: https://textbee.dev/quickstart
- Supabase Edge Functions Docs: https://supabase.com/docs/guides/functions
- Existing Email Function: `supabase/functions/send-email/index.ts` (reference)

## Notes

- The user mentioned they already have TextBee configured and it's sending messages, so the API credentials should be available
- The integration follows the same pattern as the existing email integration
- Phone number formatting is critical for successful delivery
- Error handling should be robust to ensure notifications are always saved to the database

## Next Steps

1. ✅ Review this plan
2. ✅ Create SMS edge function (`supabase/functions/send-sms/index.ts`)
3. ✅ Update notification service (`src/lib/notificationService.ts`)
4. ⏳ Configure environment variables (TEXTBEE_API_KEY, TEXTBEE_DEVICE_ID)
5. ⏳ Deploy SMS edge function to Supabase
6. ⏳ Test SMS sending with real phone numbers
7. ⏳ Monitor and iterate

---

**Last Updated:** [Current Date]
**Status:** Implementation Complete - Ready for Deployment
**Owner:** Development Team

## Implementation Status

### ✅ Completed
- [x] Created SMS Edge Function at `supabase/functions/send-sms/index.ts`
- [x] Updated `sendSMSNotification` in `src/lib/notificationService.ts`
- [x] Added phone number formatting utility (handles Philippines, US/Canada formats)
- [x] Implemented error handling and validation
- [x] Added CORS support for browser requests

### ⏳ Pending
- [ ] Deploy edge function to Supabase
- [ ] Configure environment variables in Supabase dashboard
- [ ] Test with real phone numbers
- [ ] Verify end-to-end flow
