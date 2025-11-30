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
import { Bell, Send, Trash, FileText, Plus, Edit, Copy } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  unit: string;
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
  templates?: any[];
  templatesLoading?: boolean;
  onFetchTemplates?: () => void;
  onUseTemplate?: (template: any) => void;
  onEditTemplate?: (template: any) => void;
  onDeleteTemplate?: (templateId: number) => void;
  onNewTemplate?: () => void;
  templateModalOpen?: boolean;
  onTemplateModalOpenChange?: (open: boolean) => void;
  templateForm?: {
    name: string;
    notification_type: string;
    subject: string;
    message: string;
  };
  onTemplateFormChange?: (form: any) => void;
  editingTemplate?: any;
  onSaveTemplate?: () => void;
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
  deliveryMethods,
  templates = [],
  templatesLoading = false,
  onFetchTemplates,
  onUseTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onNewTemplate,
  templateModalOpen = false,
  onTemplateModalOpenChange,
  templateForm = { name: '', notification_type: 'General Notice', subject: '', message: '' },
  onTemplateFormChange,
  editingTemplate,
  onSaveTemplate
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
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
                    <div key={tenant.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tenant-${tenant.id}`}
                        checked={selectedRecipients.includes(`${tenant.name}${tenant.unit !== 'N/A' ? ` (${tenant.unit})` : ''}`)}
                        onCheckedChange={(checked) => onRecipientChange(`${tenant.name}${tenant.unit !== 'N/A' ? ` (${tenant.unit})` : ''}`, checked as boolean)}
                      />
                      <Label htmlFor={`tenant-${tenant.id}`} className="text-sm font-normal">
                        {tenant.name}{tenant.unit !== 'N/A' && ` (${tenant.unit})`}
                      </Label>
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

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Templates</CardTitle>
                  <p className="text-sm text-gray-600">Manage reusable notification templates</p>
                </div>
                <Button onClick={onNewTemplate} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Template</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading templates...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No templates created yet</p>
                  <Button onClick={onNewTemplate} variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.template_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <Badge className={getNotificationTypeBadge(template.notification_type)}>
                              {getNotificationTypeLabel(template.notification_type)}
                            </Badge>
                          </div>
                          {template.subject && (
                            <p className="text-sm font-medium text-gray-700 mb-1">{template.subject}</p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">{template.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Created {new Date(template.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUseTemplate?.(template)}
                            className="flex items-center space-x-1"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Use</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditTemplate?.(template)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteTemplate?.(template.template_id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Variables Help */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Template Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use these variables in your templates. They will be replaced with actual values when sending:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{tenant_name}'}</code>
                  <span className="text-gray-600">Tenant's full name</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{unit_number}'}</code>
                  <span className="text-gray-600">Unit number</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{amount}'}</code>
                  <span className="text-gray-600">Payment amount</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">{'{due_date}'}</code>
                  <span className="text-gray-600">Due date</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Modal */}
      <Dialog open={templateModalOpen} onOpenChange={onTemplateModalOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              Create a reusable notification template. Use variables like {'{tenant_name}'}, {'{unit_number}'}, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Payment Reminder Template"
                value={templateForm.name}
                onChange={(e) => onTemplateFormChange?.({ ...templateForm, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="template-type">Notification Type</Label>
              <Select
                value={templateForm.notification_type}
                onValueChange={(value) => onTemplateFormChange?.({ ...templateForm, notification_type: value })}
              >
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
            <div>
              <Label htmlFor="template-subject">Subject (Optional)</Label>
              <Input
                id="template-subject"
                placeholder="e.g., Payment Reminder for {tenant_name}"
                value={templateForm.subject}
                onChange={(e) => onTemplateFormChange?.({ ...templateForm, subject: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="template-message">Message</Label>
              <Textarea
                id="template-message"
                placeholder="e.g., Dear {tenant_name}, your payment for unit {unit_number} is due on {due_date}..."
                value={templateForm.message}
                onChange={(e) => onTemplateFormChange?.({ ...templateForm, message: e.target.value })}
                className="mt-2 min-h-[150px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables: {'{tenant_name}'}, {'{unit_number}'}, {'{amount}'}, {'{due_date}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onTemplateModalOpenChange?.(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveTemplate}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

