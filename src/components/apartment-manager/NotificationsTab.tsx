import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Trash, FileText } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  unit: string;
  email?: string;
  contact?: string;
}

interface NotificationsTabProps {
  notificationTab: string;
  onTabChange: (value: string) => void;
  notificationType: string;
  onNotificationTypeChange: (value: string) => void;
  deliveryMethod: string;
  onDeliveryMethodChange: (value: string) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  selectedRecipients: string[];
  onRecipientChange: (recipient: string, checked: boolean) => void;
  scheduleDate: string;
  onScheduleDateChange: (value: string) => void;
  onSendNotification: () => void;
  onClearForm: () => void;
  tenants: Tenant[];
  notificationTypes: string[];
  deliveryMethods: string[];
}

export const NotificationsTab = ({
  notificationTab,
  onTabChange,
  notificationType,
  onNotificationTypeChange,
  deliveryMethod,
  onDeliveryMethodChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  selectedRecipients,
  onRecipientChange,
  scheduleDate,
  onScheduleDateChange,
  onSendNotification,
  onClearForm,
  tenants,
  notificationTypes,
  deliveryMethods
}: NotificationsTabProps) => {
  const getNotificationTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'general': 'General Notice',
      'payment': 'Payment Reminder',
      'maintenance': 'Maintenance Notice',
      'emergency': 'Emergency Alert'
    };
    return typeMap[type] || type;
  };

  const getNotificationTypeBadge = (type: string) => {
    const badgeMap: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'payment': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'emergency': 'bg-red-100 text-red-800'
    };
    return badgeMap[type] || 'bg-gray-100 text-gray-800';
  };
  return (
    <div className="space-y-6">
      {/* Notification System Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Notification System</h2>
        <p className="text-gray-600 mt-1">Send SMS and email notifications to tenants</p>
      </div>

      {/* Notification Tabs */}
      <Tabs value={notificationTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <p className="text-sm text-gray-600">Compose and send notifications to tenants via SMS or email</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Type */}
              <div>
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select value={notificationType} onValueChange={onNotificationTypeChange}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Method */}
              <div>
                <Label htmlFor="delivery-method">Delivery Method</Label>
                <Select value={deliveryMethod} onValueChange={onDeliveryMethodChange}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject/Title */}
              <div>
                <Label htmlFor="subject">Subject/Title</Label>
                <Input
                  id="subject"
                  placeholder="Enter notification title"
                  value={subject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => onMessageChange(e.target.value)}
                  className="mt-2 min-h-[120px]"
                />
              </div>

              {/* Recipients */}
              <div>
                <Label>Recipients</Label>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-tenants"
                      checked={selectedRecipients.includes('All Tenants')}
                      onCheckedChange={(checked) => onRecipientChange('All Tenants', checked as boolean)}
                    />
                    <Label htmlFor="all-tenants" className="text-sm font-normal">
                      All Tenants
                    </Label>
                  </div>
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`tenant-${tenant.id}`}
                        checked={selectedRecipients.includes(`${tenant.name}${tenant.unit !== 'N/A' ? ` (${tenant.unit})` : ''}`)}
                        onCheckedChange={(checked) => onRecipientChange(`${tenant.name}${tenant.unit !== 'N/A' ? ` (${tenant.unit})` : ''}`, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`tenant-${tenant.id}`} className="text-sm font-normal cursor-pointer">
                          {tenant.name}{tenant.unit !== 'N/A' && ` (${tenant.unit})`}
                        </Label>
                        <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                          {tenant.email && (
                            <div>📧 {tenant.email}</div>
                          )}
                          {tenant.contact && tenant.contact !== 'N/A' && (
                            <div>📱 {tenant.contact}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule for Later */}
              <div>
                <Label htmlFor="schedule">Schedule for Later (Optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  placeholder="dd/mm/yyyy --:--"
                  value={scheduleDate}
                  onChange={(e) => onScheduleDateChange(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={onSendNotification}
                  className="bg-gray-800 text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Now</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClearForm}
                  className="flex items-center space-x-2"
                >
                  <Trash className="w-4 h-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <p className="text-sm text-gray-600">View sent notifications and their status</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications sent yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

