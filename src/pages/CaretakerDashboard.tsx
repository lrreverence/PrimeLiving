import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  LogOut,
  Plus,
  CreditCard,
  Download,
  Send,
  Users,
  Home,
  Clock,
  Wrench,
  FileText,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useCaretakerData } from '@/components/caretaker/useCaretakerData';
import { OverviewTab } from '@/components/caretaker/OverviewTab';
import { TenantsTab } from '@/components/caretaker/TenantsTab';
import { PaymentsTab } from '@/components/caretaker/PaymentsTab';
import { DocumentsTab } from '@/components/caretaker/DocumentsTab';
import { NotificationsTab } from '@/components/caretaker/NotificationsTab';
import { MaintenanceTab } from '@/components/caretaker/MaintenanceTab';
import { UnitsTab } from '@/components/caretaker/UnitsTab';
import { sendEmailNotification, sendSMSNotification } from '@/lib/notificationService';

const CaretakerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('confirmed');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [notificationTab, setNotificationTab] = useState('compose');
  const [notificationType, setNotificationType] = useState('General Notice');
  const [deliveryMethod, setDeliveryMethod] = useState('SMS + Email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [maintenanceFilter, setMaintenanceFilter] = useState('all');
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    notification_type: 'General Notice',
    subject: '',
    message: ''
  });
  
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    landlordData,
    tenants,
    tenantsLoading,
    payments,
    paymentsLoading,
    documents,
    documentsLoading,
    recentActivity: fetchedRecentActivity,
    recentActivityLoading,
    units,
    unitsLoading,
    unitStats,
    maintenanceRequests: fetchedMaintenanceRequests,
    maintenanceRequestsLoading,
    isLoading,
    fetchPayments,
    fetchDocuments,
    fetchTenants,
    fetchUnits,
    fetchMaintenanceRequests,
    setPayments
  } = useCaretakerData();

  // Helper function to format branch name
  const formatBranchName = (branch: string) => {
    if (!branch) return 'Unknown Branch';
    return branch
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Branch';
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user_role');
      navigate('/');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate overdue amount for a tenant
  const calculateOverdue = (tenant: any, payments: any[]) => {
    // Get contract and unit
    let contract = null;
    if (Array.isArray(tenant.contracts)) {
      contract = tenant.contracts.length > 0 ? tenant.contracts[0] : null;
    } else if (tenant.contracts) {
      contract = tenant.contracts;
    }

    if (!contract?.start_date) return 0;

    let unit = null;
    if (contract) {
      if (Array.isArray(contract.units)) {
        unit = contract.units.length > 0 ? contract.units[0] : null;
      } else if (contract.units) {
        unit = contract.units;
      }
    }

    const monthlyRent = unit?.monthly_rent ? parseFloat(unit.monthly_rent) : 0;
    if (monthlyRent === 0) return 0;

    const startDate = new Date(contract.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get confirmed payments for this tenant
    const tenantPayments = payments.filter(p => {
      const paymentTenant = p.tenants || null;
      const paymentTenantId = Array.isArray(paymentTenant) ? paymentTenant[0]?.tenant_id : paymentTenant?.tenant_id;
      return paymentTenantId === tenant.tenant_id && 
             (p.status === 'confirmed' || p.status === 'completed' || p.status === 'paid');
    });

    // Calculate overdue amount
    let overdueAmount = 0;
    const dueDay = 15; // Payment is due on the 15th of each month

    // Start from the contract start month
    let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    // Iterate through each month until today
    while (currentMonth <= today) {
      const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dueDay);
      dueDate.setHours(0, 0, 0, 0);

      // If the due date has passed, check if payment was made
      if (dueDate < today) {
        // Check if there's a confirmed payment for this month
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const hasPayment = tenantPayments.some(p => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        });

        if (!hasPayment) {
          overdueAmount += monthlyRent;
        }
      }

      // Move to next month
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    }

    return overdueAmount;
  };

  // Format tenant data for display
  const formattedTenants = tenants.map((tenant) => {
    let contract = null;
    if (Array.isArray(tenant.contracts)) {
      contract = tenant.contracts.length > 0 ? tenant.contracts[0] : null;
    } else if (tenant.contracts) {
      contract = tenant.contracts;
    }
    
    let unit = null;
    if (contract) {
      if (Array.isArray(contract.units)) {
        unit = contract.units.length > 0 ? contract.units[0] : null;
      } else if (contract.units) {
        unit = contract.units;
      }
    }
    
    // Calculate overdue amount
    const overdue = calculateOverdue(tenant, payments);
    
    return {
      id: tenant.tenant_id,
      name: `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || tenant.email?.split('@')[0] || 'Unknown',
      email: tenant.email || '',
      unit: unit?.unit_number || 'N/A',
      contact: tenant.contact_number || 'N/A',
      monthlyRent: unit?.monthly_rent ? parseFloat(unit.monthly_rent) : 0,
      contractStart: contract?.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : 'N/A',
      contractEnd: contract?.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : 'N/A',
      status: contract?.status || 'inactive',
      balance: overdue,
      validIdUrl: tenant.valid_id_url || undefined,
      validIdUploadedAt: tenant.valid_id_uploaded_at || undefined,
      tenantData: tenant
    };
  });

  // Format payment data for display
  const formattedPayments = payments.map((payment) => {
    const tenant = payment.tenants || null;
    const contract = payment.contracts || null;
    const unit = contract?.units || null;
    
    const paymentDate = new Date(payment.payment_date);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const period = `${monthNames[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
    
    return {
      id: payment.payment_id,
      tenantName: tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || tenant.email?.split('@')[0] || 'Unknown' : 'Unknown',
      unit: unit?.unit_number || 'N/A',
      amount: parseFloat(payment.amount),
      period: period,
      paymentDate: paymentDate.toISOString().split('T')[0],
      method: payment.payment_mode?.toLowerCase() || 'unknown',
      status: (payment.status?.toLowerCase() === 'confirmed' || payment.status?.toLowerCase() === 'completed' || payment.status?.toLowerCase() === 'paid') 
        ? 'confirmed' 
        : (payment.status?.toLowerCase() || 'pending'),
      receipt_url: payment.receipt_url,
      paymentData: payment
    };
  });

  const totalPayments = formattedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const confirmedCount = formattedPayments.filter(p => p.status === 'confirmed').length;
  const pendingCount = formattedPayments.filter(p => p.status === 'pending').length;

  // Handle payment approval
  const handleApprovePayment = async (paymentId: number) => {
    try {
      console.log('Approving payment:', paymentId);
      
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.payment_id === paymentId 
            ? { ...payment, status: 'confirmed', updated_at: new Date().toISOString() }
            : payment
        )
      );

      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)
        .select();

      if (error) {
        console.error('Error approving payment:', error);
        await fetchPayments();
        toast({
          title: "Error",
          description: `Failed to approve payment: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Payment approved successfully:', data);
      toast({
        title: "Payment Approved",
        description: "Payment has been confirmed successfully.",
      });
      await fetchPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      await fetchPayments();
      toast({
        title: "Error",
        description: "Failed to approve payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle payment rejection
  // Handle recording a new payment
  const handleRecordPayment = async (paymentData: {
    tenant_id: number;
    contract_id: number | null;
    amount: number;
    payment_date: string;
    payment_mode: string;
    status: string;
    transaction_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          tenant_id: paymentData.tenant_id,
          contract_id: paymentData.contract_id,
          amount: paymentData.amount,
          payment_date: paymentData.payment_date,
          payment_mode: paymentData.payment_mode,
          status: paymentData.status,
          transaction_id: paymentData.transaction_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error recording payment:', error);
        toast({
          title: "Error",
          description: `Failed to record payment: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully.",
      });
      await fetchPayments();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    try {
      console.log('Rejecting payment:', paymentId);
      
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.payment_id === paymentId 
            ? { ...payment, status: 'rejected', updated_at: new Date().toISOString() }
            : payment
        )
      );

      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)
        .select();

      if (error) {
        console.error('Error rejecting payment:', error);
        await fetchPayments();
        toast({
          title: "Error",
          description: `Failed to reject payment: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Payment rejected successfully:', data);
      toast({
        title: "Payment Rejected",
        description: "Payment has been rejected.",
      });
      await fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      await fetchPayments();
      toast({
        title: "Error",
        description: "Failed to reject payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate PDF document
  const generatePDF = (documentData: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tenant = documentData.tenants || null;
    const tenantName = tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() : 'N/A';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentData.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .content {
              line-height: 1.6;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .info-row {
              margin: 15px 0;
            }
            .label {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${documentData.document_type}</h1>
            <h2>${documentData.title}</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Tenant:</span> ${tenantName}
            </div>
            <div class="info-row">
              <span class="label">Document Type:</span> ${documentData.document_type}
            </div>
            <div class="info-row">
              <span class="label">Generated Date:</span> ${new Date(documentData.generated_date).toLocaleDateString()}
            </div>
            <div style="margin-top: 30px;">
              <p>This is a ${documentData.document_type.toLowerCase()} document generated on ${new Date(documentData.generated_date).toLocaleDateString()}.</p>
              <p>Document ID: ${documentData.document_id}</p>
            </div>
          </div>
          <div class="footer">
            <p>Generated by Prime Living Management System</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleGenerateDocument = async () => {
    if (!selectedTenant || !selectedDocumentType) {
      toast({
        title: "Missing Information",
        description: "Please select both tenant and document type.",
        variant: "destructive"
      });
      return;
    }

    try {
      const tenantMatch = selectedTenant.match(/\(([^)]+)\)/);
      const unitNumber = tenantMatch ? tenantMatch[1] : '';
      const tenant = formattedTenants.find(t => t.unit === unitNumber);
      
      if (!tenant) {
    toast({
          title: "Error",
          description: "Tenant not found.",
          variant: "destructive"
        });
        return;
      }

      const { data: newDocument, error } = await (supabase as any)
        .from('documents')
        .insert({
          tenant_id: tenant.id,
          document_type: selectedDocumentType,
          title: `${selectedDocumentType} - ${selectedTenant}`,
          generated_date: new Date().toISOString(),
          created_by: landlordData?.landlord_id || null
        })
        .select(`
          *,
          tenants (
            tenant_id,
            first_name,
            last_name,
            email,
            branch
          )
        `)
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast({
          title: "Error",
          description: `Failed to create document: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (newDocument) {
        generatePDF(newDocument);
        await fetchDocuments();
    toast({
      title: "Document Generated",
          description: `${selectedDocumentType} for ${selectedTenant} has been generated and downloaded.`,
        });
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const documentTypes = [
    'Payment Receipt',
    'Rental Contract',
    'Payment Due Notice',
    'Contract Expiry Notice'
  ];

  const notificationTypes = [
    'General Notice',
    'Payment Reminder',
    'Maintenance Notice',
    'Contract Update',
    'Emergency Alert'
  ];

  const deliveryMethods = [
    'SMS Only',
    'Email Only',
    'SMS + Email'
  ];

  const handleRecipientChange = (recipient: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    } else {
      setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
    }
  };


  const handleSendNotification = async () => {
    if (!subject || !message || selectedRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one recipient.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get selected tenants with their contact information
      let selectedTenants: Array<{ id: number; email: string; contact: string; name: string }> = [];
      
      if (selectedRecipients.includes('All Tenants')) {
        selectedTenants = formattedTenants.map(tenant => ({
          id: tenant.id,
          email: tenant.email,
          contact: tenant.contact,
          name: tenant.name
        }));
      } else {
        selectedTenants = formattedTenants
          .filter(tenant => selectedRecipients.includes(`${tenant.name}${tenant.unit !== 'N/A' ? ` (${tenant.unit})` : ''}`))
          .map(tenant => ({
            id: tenant.id,
            email: tenant.email,
            contact: tenant.contact,
            name: tenant.name
          }));
      }

      if (selectedTenants.length === 0) {
        toast({
          title: "Error",
          description: "No valid tenants selected.",
          variant: "destructive"
        });
        return;
      }

      const notificationTypeMap: { [key: string]: string } = {
        'General Notice': 'general',
        'Payment Reminder': 'payment',
        'Maintenance Notice': 'maintenance',
        'Contract Update': 'general',
        'Emergency Alert': 'emergency'
      };

      const dbNotificationType = notificationTypeMap[notificationType] || 'general';
      const fullMessage = subject ? `${subject}\n\n${message}` : message;
      const sentDate = scheduleDate ? new Date(scheduleDate).toISOString() : new Date().toISOString();

      // Prepare notifications to insert
      const notificationsToInsert = selectedTenants.map(tenant => ({
        tenant_id: tenant.id,
        notification_type: dbNotificationType,
        message: fullMessage,
        sent_date: sentDate,
        status: 'unread',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Save notifications to database
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (insertError) {
        console.error('Error creating notifications:', insertError);
        toast({
          title: "Error",
          description: `Failed to save notifications: ${insertError.message}`,
          variant: "destructive"
        });
        return;
      }

      // Send emails and SMS based on delivery method
      let emailCount = 0;
      let smsCount = 0;
      let emailErrors = 0;
      let smsErrors = 0;

      // Check if we should send emails
      const shouldSendEmail = deliveryMethod.includes('Email') || deliveryMethod === 'SMS + Email';
      // Check if we should send SMS
      const shouldSendSMS = deliveryMethod.includes('SMS') || deliveryMethod === 'SMS + Email';

      // Send notifications to each tenant
      for (const tenant of selectedTenants) {
        // Send email if method includes email and tenant has email
        if (shouldSendEmail && tenant.email && tenant.email !== 'N/A' && tenant.email.includes('@')) {
          console.log('Attempting to send email to:', tenant.email, 'Subject:', subject);
          const emailResult = await sendEmailNotification(tenant.email, subject, fullMessage);
          if (emailResult.success) {
            emailCount++;
            console.log('Email sent successfully to:', tenant.email);
          } else {
            emailErrors++;
            console.error('Failed to send email to:', tenant.email, 'Error:', emailResult.error);
          }
        } else if (shouldSendEmail) {
          console.warn('Skipping email for tenant:', tenant.name, 'Email:', tenant.email, 'Reason: Invalid or missing email');
        }

        // Send SMS if method includes SMS and tenant has phone number
        if (shouldSendSMS && tenant.contact && tenant.contact !== 'N/A') {
          const smsResult = await sendSMSNotification(tenant.contact, fullMessage);
          if (smsResult.success) {
            smsCount++;
          } else {
            smsErrors++;
          }
        }
      }

      // Show success message with delivery details
      let successMessage = `Notification saved and sent to ${selectedTenants.length} tenant(s).`;
      if (shouldSendEmail || shouldSendSMS) {
        const deliveryDetails = [];
        if (shouldSendEmail) {
          deliveryDetails.push(`${emailCount} email(s)`);
          if (emailErrors > 0) deliveryDetails.push(`${emailErrors} email error(s)`);
        }
        if (shouldSendSMS) {
          deliveryDetails.push(`${smsCount} SMS(s)`);
          if (smsErrors > 0) deliveryDetails.push(`${smsErrors} SMS error(s)`);
        }
        if (deliveryDetails.length > 0) {
          successMessage += ` Delivery: ${deliveryDetails.join(', ')}.`;
        }
      } else {
        successMessage += ' (Notification saved to tenant dashboards)';
      }

      toast({
        title: "Notification Sent",
        description: successMessage,
      });

      // Clear form
      setSubject('');
      setMessage('');
      setSelectedRecipients([]);
      setScheduleDate('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClearForm = () => {
    setSubject('');
    setMessage('');
    setSelectedRecipients([]);
    setScheduleDate('');
  };

  // Template management functions
  const fetchTemplates = async () => {
    if (!landlordData?.landlord_id) return;

    try {
      setTemplatesLoading(true);
      const { data, error } = await supabase
        .from('notification_templates' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Error",
          description: "Failed to load templates.",
          variant: "destructive"
        });
      } else {
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name and message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const notificationTypeMap: { [key: string]: string } = {
        'General Notice': 'general',
        'Payment Reminder': 'payment',
        'Maintenance Notice': 'maintenance',
        'Contract Update': 'general',
        'Emergency Alert': 'emergency'
      };

      const dbNotificationType = notificationTypeMap[templateForm.notification_type] || 'general';

      const { error } = await supabase
        .from('notification_templates' as any)
        .insert({
          name: templateForm.name,
          notification_type: dbNotificationType,
          subject: templateForm.subject,
          message: templateForm.message,
          created_by: landlordData?.landlord_id || null
        });

      if (error) {
        console.error('Error creating template:', error);
        toast({
          title: "Error",
          description: `Failed to create template: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Template Created",
        description: "Template has been created successfully.",
      });

      setTemplateModalOpen(false);
      setTemplateForm({ name: '', notification_type: 'General Notice', subject: '', message: '' });
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !templateForm.name || !templateForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name and message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const notificationTypeMap: { [key: string]: string } = {
        'General Notice': 'general',
        'Payment Reminder': 'payment',
        'Maintenance Notice': 'maintenance',
        'Contract Update': 'general',
        'Emergency Alert': 'emergency'
      };

      const dbNotificationType = notificationTypeMap[templateForm.notification_type] || 'general';

      const { error } = await supabase
        .from('notification_templates' as any)
        .update({
          name: templateForm.name,
          notification_type: dbNotificationType,
          subject: templateForm.subject,
          message: templateForm.message,
          updated_at: new Date().toISOString()
        })
        .eq('template_id', editingTemplate.template_id);

      if (error) {
        console.error('Error updating template:', error);
        toast({
          title: "Error",
          description: `Failed to update template: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Template Updated",
        description: "Template has been updated successfully.",
      });

      setTemplateModalOpen(false);
      setTemplateForm({ name: '', notification_type: 'General Notice', subject: '', message: '' });
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notification_templates' as any)
        .delete()
        .eq('template_id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        toast({
          title: "Error",
          description: `Failed to delete template: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUseTemplate = (template: any) => {
    const typeMap: { [key: string]: string } = {
      'general': 'General Notice',
      'payment': 'Payment Reminder',
      'maintenance': 'Maintenance Notice',
      'emergency': 'Emergency Alert'
    };

    setNotificationType(typeMap[template.notification_type] || 'General Notice');
    setSubject(template.subject || '');
    setMessage(template.message || '');
    setNotificationTab('compose');
    
    toast({
      title: "Template Applied",
      description: "Template has been loaded into the compose form.",
    });
  };

  const handleEditTemplate = (template: any) => {
    const typeMap: { [key: string]: string } = {
      'general': 'General Notice',
      'payment': 'Payment Reminder',
      'maintenance': 'Maintenance Notice',
      'emergency': 'Emergency Alert'
    };

    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      notification_type: typeMap[template.notification_type] || 'General Notice',
      subject: template.subject || '',
      message: template.message || ''
    });
    setTemplateModalOpen(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', notification_type: 'General Notice', subject: '', message: '' });
    setTemplateModalOpen(true);
  };

  // Load templates when notification tab is opened
  useEffect(() => {
    if (activeTab === 'notifications' && notificationTab === 'templates' && landlordData?.landlord_id) {
      fetchTemplates();
    }
  }, [activeTab, notificationTab, landlordData]);

  // Overview data
  const overviewMetrics = [
    {
      title: 'Total Units',
      value: String(unitStats.total),
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-blue-600'
    },
    {
      title: 'Occupied Units',
      value: String(unitStats.occupied),
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600'
    },
    {
      title: 'Vacant Units',
      value: String(unitStats.vacant),
      icon: <Home className="w-6 h-6" />,
      color: 'text-gray-600'
    },
    {
      title: 'Pending Payments',
      value: String(pendingCount),
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-orange-600'
    }
  ];

  // Generate report function
  const generateReport = () => {
    try {
      // Create CSV content
      const csvRows: string[] = [];
      
      // Add header
      csvRows.push('Report Generated: ' + new Date().toLocaleString());
      csvRows.push('');
      
      // Tenants section
      csvRows.push('TENANTS');
      csvRows.push('Name,Email,Contact Number,Unit,Branch,Move-in Date');
      tenants.forEach((tenant: any) => {
        const unit = Array.isArray(tenant.contracts?.[0]?.units) 
          ? tenant.contracts[0].units[0] 
          : tenant.contracts?.[0]?.units;
        const name = `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim();
        csvRows.push([
          `"${name}"`,
          tenant.email || '',
          tenant.contact_number || '',
          unit?.unit_number || 'N/A',
          tenant.branch || 'N/A',
          tenant.move_in_date || 'N/A'
        ].join(','));
      });
      csvRows.push('');
      
      // Payments section
      csvRows.push('PAYMENTS');
      csvRows.push('Date,Tenant,Amount,Status,Payment Method,Transaction ID');
      payments.forEach((payment: any) => {
        const tenant = Array.isArray(payment.tenants) ? payment.tenants[0] : payment.tenants;
        const tenantName = tenant 
          ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() 
          : 'Unknown';
        csvRows.push([
          payment.payment_date || 'N/A',
          `"${tenantName}"`,
          payment.amount || '0',
          payment.status || 'pending',
          payment.payment_mode || 'N/A',
          payment.transaction_id || 'N/A'
        ].join(','));
      });
      
      // Create and download CSV
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `caretaker-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Generated",
        description: "Report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const quickActions = [
    {
      title: 'Add Tenant',
      icon: <Plus className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('tenants');
        toast({
          title: "Navigate to Tenants",
          description: "Use the 'Add Tenant' button in the Tenants tab to add a new tenant.",
        });
      }
    },
    {
      title: 'Record Payment',
      icon: <CreditCard className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('payments');
        toast({
          title: "Navigate to Payments",
          description: "Use the 'Record Payment' button in the Payments tab to record a new payment.",
        });
      }
    },
    {
      title: 'Generate Report',
      icon: <Download className="w-5 h-5" />,
      onClick: generateReport
    },
    {
      title: 'Send Notice',
      icon: <Send className="w-5 h-5" />,
      onClick: () => {
        setActiveTab('notifications');
        toast({
          title: "Navigate to Notifications",
          description: "Compose and send notices to tenants from the Notifications tab.",
        });
      }
    }
  ];

  // Map fetched recent activity to format with React icons
  const recentActivity = fetchedRecentActivity.map((activity) => {
    let icon;
    switch (activity.icon) {
      case 'payment':
        icon = <CreditCard className="w-5 h-5 text-green-600" />;
        break;
      case 'maintenance':
        icon = <Wrench className="w-5 h-5 text-blue-600" />;
        break;
      case 'contract':
        icon = <FileText className="w-5 h-5 text-orange-600" />;
        break;
      default:
        icon = <Clock className="w-5 h-5 text-gray-600" />;
    }

    return {
      ...activity,
      icon
    };
  });

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'pending':
        return (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">pending</span>
          </div>
        );
      case 'in progress':
      case 'in_progress':
        return (
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">in progress</span>
          </div>
        );
      case 'completed':
      case 'resolved':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded">completed</span>
          </div>
        );
      case 'urgent':
        return (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">urgent</span>
          </div>
        );
      default:
        return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{status || 'unknown'}</span>;
    }
  };

  // Filter maintenance requests based on selected filter
  const filteredMaintenanceRequests = fetchedMaintenanceRequests.filter((request) => {
    if (maintenanceFilter === 'all') return true;
    const requestStatus = request.status?.toLowerCase() || '';
    const filterStatus = maintenanceFilter.toLowerCase();
    
    // Handle status variations
    if (filterStatus === 'in_progress') {
      return requestStatus === 'in_progress' || requestStatus === 'in progress';
    }
    if (filterStatus === 'completed') {
      return requestStatus === 'completed' || requestStatus === 'resolved';
    }
    return requestStatus === filterStatus;
  });

  // Calculate maintenance statistics
  const maintenancePendingCount = fetchedMaintenanceRequests.filter(
    (r) => r.status?.toLowerCase() === 'pending'
  ).length;
  const maintenanceInProgressCount = fetchedMaintenanceRequests.filter(
    (r) => r.status?.toLowerCase() === 'in_progress' || r.status?.toLowerCase() === 'in progress'
  ).length;
  const maintenanceCompletedCount = fetchedMaintenanceRequests.filter(
    (r) => r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'resolved'
  ).length;
  const maintenanceTotalCount = fetchedMaintenanceRequests.length;

  // Format maintenance requests for display
  const maintenanceRequests = filteredMaintenanceRequests.map((request) => {
    // Handle nested data structure from Supabase
    const unit = Array.isArray(request.units) ? request.units[0] : request.units;
    const tenant = Array.isArray(request.tenants) ? request.tenants[0] : request.tenants;
    
    return {
      ...request,
      title: request.description || 'Maintenance Request',
      unit_number: unit?.unit_number || 'N/A',
      tenant_name: tenant 
        ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown'
    };
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">high</span>;
      case 'medium':
        return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">medium</span>;
      case 'low':
        return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">low</span>;
      default:
        return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{priority}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Caretaker Dashboard</h1>
              <p className="text-gray-600">
                {formatBranchName(landlordData?.branch || 'sampaloc-manila')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview">
            <OverviewTab
              overviewMetrics={overviewMetrics}
              quickActions={quickActions}
              recentActivity={recentActivity}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="tenants">
            <TenantsTab
              tenants={formattedTenants}
              tenantsLoading={tenantsLoading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              units={units}
              onTenantUpdate={fetchTenants}
            />
          </TabsContent>

          <TabsContent value="units">
            <UnitsTab
              units={units}
              unitsLoading={unitsLoading}
              onUnitUpdate={fetchUnits}
              landlordId={landlordData?.landlord_id}
            />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              payments={formattedPayments}
              paymentsLoading={paymentsLoading}
              paymentFilter={paymentFilter}
              onFilterChange={setPaymentFilter}
              onApprovePayment={handleApprovePayment}
              onRejectPayment={handleRejectPayment}
              onRecordPayment={handleRecordPayment}
              tenants={formattedTenants}
              totalPayments={totalPayments}
              confirmedCount={confirmedCount}
              pendingCount={pendingCount}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab
              documents={documents}
              documentsLoading={documentsLoading}
              tenants={formattedTenants}
              selectedTenant={selectedTenant}
              selectedDocumentType={selectedDocumentType}
              onTenantChange={setSelectedTenant}
              onDocumentTypeChange={setSelectedDocumentType}
              onGenerateDocument={handleGenerateDocument}
              onExportPDF={generatePDF}
              documentTypes={documentTypes}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab
              notificationTab={notificationTab}
              onTabChange={setNotificationTab}
              notificationType={notificationType}
              onNotificationTypeChange={setNotificationType}
              deliveryMethod={deliveryMethod}
              onDeliveryMethodChange={setDeliveryMethod}
              subject={subject}
              onSubjectChange={setSubject}
              message={message}
              onMessageChange={setMessage}
              selectedRecipients={selectedRecipients}
              onRecipientChange={handleRecipientChange}
              scheduleDate={scheduleDate}
              onScheduleDateChange={setScheduleDate}
              onSendNotification={handleSendNotification}
              onClearForm={handleClearForm}
              tenants={formattedTenants}
              notificationTypes={notificationTypes}
              deliveryMethods={deliveryMethods}
              templates={templates}
              templatesLoading={templatesLoading}
              onFetchTemplates={fetchTemplates}
              onUseTemplate={handleUseTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onNewTemplate={handleNewTemplate}
              templateModalOpen={templateModalOpen}
              onTemplateModalOpenChange={setTemplateModalOpen}
              templateForm={templateForm}
              onTemplateFormChange={setTemplateForm}
              editingTemplate={editingTemplate}
              onSaveTemplate={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceTab
              maintenanceFilter={maintenanceFilter}
              onFilterChange={setMaintenanceFilter}
              maintenancePendingCount={maintenancePendingCount}
              maintenanceInProgressCount={maintenanceInProgressCount}
              maintenanceCompletedCount={maintenanceCompletedCount}
              maintenanceTotalCount={maintenanceTotalCount}
              maintenanceRequests={maintenanceRequests}
              maintenanceRequestsLoading={maintenanceRequestsLoading}
              getPriorityBadge={getPriorityBadge}
              getStatusBadge={getStatusBadge}
              onMaintenanceUpdate={fetchMaintenanceRequests}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CaretakerDashboard;

