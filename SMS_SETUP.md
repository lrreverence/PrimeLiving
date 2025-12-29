# SMS Integration with TextBee

This project uses TextBee SMS Gateway to send SMS messages. TextBee turns your Android phone into an SMS gateway.

## Setup

### 1. Environment Variables

The TextBee API key has been added to `.env`:

```
VITE_TEXTBEE_API_KEY=17c64908-cb67-4062-adca-0d502ef47a54
```

**Optional:** If you have a specific device ID, you can also add:
```
VITE_TEXTBEE_DEVICE_ID=your-device-id
```

### 2. TextBee Device Registration

Before sending SMS, you need to:

1. **Create a TextBee account** at [textbee.dev](https://textbee.dev)
2. **Install the TextBee Android app** from [dl.textbee.dev](https://dl.textbee.dev)
3. **Register your device**:
   - Go to TextBee Dashboard
   - Click "Register Device"
   - Scan QR code with the app OR manually enter your API key in the app

### 3. Testing SMS

#### Option A: Test Page (Recommended)

1. Start the development server: `bun run dev`
2. Navigate to: `http://localhost:5173/test-sms`
3. Click "Load Devices" to fetch your registered devices
4. Select a device from the dropdown
5. Enter phone number: `09301531356`
6. Click "Send Test SMS"

#### Option B: Browser Console

In the browser console (after the app loads), you can use:

```javascript
// Test SMS to a phone number
window.testSMS('09301531356')

// Or with a specific device ID
window.testSMS('09301531356', 'your-device-id')

// Access the SMS service directly
window.smsService.sendSMS({
  recipients: ['09301531356'],
  message: 'Your message here',
  deviceId: 'optional-device-id'
})
```

## Usage in Code

### Basic Usage

```typescript
import { smsService } from '@/services/smsService'

// Send SMS
const result = await smsService.sendSMS({
  recipients: ['09301531356'],
  message: 'Emergency alert: Incident reported in your area',
  deviceId: 'optional-device-id' // Uses env var if not provided
})

if (result.success) {
  console.log('SMS sent successfully!')
} else {
  console.error('Failed to send SMS:', result.error)
}
```

### Phone Number Formatting

The service automatically formats phone numbers:
- `09301531356` → `+639301531356`
- `+639301531356` → `+639301531356` (no change)
- Removes non-digit characters except `+`

### List Devices

```typescript
const devices = await smsService.listDevices()
console.log('Available devices:', devices)
```

### Get Received SMS

```typescript
const messages = await smsService.getReceivedSMS(deviceId)
console.log('Received messages:', messages)
```

## API Reference

### `smsService.sendSMS(options)`

Send an SMS message.

**Parameters:**
- `recipients: string[]` - Array of phone numbers
- `message: string` - Message content
- `deviceId?: string` - Optional device ID (uses env var if not provided)

**Returns:** `Promise<SMSResponse>`

### `smsService.listDevices()`

List all registered TextBee devices.

**Returns:** `Promise<any>` - Array of device objects

### `smsService.getReceivedSMS(deviceId?)`

Get received SMS messages from a device.

**Parameters:**
- `deviceId?: string` - Optional device ID

**Returns:** `Promise<any>` - Array of received messages

### `smsService.testSMS(phoneNumber, deviceId?)`

Send a test SMS message.

**Parameters:**
- `phoneNumber: string` - Phone number to test
- `deviceId?: string` - Optional device ID

**Returns:** `Promise<SMSResponse>`

## Integration Examples

### Send SMS on Incident Creation

```typescript
// In incidentService.ts or similar
import { smsService } from '@/services/smsService'

async function notifyDispatchers(incident: Incident) {
  const dispatchers = await getDispatchers()
  
  for (const dispatcher of dispatchers) {
    if (dispatcher.phone_number) {
      await smsService.sendSMS({
        recipients: [dispatcher.phone_number],
        message: `New ${incident.incident_type} incident reported: ${incident.title}. Location: ${incident.location_address}`
      })
    }
  }
}
```

### Send Emergency Alert

```typescript
await smsService.sendSMS({
  recipients: ['09301531356', '09171234567'],
  message: '🚨 EMERGENCY ALERT: Critical incident reported in your area. Please respond immediately.'
})
```

## Troubleshooting

### "Device ID is required" Error

1. Make sure you've registered a device in the TextBee dashboard
2. Click "Load Devices" on the test page to get your device ID
3. Add `VITE_TEXTBEE_DEVICE_ID` to your `.env` file

### CORS Errors

If you encounter CORS errors when calling the API from the browser, you may need to:
1. Create a Supabase Edge Function to proxy the requests
2. Or configure CORS on the TextBee API (if available)

### SMS Not Sending

1. Check that your TextBee device is connected and online
2. Verify the API key is correct in `.env`
3. Check the browser console for detailed error messages
4. Ensure your Android phone has SMS permissions enabled

## Documentation

- [TextBee Quickstart Guide](https://textbee.dev/quickstart)
- [TextBee API Documentation](https://textbee.dev/docs)

## Notes

- SMS messages are sent through your Android device using your mobile plan
- No additional per-message fees from TextBee (uses your carrier rates)
- Make sure your Android device has internet connection and SMS permissions
- Device must be registered and connected to send messages

