import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Smartphone, Info } from 'lucide-react';
import { smsService, type Device } from '@/lib/smsService';
import { useToast } from '@/hooks/use-toast';

const TestSMS = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('09301531356');
  const [message, setMessage] = useState<string>('Test SMS from PrimeLiving - SMS service is working! 📱');
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [envDeviceId, setEnvDeviceId] = useState<string>('');
  const { toast } = useToast();

  // Check for device ID in environment on mount
  useEffect(() => {
    const deviceId = smsService.getDeviceId() || '';
    setEnvDeviceId(deviceId);
    if (deviceId) {
      setSelectedDeviceId(deviceId);
    }
  }, []);

  const handleLoadDevices = async () => {
    setLoadingDevices(true);
    setResult(null);
    try {
      const deviceList = await smsService.listDevices();
      setDevices(deviceList);
      
      if (deviceList.length > 0) {
        setSelectedDeviceId(deviceList[0].id);
        toast({
          title: 'Devices loaded',
          description: `Found ${deviceList.length} device(s)`,
        });
      } else {
        toast({
          title: 'No devices found',
          description: 'Please register a device in the TextBee dashboard',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error loading devices:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to load devices',
      });
      toast({
        title: 'Error',
        description: error.message || 'Failed to load devices',
        variant: 'destructive',
      });
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleSendTestSMS = async () => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Use selected device ID if available, otherwise service will use env device ID
      const response = await smsService.sendSMS({
        recipients: [phoneNumber],
        message: message,
        deviceId: selectedDeviceId || undefined,
      });

      if (response.success) {
        setResult({
          success: true,
          message: 'SMS sent successfully!',
        });
        toast({
          title: 'Success',
          description: 'SMS sent successfully!',
        });
      } else {
        setResult({
          success: false,
          message: response.error || 'Failed to send SMS',
        });
        toast({
          title: 'Error',
          description: response.error || 'Failed to send SMS',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to send SMS',
      });
      toast({
        title: 'Error',
        description: error.message || 'Failed to send SMS',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SMS Test Page</h1>
        <p className="text-muted-foreground">
          Test your TextBee SMS integration. Make sure you've registered a device in the TextBee dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Configuration
          </CardTitle>
          <CardDescription>
            Load your registered TextBee devices and send test messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Status */}
          {envDeviceId && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Using device ID from environment: <code className="bg-muted px-1 rounded">{envDeviceId}</code>
              </AlertDescription>
            </Alert>
          )}

          {/* Load Devices Section */}
          <div className="space-y-2">
            <Label>Devices (Optional)</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleLoadDevices}
                disabled={loadingDevices}
                variant="outline"
                className="flex-1"
              >
                {loadingDevices ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Devices'
                )}
              </Button>
            </div>
            {devices.length > 0 && (
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name || device.id} {device.status && `(${device.status})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!envDeviceId && devices.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No device ID found. Set VITE_TEXTBEE_DEVICE_ID in your .env file or load devices above.
              </p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="09301531356"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter phone number (e.g., 09301531356 or +639301531356)
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your test message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTestSMS}
            disabled={loading || !phoneNumber || !message}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Send Test SMS
              </>
            )}
          </Button>

          {/* Result Alert */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Info Section */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Quick Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Make sure your TextBee device is registered and online</li>
              <li>Phone numbers are automatically formatted to E.164 format</li>
              <li>You can also test SMS from the browser console using: <code className="bg-muted px-1 rounded">window.testSMS('09301531356')</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestSMS;

