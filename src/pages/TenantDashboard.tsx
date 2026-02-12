import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// Type definitions - made flexible to handle schema variations
interface TenantData {
  tenant_id?: number;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
  branch?: string;
  move_in_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  occupation?: string;
  company?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow additional properties
}

interface UnitData {
  unit_id?: number;
  unit_number?: string;
  unit_type?: string;
  monthly_rent?: number;
  [key: string]: any;
}

interface ContractData {
  contract_id?: number;
  tenant_id?: number;
  unit_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  units?: UnitData;
  [key: string]: any;
}

interface NotificationData {
  notification_id: number;
  tenant_id: number;
  notification_type: string;
  message: string;
  sent_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EmailConfirmationBanner from '@/components/EmailConfirmationBanner';
import { TenantFAQChatbot } from '@/components/TenantFAQChatbot';
import cubaoQrImage from '@/assets/cubao_qr.jpg';
import sampalocQrImage from '@/assets/sampaloc_qr.jpg';
import {
  Building2,
  User,
  CreditCard,
  QrCode,
  Wrench,
  Bell,
  LogOut,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Edit,
  Home,
  Phone,
  Mail,
  UserCheck,
  Download,
  FileText as DocumentIcon,
  ClipboardList,
  Users,
  Settings,
  TrendingUp,
  Receipt,
  Copy,
  Smartphone,
  Plus,
  Droplets,
  Thermometer,
  Zap,
  PhoneCall,
  X,
  Camera,
  Upload,
  AlertCircle,
  Settings as SettingsIcon,
  Mail as MailIcon,
  Smartphone as PhoneIcon,
  Bell as BellIcon,
  Lock
} from 'lucide-react';

const TenantDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentYear, setPaymentYear] = useState('all');
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    branch: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    occupation: '',
    company: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('All Status');
  const [paymentFor, setPaymentFor] = useState('Monthly Rent');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [paymentAmount, setPaymentAmount] = useState(15000);
  const [paymentOption, setPaymentOption] = useState('full');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    category: '',
    priority: '',
    title: '',
    description: '',
    photos: [] as File[]
  });
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    paymentReminders: true,
    maintenanceUpdates: true,
    generalAnnouncements: true,
    emergencyAlerts: false // Cannot be disabled
  });
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [maintenanceStats, setMaintenanceStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [feedbackText, setFeedbackText] = useState<{ [key: number]: string }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<{ [key: number]: boolean }>({});
  const [maintenanceLoadingData, setMaintenanceLoadingData] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const { logout, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch tenant data from Supabase
  const fetchTenantData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // @ts-ignore - Supabase type inference issue
      const response = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data, error } = response as { data: TenantData | null; error: any };

      if (error) {
        console.error('Error fetching tenant data:', error);

        // If no tenant record exists, create one
        if (error.code === 'PGRST116') {
          console.log('No tenant record found, creating one...');
          await createTenantRecord();
          setLoading(false); // Ensure loading is set to false after creating record
          return;
        }

        toast({
          title: "Error",
          description: `Failed to load tenant data: ${error.message}`,
          variant: "destructive"
        });
        setLoading(false); // Ensure loading is set to false on error
        return;
      }

      if (data) {
        setTenantData(data);
        setIsLoadingProfile(false);
        // Fetch contract data after tenant data is loaded
        await fetchContractData(data.tenant_id);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        title: "Error",
        description: "Failed to load tenant data. Please try again.",
        variant: "destructive"
      });
      setIsLoadingProfile(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contract data with unit information
  const fetchContractData = async (tenantId: number) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          units (*)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single() as { data: ContractData | null; error: any };

      if (error) {
        console.error('Error fetching contract data:', error);
        // Don't show error toast for missing contract as it's optional
        return;
      }

      if (data) {
        setContractData(data);
      }
    } catch (error) {
      console.error('Error fetching contract data:', error);
    }
  };

  // Create tenant record for existing users
  const createTenantRecord = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          user_id: user.id,
          first_name: user.user_metadata?.name?.split(' ')[0] || '',
          last_name: user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          contact_number: user.user_metadata?.phone || '',
          branch: user.user_metadata?.branch || 'sampaloc-manila',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single() as { data: TenantData | null; error: any };

      if (error) {
        console.error('Error creating tenant record:', error);
        setLoading(false);
        setIsLoadingProfile(false);
        toast({
          title: "Error",
          description: `Failed to create tenant record: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setTenantData(data);
        setIsLoadingProfile(false);
        // Try to fetch contract data after creating tenant record
        await fetchContractData(data.tenant_id);
        setLoading(false); // Ensure loading is set to false after successful creation
        toast({
          title: "Success",
          description: "Tenant profile created successfully!",
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating tenant record:', error);
      setLoading(false);
      setIsLoadingProfile(false);
      toast({
        title: "Error",
        description: "Failed to create tenant record. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch maintenance requests
  const fetchMaintenanceRequests = async () => {
    if (!tenantData) return;

    try {
      setMaintenanceLoadingData(true);
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', tenantData.tenant_id)
        .order('created_date', { ascending: false });

      if (requestsError) {
        console.error('Error fetching maintenance requests:', requestsError);
        return;
      }

      setMaintenanceRequests(requests || []);

      // Calculate stats
      const stats = {
        total: requests?.length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        inProgress: requests?.filter(r => r.status === 'in_progress').length || 0,
        completed: requests?.filter(r => r.status === 'completed').length || 0,
      };
      setMaintenanceStats(stats);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setMaintenanceLoadingData(false);
    }
  };

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!tenantData) return;

    try {
      setNotificationsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantData.tenant_id)
        .order('sent_date', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Load tenant data when component mounts
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    if (user) {
      fetchTenantData();
    } else {
      // If no user after auth loading is complete, stop loading
      setLoading(false);
    }
  }, [user, authLoading]);

  // Load maintenance requests and payments when tenant data is available
  useEffect(() => {
    if (tenantData) {
      fetchMaintenanceRequests();
      fetchNotifications();
      fetchPayments();
    }
  }, [tenantData]);

  // Refetch payments when filters change
  useEffect(() => {
    if (tenantData) {
      // Payments are already loaded, just re-filter
    }
  }, [paymentYear, paymentStatus]);

  // Keyboard shortcuts for quick actions
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if no input is focused and Ctrl/Cmd is pressed
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            handleQuickAction('pay-rent');
            break;
          case '2':
            event.preventDefault();
            handleQuickAction('report-issue');
            break;
          case '3':
            event.preventDefault();
            handleQuickAction('payment-history');
            break;
          case '4':
            event.preventDefault();
            handleQuickAction('view-alerts');
            break;
          case '5':
            event.preventDefault();
            handleQuickAction('view-profile');
            break;
          case '6':
            event.preventDefault();
            handleQuickAction('maintenance-status');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Clear role from localStorage
      localStorage.removeItem('user_role');
      // Navigate to home page
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

  const quickActions = [
    {
      id: 'pay-rent',
      title: 'Pay Rent',
      icon: <QrCode className="w-6 h-6" />,
      description: 'Display QR code for payment'
    },
    {
      id: 'report-issue',
      title: 'Report Issue',
      icon: <Wrench className="w-6 h-6" />,
      description: 'Submit maintenance request'
    },
    {
      id: 'payment-history',
      title: 'Transaction History',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'View past payments'
    },
    {
      id: 'view-alerts',
      title: 'View Alerts',
      icon: <Bell className="w-6 h-6" />,
      description: 'Check notifications'
    },
    {
      id: 'view-profile',
      title: 'My Profile',
      icon: <User className="w-6 h-6" />,
      description: 'Update personal info'
    },
    {
      id: 'maintenance-status',
      title: 'Maintenance Status',
      icon: <Settings className="w-6 h-6" />,
      description: 'Track request status'
    }
  ];

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'pay-rent':
        setActiveTab('qr-pay');
        toast({
          title: "QR Payment",
          description: "Redirected to QR payment section.",
        });
        break;
      case 'report-issue':
        setActiveTab('maintenance');
        // Open the maintenance modal after a short delay to ensure tab is loaded
        setTimeout(() => {
          setMaintenanceModalOpen(true);
        }, 100);
        toast({
          title: "Report Issue",
          description: "Opening maintenance request form.",
        });
        break;
      case 'payment-history':
        setActiveTab('payments');
        toast({
          title: "Transaction History",
          description: "Redirected to transaction history section.",
        });
        break;
      case 'view-alerts':
        setActiveTab('notifications');
        toast({
          title: "Notifications",
          description: "Redirected to notifications section.",
        });
        break;
      case 'view-profile':
        setActiveTab('profile');
        toast({
          title: "Profile",
          description: "Redirected to profile section.",
        });
        break;
      case 'maintenance-status':
        setActiveTab('maintenance');
        toast({
          title: "Maintenance Status",
          description: "Redirected to maintenance section.",
        });
        break;
      default:
        toast({
          title: "Action Selected",
          description: `${actionId.replace('-', ' ')} functionality will be implemented.`,
        });
    }
  };

  // Fetch payments from database
  const fetchPayments = async () => {
    if (!tenantData) return;

    try {
      setPaymentsLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantData.tenant_id)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: "Error",
          description: "Failed to load transaction history.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Calculate next payment due date
  const calculateNextPaymentDue = () => {
    // Payment is due on the 15th of each month (as displayed in the UI)
    const dueDay = 15;
    
    // Get today's date
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    // Create normalized today for comparison (start of day)
    const todayNormalized = new Date(todayYear, todayMonth, todayDay);
    
    // Calculate this month's due date
    let nextDueDate = new Date(todayYear, todayMonth, dueDay);
    
    // If the due date has passed this month (or is today), move to next month
    if (nextDueDate < todayNormalized) {
      // Move to next month, handle year rollover
      let nextMonth = todayMonth + 1;
      let nextYear = todayYear;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = todayYear + 1;
      }
      nextDueDate = new Date(nextYear, nextMonth, dueDay);
    }
    
    // Calculate days until due date
    const timeDiff = nextDueDate.getTime() - todayNormalized.getTime();
    const daysUntilDue = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    
    return {
      date: nextDueDate,
      daysUntilDue: daysUntilDue
    };
  };

  // Calculate current balance
  const calculateCurrentBalance = () => {
    if (!contractData?.start_date || !contractData?.units?.monthly_rent) return 0;
    
    const startDate = new Date(contractData.start_date);
    const today = new Date();
    const monthlyRent = contractData.units.monthly_rent;
    
    // Calculate number of full months since contract start
    // This counts months that should have been fully paid
    let monthsSinceStart = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                            (today.getMonth() - startDate.getMonth());
    
    // If we're still in the first month, no payment is due yet
    if (monthsSinceStart < 0) monthsSinceStart = 0;
    
    // Expected total payments (full months since start * monthly rent)
    const expectedTotal = monthsSinceStart * monthlyRent;
    
    // Calculate total confirmed payments
    const confirmedPayments = payments
      .filter(p => p.status === 'confirmed' || p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    
    // Balance = Expected - Paid (positive means owed, negative means overpaid)
    return expectedTotal - confirmedPayments;
  };


  // Filter payments based on year and status
  const filteredPayments = payments.filter((payment) => {
    const paymentYearValue = new Date(payment.payment_date).getFullYear().toString();
    const matchesYear = paymentYear === 'all' || paymentYearValue === paymentYear;
    const matchesStatus = paymentStatus === 'All Status' || 
      (paymentStatus === 'Confirmed' && (payment.status === 'confirmed' || payment.status === 'completed' || payment.status === 'paid')) ||
      (paymentStatus === 'Pending' && payment.status === 'pending');
    
    return matchesYear && matchesStatus;
  });

  // Format payment data for display
  const paymentRecords = filteredPayments.map((payment) => {
    const paymentDate = new Date(payment.payment_date);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const period = `${monthNames[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
    
    // Default to Monthly Rent if payment_for is not available in database
    // In the future, this could be stored in the database
    const paymentFor = (payment as any).payment_for || 'Monthly Rent';
    
    return {
      id: payment.payment_id,
      date: paymentDate.toISOString().split('T')[0],
      period: period,
      amount: parseFloat(payment.amount),
      method: payment.payment_mode.toLowerCase(),
      reference: payment.transaction_id || `RENT-${payment.payment_id}`,
      status: (payment.status === 'confirmed' || payment.status === 'completed' || payment.status === 'paid') 
        ? 'confirmed' 
        : payment.status || 'pending',
      payment_for: paymentFor,
      receipt_url: payment.receipt_url
    };
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'gcash':
        return <Badge className="bg-blue-100 text-blue-800">gcash</Badge>;
      case 'cash':
        return <Badge className="bg-green-100 text-green-800">cash</Badge>;
      case 'bank transfer':
        return <Badge className="bg-purple-100 text-purple-800">bank transfer</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{method}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Badge className="bg-green-800 text-white">confirmed</Badge>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <Badge className="bg-yellow-600 text-white">pending</Badge>
          </div>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'unknown'}</Badge>;
    }
  };

  const handleDownloadReceipt = (recordId: number) => {
    const payment = payments.find(p => p.payment_id === recordId);
    if (payment?.receipt_url) {
      // Open receipt URL in new tab
      window.open(payment.receipt_url, '_blank');
      toast({
        title: "Receipt Opened",
        description: "Receipt has been opened in a new tab.",
      });
    } else {
      toast({
        title: "Receipt Not Available",
        description: "Receipt for this payment is not available.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAll = () => {
    toast({
      title: "All Receipts Downloaded",
      description: "All payment receipts have been downloaded as a ZIP file.",
    });
  };

  // QR code image by branch: Cubao and Sampaloc have branch-specific QRs; Cainta uses default
  const paymentQrImage = (() => {
    const branch = (tenantData?.branch || '').toLowerCase();
    if (branch.includes('cubao')) return cubaoQrImage;
    if (branch.includes('sampaloc')) return sampalocQrImage;
    return cubaoQrImage; // Cainta or fallback (use cubao QR until cainta_qr.jpg is added)
  })();

  const handleGenerateQR = () => {
    // Generate a stable reference number
    const unitNumber = contractData?.units?.unit_number || '000';
    const reference = `RENT-${unitNumber}-${Math.floor(Math.random() * 1000000)}`;
    setPaymentReference(reference);
    setQrGenerated(true);
    toast({
      title: "QR Code Generated",
      description: "QR code has been generated successfully!",
    });
  };

  const handleDonePaying = () => {
    setReceiptModalOpen(true);
  };

  const handleReceiptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setReceiptFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
      setReceiptFile(null);
      setReceiptPreview(null);
    }
  };

  const handleUploadReceipt = async () => {
    console.log('Upload receipt - File:', receiptFile, 'User:', user, 'Tenant:', tenantData, 'Contract:', contractData);
    
    if (!receiptFile) {
      console.error('No receipt file selected');
      toast({
        title: "Missing Information",
        description: "Please select a receipt file to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to upload receipts.",
        variant: "destructive"
      });
      return;
    }

    if (!tenantData) {
      toast({
        title: "Missing Information",
        description: "Tenant information not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setUploadingReceipt(true);
    try {
      // Upload file to Supabase storage
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          throw new Error('Receipts storage bucket not found. Please create a "receipts" bucket in Supabase Storage.');
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      const receiptUrl = urlData.publicUrl;

      // Get tenant record
      const { data: tenantRecord, error: tenantError } = await supabase
        .from('tenants')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (tenantError || !tenantRecord) {
        throw new Error('Tenant record not found');
      }

      // Create payment record with receipt URL
      // Note: contract_id is optional - some payments may not have an active contract
      const paymentData: any = {
        tenant_id: tenantRecord.tenant_id,
        amount: paymentAmount,
        payment_date: new Date().toISOString(),
        payment_mode: paymentMethod,
        status: 'pending',
        transaction_id: paymentReference || `RENT-${contractData?.units?.unit_number || tenantData.branch || '000'}-${Date.now()}`,
        receipt_url: receiptUrl
      };

      // Only add contract_id if contract data exists
      if (contractData?.contract_id) {
        paymentData.contract_id = contractData.contract_id;
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData);

      if (paymentError) {
        throw new Error(`Failed to save payment: ${paymentError.message}`);
      }

      toast({
        title: "Receipt Uploaded",
        description: "Your payment receipt has been uploaded successfully and is pending review.",
      });

      // Reset form
      setReceiptFile(null);
      setReceiptPreview(null);
      setReceiptModalOpen(false);
      setQrGenerated(false);
      
      // Refresh payments list
      await fetchPayments();
    } catch (error: any) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleCopyReference = () => {
    const reference = paymentReference || `RENT-${contractData?.units?.unit_number || '000'}-${Math.floor(Math.random() * 1000000)}`;
    navigator.clipboard.writeText(reference);
    toast({
      title: "Reference Copied",
      description: "Reference number has been copied to clipboard.",
    });
  };

  const handleCopyMobile = () => {
    navigator.clipboard.writeText('09171234567');
    toast({
      title: "Mobile Number Copied",
      description: "Mobile number has been copied to clipboard.",
    });
  };

  const handleNewRequest = () => {
    setMaintenanceModalOpen(true);
  };

  const handleCloseMaintenanceModal = () => {
    setMaintenanceModalOpen(false);
    setMaintenanceForm({
      category: '',
      priority: '',
      title: '',
      description: '',
      photos: []
    });
  };

  const handleMaintenanceFormChange = (field: string, value: string) => {
    setMaintenanceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMaintenanceForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const handleSubmitMaintenanceRequest = async () => {
    if (!maintenanceForm.category || !maintenanceForm.priority || !maintenanceForm.title || !maintenanceForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!tenantData || !user) {
      toast({
        title: "Error",
        description: "Unable to submit request. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setMaintenanceLoading(true);

      // Get tenant_id from the tenant data
      const { data: tenantRecord, error: tenantError } = await supabase
        .from('tenants')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (tenantError) {
        console.error('Tenant lookup error:', tenantError);
        throw new Error(`Failed to find tenant record: ${tenantError.message}`);
      }

      if (!tenantRecord) {
        throw new Error('No tenant record found. Please contact support.');
      }

      // Get unit_id and branch from the tenant's current contract or tenant's branch
      let unitId = 1; // Default unit_id
      let branch = null;

      // First, try to get unit from tenant's active contract
      const { data: contractData } = await supabase
        .from('contracts')
        .select('unit_id, units(branch)')
        .eq('tenant_id', tenantRecord.tenant_id)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (contractData) {
        unitId = contractData.unit_id;
        const unit = Array.isArray(contractData.units) ? contractData.units[0] : contractData.units;
        branch = unit?.branch;
      }

      // If no contract, get branch from tenant record
      if (!branch) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('branch')
          .eq('tenant_id', tenantRecord.tenant_id)
          .single();
        
        branch = tenantData?.branch;
      }

      // If still no branch, try to get it from the unit
      if (!branch && unitId) {
        const { data: unitData } = await supabase
          .from('units')
          .select('branch')
          .eq('unit_id', unitId)
          .single();
        
        branch = unitData?.branch;
      }

      // Fallback: get any available unit
      if (!unitId || unitId === 1) {
        const { data: unitData, error: unitError } = await supabase
          .from('units')
          .select('unit_id, branch')
          .eq('status', 'available')
          .limit(1);

        if (!unitError && unitData && unitData.length > 0) {
          unitId = unitData[0].unit_id;
          if (!branch) {
            branch = unitData[0].branch;
          }
        } else {
          // Try to get any unit if no available units
          const { data: anyUnit } = await supabase
            .from('units')
            .select('unit_id, branch')
            .limit(1);

          if (anyUnit && anyUnit.length > 0) {
            unitId = anyUnit[0].unit_id;
            if (!branch) {
              branch = anyUnit[0].branch;
            }
          }
        }
      }

      // Insert maintenance request into database
      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: tenantRecord.tenant_id,
          unit_id: unitId,
          branch: branch,
          description: maintenanceForm.description,
          priority: maintenanceForm.priority,
          status: 'pending',
          created_date: new Date().toISOString(),
          // Note: We're not handling photos in this basic implementation
          // In a real app, you'd upload photos to storage first
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to create maintenance request: ${insertError.message}`);
      }

      toast({
        title: "Request Submitted",
        description: "Your maintenance request has been submitted successfully.",
      });

      handleCloseMaintenanceModal();

      // Refresh maintenance requests data
      await fetchMaintenanceRequests();
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitFeedback = async (requestId: number) => {
    const feedback = feedbackText[requestId]?.trim();
    if (!feedback) {
      toast({
        title: "Error",
        description: "Please enter your feedback before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingFeedback(prev => ({ ...prev, [requestId]: true }));
      
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({
          tenant_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message || 'Failed to save feedback to database');
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were updated. Please check if you have permission to update this request.');
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      // Clear feedback text for this request
      setFeedbackText(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });

      // Refresh maintenance requests to show the feedback
      await fetchMaintenanceRequests();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingFeedback(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!user || !tenantData) return;

    try {
      setEditLoading(true);
      const { error } = await supabase
        .from('tenants')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          contact_number: editForm.contact_number,
          branch: editForm.branch,
          emergency_contact_name: editForm.emergency_contact_name,
          emergency_contact_phone: editForm.emergency_contact_phone,
          emergency_contact_relationship: editForm.emergency_contact_relationship,
          occupation: editForm.occupation,
          company: editForm.company,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setEditModalOpen(false);
      // Refresh tenant data
      await fetchTenantData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!tenantData) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('tenant_id', tenantData.tenant_id)
        .eq('status', 'unread');

      if (error) {
        console.error('Error marking notifications as read:', error);
        toast({
          title: "Error",
          description: "Failed to mark notifications as read.",
          variant: "destructive"
        });
        return;
      }

      // Refresh notifications
      await fetchNotifications();

      toast({
        title: "All Notifications Marked Read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive"
      });
    }
  };

  const handleNotificationAction = async (notificationId: number, action: string) => {
    try {
      if (action === 'marked as read') {
        const { error } = await supabase
          .from('notifications')
          .update({ status: 'read' })
          .eq('notification_id', notificationId);

        if (error) throw error;
      } else if (action === 'deleted') {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('notification_id', notificationId);

        if (error) throw error;
      }

      // Refresh notifications
      await fetchNotifications();

      toast({
        title: "Notification Updated",
        description: `Notification ${action} successfully.`,
      });
    } catch (error) {
      console.error(`Error ${action} notification:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.replace('marked as ', 'mark as ')} notification.`,
        variant: "destructive"
      });
    }
  };

  const handleSettingsChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    toast({
      title: "Settings Updated",
      description: `Notification ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found.",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (changePasswordForm.currentPassword === changePasswordForm.newPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password.",
        variant: "destructive"
      });
      return;
    }

    setChangingPassword(true);

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: changePasswordForm.currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect.');
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: changePasswordForm.newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Reset form and close dialog
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setChangePasswordDialogOpen(false);

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Helper functions for notifications
  const getFilteredNotifications = () => {
    if (notificationFilter === 'all') return notifications;
    if (notificationFilter === 'unread') return notifications.filter(n => n.status === 'unread');
    if (notificationFilter === 'settings') return notifications;
    return notifications.filter(n => n.notification_type === notificationFilter);
  };

  const getNotificationCounts = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => n.status === 'unread').length;
    const payment = notifications.filter(n => n.notification_type === 'payment').length;
    const maintenance = notifications.filter(n => n.notification_type === 'maintenance').length;
    const general = notifications.filter(n => n.notification_type === 'general').length;

    return { total, unread, payment, maintenance, general };
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'maintenance':
        return <Wrench className="w-6 h-6 text-blue-600" />;
      case 'emergency':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'general':
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationPriority = (type: string) => {
    switch (type) {
      case 'emergency':
        return { label: 'high priority', color: 'bg-red-100 text-red-800' };
      case 'payment':
        return { label: 'medium priority', color: 'bg-orange-100 text-orange-800' };
      case 'maintenance':
        return { label: 'medium priority', color: 'bg-orange-100 text-orange-800' };
      case 'general':
      default:
        return { label: 'low priority', color: 'bg-green-100 text-green-800' };
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (tenantData) {
      setEditForm({
        first_name: tenantData.first_name || '',
        last_name: tenantData.last_name || '',
        contact_number: tenantData.contact_number || '',
        email: tenantData.email || '',
        branch: tenantData.branch || '',
        emergency_contact_name: tenantData.emergency_contact_name || '',
        emergency_contact_phone: tenantData.emergency_contact_phone || '',
        emergency_contact_relationship: tenantData.emergency_contact_relationship || '',
        occupation: tenantData.occupation || '',
        company: tenantData.company || ''
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!tenantData) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          contact_number: editForm.contact_number
        })
        .eq('tenant_id', tenantData.tenant_id);

      if (error) throw error;

      setTenantData({
        ...tenantData,
        ...editForm
      });

      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Portal</h1>
              <p className="text-gray-600">
                {loading ? 'Loading...' : tenantData ?
                  `${tenantData.branch ? tenantData.branch.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Branch'}${contractData?.units?.unit_number ? ` • Unit ${contractData.units.unit_number}` : ''}` :
                  'No tenant data'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {loading ? 'Loading...' : tenantData ? `${tenantData.first_name} ${tenantData.last_name}`.trim() : user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Email Confirmation Banner */}
      {user && !user.email_confirmed_at && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <EmailConfirmationBanner userEmail={user.email || ''} />
        </div>
      )}

      {/* Show loading state */}
      {(loading || authLoading) && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      )}

      {/* Show message if not authenticated */}
      {!authLoading && !user && !loading && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
              <Button onClick={() => navigate('/')}>Go to Login</Button>
            </div>
          </div>
        </div>
      )}

      {/* Show dashboard */}
      {tenantData && user && tenantData.tenant_id && !loading && (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation */}
          <nav className="bg-white border-b border-gray-200 px-6 mb-8">
            <div className="max-w-7xl mx-auto">
              <TabsList className="grid w-full grid-cols-6 h-auto">
                <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
                <TabsTrigger value="profile" className="py-3">Profile</TabsTrigger>
                <TabsTrigger value="payments" className="py-3">Payments</TabsTrigger>
                <TabsTrigger value="qr-pay" className="py-3">QR Pay</TabsTrigger>
                <TabsTrigger value="maintenance" className="py-3">Maintenance</TabsTrigger>
                <TabsTrigger value="notifications" className="py-3">Notifications</TabsTrigger>
              </TabsList>
            </div>
          </nav>
          <TabsContent value="overview" className="mt-0">
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Welcome back, {loading ? 'Loading...' : tenantData ? `${tenantData.first_name}!` : 'User!'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Here's your rental summary for {contractData?.units?.unit_number ? `Unit ${contractData.units.unit_number}` : 'your unit'}
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
                        {(() => {
                          const nextPayment = calculateNextPaymentDue();
                          if (!nextPayment) {
                            return <p className="text-2xl font-bold text-gray-400">-</p>;
                          }
                          const isOverdue = nextPayment.daysUntilDue < 0;
                          return (
                            <p className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {isOverdue ? '-' : ''}{Math.abs(nextPayment.daysUntilDue)} {Math.abs(nextPayment.daysUntilDue) === 1 ? 'day' : 'days'}
                            </p>
                          );
                        })()}
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₱{contractData?.units?.monthly_rent?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Balance</p>
                        {(() => {
                          const balance = calculateCurrentBalance();
                          const isPositive = balance >= 0;
                          return (
                            <p className={`text-2xl font-bold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                              {isPositive ? '' : '-'}₱{Math.abs(balance).toLocaleString()}
                            </p>
                          );
                        })()}
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        calculateCurrentBalance() >= 0 ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <CheckCircle className={`w-6 h-6 ${
                          calculateCurrentBalance() >= 0 ? 'text-red-600' : 'text-green-600'
                        }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
                        <p className="text-2xl font-bold text-gray-900">{maintenanceStats.total}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                        <p className="text-2xl font-bold text-gray-900">{getNotificationCounts().unread}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contract Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Information</CardTitle>
                    <p className="text-sm text-gray-600">Your current rental agreement details</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contract Period:</span>
                        <span className="font-medium">
                          {contractData?.start_date && contractData?.end_date
                            ? `${new Date(contractData.start_date).toLocaleDateString()} to ${new Date(contractData.end_date).toLocaleDateString()}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="font-medium">
                          ₱{contractData?.units?.monthly_rent?.toLocaleString() || '15,000'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Due Date:</span>
                        <span className="font-medium">15th of each month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Deposit:</span>
                        <span className="font-medium">₱30,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Number:</span>
                        <span className="font-medium">
                          {contractData?.units?.unit_number || 'Not assigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Branch:</span>
                        <span className="font-medium">
                          {loading ? 'Loading...' : tenantData?.branch || 'Unknown Branch'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <p className="text-sm text-gray-600">Common tasks and shortcuts • Use Ctrl+1-6 for quick access</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {quickActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="flex flex-col items-center justify-center h-32 space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-colors relative"
                          onClick={() => handleQuickAction(action.id)}
                          title={`${action.description} (Ctrl+${quickActions.indexOf(action) + 1})`}
                        >
                          <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-100 px-1 rounded">
                            ⌘{quickActions.indexOf(action) + 1}
                          </div>
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            {action.icon}
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-medium block">{action.title}</span>
                            <span className="text-xs text-gray-500">{action.description}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* About Us Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About Us</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>Business Permit</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Official business permit documentation</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileText className="w-16 h-16 text-gray-400 mb-4" />
                      <div className="text-center space-y-2">
                        <h4 className="font-semibold text-gray-900">Prime Living Business Permit</h4>
                        <p className="text-sm text-gray-600">Business Permit No. 2025-001234</p>
                        <p className="text-sm text-gray-600">Issued: January 1, 2025</p>
                        <p className="text-sm text-gray-600">Valid Until: December 31, 2025</p>
                        <div className="mt-4 w-full max-w-md h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center p-4">
                            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-bold text-gray-700 mb-2">BUSINESS PERMIT</p>
                            <p className="text-sm text-gray-600 mb-1">Prime Living Properties</p>
                            <p className="text-xs text-gray-500">123 Main Street, Metro Manila</p>
                            <p className="text-xs text-gray-500 mt-2">Permit No: 2025-001234</p>
                            <p className="text-xs text-gray-500">Valid: Jan 1, 2025 - Dec 31, 2025</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => {
                            // Create a simple PDF-like view
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                  <head>
                                    <title>Business Permit - Prime Living</title>
                                    <style>
                                      body {
                                        font-family: Arial, sans-serif;
                                        padding: 40px;
                                        max-width: 800px;
                                        margin: 0 auto;
                                      }
                                      .header {
                                        text-align: center;
                                        border-bottom: 3px solid #000;
                                        padding-bottom: 20px;
                                        margin-bottom: 30px;
                                      }
                                      .content {
                                        line-height: 1.8;
                                      }
                                      .info-row {
                                        margin: 15px 0;
                                        padding: 10px;
                                        background: #f5f5f5;
                                        border-left: 4px solid #000;
                                      }
                                      .label {
                                        font-weight: bold;
                                        display: inline-block;
                                        width: 200px;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="header">
                                      <h1>BUSINESS PERMIT</h1>
                                      <h2>Republic of the Philippines</h2>
                                    </div>
                                    <div class="content">
                                      <div class="info-row">
                                        <span class="label">Business Name:</span> Prime Living Properties
                                      </div>
                                      <div class="info-row">
                                        <span class="label">Business Address:</span> 123 Main Street, Metro Manila
                                      </div>
                                      <div class="info-row">
                                        <span class="label">Permit Number:</span> 2025-001234
                                      </div>
                                      <div class="info-row">
                                        <span class="label">Issued Date:</span> January 1, 2025
                                      </div>
                                      <div class="info-row">
                                        <span class="label">Valid Until:</span> December 31, 2025
                                      </div>
                                      <div class="info-row">
                                        <span class="label">Business Type:</span> Real Estate Rental Services
                                      </div>
                                      <div style="margin-top: 40px; text-align: center; border-top: 2px solid #ccc; padding-top: 20px;">
                                        <p>This is to certify that the above-named business is authorized to operate in accordance with local business regulations.</p>
                                        <p style="margin-top: 30px;"><strong>Issued by:</strong> Local Government Unit</p>
                                        <p><strong>Date:</strong> January 1, 2025</p>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWindow.document.close();
                              printWindow.print();
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          View/Download Permit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs content - placeholder for now */}
          <TabsContent value="profile">
            <div className="space-y-8">
              {/* Profile Header */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Tenant Profile</h2>
                <p className="text-gray-600 mt-1">Manage your personal information and view contract details</p>
              </div>

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : !tenantData ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Profile Found</h3>
                    <p className="text-gray-600">Your tenant profile has not been set up yet. Please contact the administrator.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Personal Information</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">Your contact details and personal data</p>
                          </div>
                          {!isEditingProfile ? (
                            <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={() => {
                              setEditForm({
                                first_name: tenantData?.first_name || '',
                                last_name: tenantData?.last_name || '',
                                contact_number: tenantData?.contact_number || '',
                                email: tenantData?.email || '',
                                branch: tenantData?.branch || '',
                                emergency_contact_name: tenantData?.emergency_contact_name || '',
                                emergency_contact_phone: tenantData?.emergency_contact_phone || '',
                                emergency_contact_relationship: tenantData?.emergency_contact_relationship || '',
                                occupation: tenantData?.occupation || '',
                                company: tenantData?.company || ''
                              });
                              setEditModalOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={handleSaveProfile}>
                                Save
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {isEditingProfile ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="first_name">First Name</Label>
                              <Input
                                id="first_name"
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="last_name">Last Name</Label>
                              <Input
                                id="last_name"
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact_number">Phone Number</Label>
                              <Input
                                id="contact_number"
                                value={editForm.contact_number}
                                onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                value={editForm.email}
                                disabled
                                className="bg-gray-50"
                              />
                              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Full Name</p>
                                <p className="font-medium text-gray-900">
                                  {tenantData.first_name} {tenantData.last_name}
                                </p>
                              </div>
                            </div>


                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Phone Number</p>
                                <p className="font-medium text-gray-900">
                                  {tenantData.contact_number || 'Not provided'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Email Address</p>
                                <p className="font-medium text-gray-900">
                                  {tenantData.email || 'Not provided'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Building2 className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Branch</p>
                                <p className="font-medium text-gray-900">
                                  {tenantData.branch ? tenantData.branch.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not provided'}
                                </p>
                              </div>
                            </div>

                            {tenantData.move_in_date && (
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Move-in Date</p>
                                  <p className="font-medium text-gray-900">
                                    {new Date(tenantData.move_in_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Emergency Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Emergency Contact (Philippines)</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Your emergency contact information</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Contact Name</p>
                            <p className="font-medium text-gray-900">
                              {tenantData.emergency_contact_name || 'Not provided'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Contact Phone</p>
                            <p className="font-medium text-gray-900">
                              {tenantData.emergency_contact_phone || 'Not provided'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Relationship</p>
                            <p className="font-medium text-gray-900">
                              {tenantData.emergency_contact_relationship || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Occupation Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Occupation</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Your professional information</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <UserCheck className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Job Title</p>
                            <p className="font-medium text-gray-900">
                              {tenantData.occupation || 'Not provided'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Company</p>
                            <p className="font-medium text-gray-900">
                              {tenantData.company || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rental Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Rental Information</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Your unit and lease details</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {contractData ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Home className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Unit Number</p>
                                <p className="font-medium text-gray-900">{contractData.units?.unit_number || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Building2 className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Unit Type</p>
                                <p className="font-medium text-gray-900">{contractData.units?.unit_type || 'N/A'}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <DollarSign className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Monthly Rent</p>
                                <p className="font-medium text-gray-900">
                                  ₱{contractData.units?.monthly_rent?.toLocaleString() || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Contract Start</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(contractData.start_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Contract End</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(contractData.end_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Contract Status</p>
                                <Badge className={contractData.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                                  {contractData.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No active contract found</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Contract Documents Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Contract Documents</h3>
                <p className="text-gray-600 mb-6">Download and view your rental agreement and related documents</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rental Contract */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DocumentIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Rental Contract</h4>
                          <p className="text-sm text-gray-600 mb-3">Complete rental agreement with terms, conditions, and lease details</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">PDF</Badge>
                            <Button 
                              size="sm" 
                              className="flex items-center space-x-2"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/documents/rental-contract.pdf';
                                link.download = 'rental-contract.pdf';
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Contract</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Rules */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Property Rules</h4>
                          <p className="text-sm text-gray-600 mb-3">Building rules, regulations, and community guidelines</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">PDF</Badge>
                            <Button 
                              size="sm" 
                              className="flex items-center space-x-2"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/documents/property-rules.pdf';
                                link.download = 'property-rules.pdf';
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Rules</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Move-in Checklist */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ClipboardList className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Move-in Checklist</h4>
                          <p className="text-sm text-gray-600 mb-3">Property condition report and inventory checklist</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">PDF</Badge>
                            <Button 
                              size="sm" 
                              className="flex items-center space-x-2"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/documents/move-in-checklist.pdf';
                                link.download = 'move-in-checklist.pdf';
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Checklist</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency Contacts */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Philippine Emergency Contacts</h4>
                          <p className="text-sm text-gray-600 mb-3">Important contact numbers for emergencies and maintenance in the Philippines</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">PDF</Badge>
                            <Button 
                              size="sm" 
                              className="flex items-center space-x-2"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/documents/philippine-emergency-contacts.pdf';
                                link.download = 'philippine-emergency-contacts.pdf';
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Contacts</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Account Settings Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h3>
                <p className="text-gray-600 mb-6">Manage your account preferences and notifications</p>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive payment reminders and important updates via email</p>
                          </div>
                        </div>
                        <Badge className="bg-gray-800 text-white">Enabled</Badge>
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">SMS Notifications</p>
                            <p className="text-sm text-gray-600">Get urgent alerts and payment confirmations via SMS</p>
                          </div>
                        </div>
                        <Badge className="bg-gray-800 text-white">Enabled</Badge>
                      </div>

                      {/* Maintenance Updates */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Wrench className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Maintenance Updates</p>
                            <p className="text-sm text-gray-600">Notifications about maintenance request status changes</p>
                          </div>
                        </div>
                        <Badge className="bg-gray-800 text-white">Enabled</Badge>
                      </div>

                      {/* Change Password */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Password</p>
                            <p className="text-sm text-gray-600">Change your account password</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setChangePasswordDialogOpen(true)}
                          variant="outline"
                          className="bg-white hover:bg-gray-50"
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-8">
              {/* Transaction History Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Transaction History</h2>
                  <p className="text-gray-600 mt-1">View your payment records and download receipts</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          ₱{payments
                            .filter(p => p.status === 'pending')
                            .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Next Due Date</p>
                        {contractData?.end_date ? (
                          <>
                            <p className={`text-2xl font-bold ${
                              new Date(contractData.end_date) > new Date() 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {Math.ceil((new Date(contractData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(contractData.end_date).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold text-gray-400">-</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Paid {paymentYear !== 'all' ? `(${paymentYear})` : '(All Time)'}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₱{payments
                            .filter(p => {
                              if (paymentYear !== 'all') {
                                const year = new Date(p.payment_date).getFullYear().toString();
                                return year === paymentYear;
                              }
                              return true;
                            })
                            .filter(p => p.status === 'confirmed')
                            .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payment Status</p>
                        <Badge className={`mt-1 ${
                          payments.filter(p => p.status === 'pending').length > 0
                            ? 'bg-yellow-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}>
                          {payments.filter(p => p.status === 'pending').length > 0 ? 'pending' : 'current'}
                        </Badge>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Records Section */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Payment Records</h3>
                    <p className="text-gray-600 mt-1">Filter and view your transaction history</p>
                  </div>
                  <div className="flex space-x-4 items-center">
                    <Select value={paymentYear} onValueChange={setPaymentYear}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {Array.from(new Set(payments.map(p => new Date(p.payment_date).getFullYear())))
                          .sort((a, b) => b - a)
                          .map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleDownloadAll}
                      className="bg-gray-800 text-white hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download All</span>
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Period</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Amount</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Method</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Reference</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Payment For</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentsLoading ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                Loading transaction history...
                              </td>
                            </tr>
                          ) : paymentRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-gray-500">
                                No payment records found
                              </td>
                            </tr>
                          ) : (
                            paymentRecords.map((record) => (
                            <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{record.date}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600">{record.period}</td>
                              <td className="py-4 px-6 font-medium">₱{record.amount.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                {getMethodBadge(record.method)}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 font-mono">{record.reference}</td>
                              <td className="py-4 px-6">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600">
                                {record.payment_for || 'Monthly Rent'}
                              </td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Payments */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h4>
                  <p className="text-gray-600 mb-6">Schedule and reminders for future payments</p>

                  <div className="space-y-4">
                    <Card className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">September 2025 Rent</h5>
                              <p className="text-sm text-gray-600">Due: 2025-09-15</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">₱15,000</p>
                            <p className="text-sm text-red-600">-350 days left</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">October 2025 Rent</h5>
                              <p className="text-sm text-gray-600">Due: 2025-10-15</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">₱15,000</p>
                            <p className="text-sm text-gray-600">-320 days</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="qr-pay">
            <div className="space-y-8">
              {/* QR Pay Header */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">QR Code Payment</h2>
                <p className="text-gray-600 mt-1">Pay your rent conveniently using GCash or PayMaya</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Payment Details</CardTitle>
                    <p className="text-sm text-gray-600">Configure your payment amount and method</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment For */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment For</label>
                      <Select value={paymentFor} onValueChange={setPaymentFor}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
                          <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                          <SelectItem value="Water">Water</SelectItem>
                          <SelectItem value="Electricity">Electricity</SelectItem>
                          <SelectItem value="Late Fee">Late Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="gcash"
                            checked={paymentMethod === 'GCash'}
                            onChange={() => setPaymentMethod('GCash')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="gcash" className="text-sm font-medium">GCash</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="paymaya"
                            checked={paymentMethod === 'PayMaya'}
                            onChange={() => setPaymentMethod('PayMaya')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="paymaya" className="text-sm font-medium">PayMaya</label>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₱)</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>

                    {/* Payment Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Payment Options</label>
                      <div className="space-y-3">
                        <Button
                          variant={paymentOption === 'full' ? 'default' : 'outline'}
                          onClick={() => {
                            setPaymentOption('full');
                            setPaymentAmount(15000);
                          }}
                          className="w-full justify-start"
                        >
                          Full Rent (₱15,000)
                        </Button>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Amount:</span>
                          <span className="font-medium">₱{paymentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference Number:</span>
                          <span className="font-medium">
                            {paymentReference || `RENT-${contractData?.units?.unit_number || '000'}-${Math.floor(Math.random() * 1000000)}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tenant:</span>
                          <span className="font-medium">
                            {tenantData ? `${tenantData.first_name} ${tenantData.last_name}`.trim() : user?.user_metadata?.name || 'Tenant'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit:</span>
                          <span className="font-medium">
                            {contractData?.units?.unit_number || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Display QR Button */}
                    <Button
                      onClick={handleGenerateQR}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Display QR Code</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* QR Code Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Payment QR Code</CardTitle>
                    <p className="text-sm text-gray-600">Scan this QR code with your mobile payment app</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {qrGenerated ? (
                      <>
                        {/* QR Code Display */}
                        <div className="flex justify-center">
                          <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center p-4">
                            <img 
                              src={paymentQrImage} 
                              alt="Payment QR Code" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">{paymentMethod} Payment</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">₱{paymentAmount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Pay to: Apartment Management {paymentMethod}</div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Mobile Number:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">09171234567</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyMobile}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Reference:</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {paymentReference || `RENT-${contractData?.units?.unit_number || '000'}-${Math.floor(Math.random() * 1000000)}`}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyReference}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Important Note */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Important:</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                Please include the reference number when making your payment and upload your payment proof below for faster processing.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Success Message */}
                        <div className="flex items-center justify-end space-x-2 text-green-600 mb-4">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">QR Code generated successfully!</span>
                        </div>

                        {/* Done Paying Button */}
                        <Button
                          onClick={handleDonePaying}
                          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Done Paying</span>
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Display a QR code to start your payment</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="space-y-8">
              {/* Maintenance Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Maintenance Requests</h2>
                  <p className="text-gray-600 mt-1">Submit and track maintenance requests for your unit</p>
                </div>
                <Button
                  onClick={handleNewRequest}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Request</span>
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {maintenanceLoadingData ? '...' : maintenanceStats.total}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {maintenanceLoadingData ? '...' : maintenanceStats.pending}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">In Progress</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {maintenanceLoadingData ? '...' : maintenanceStats.inProgress}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {maintenanceLoadingData ? '...' : maintenanceStats.completed}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Your Maintenance Requests */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Maintenance Requests</h3>
                <p className="text-gray-600 mb-6">Track the status of your submitted requests</p>

                {maintenanceLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading maintenance requests...</p>
                    </div>
                  </div>
                ) : maintenanceRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Requests</h3>
                    <p className="text-gray-600 mb-4">You haven't submitted any maintenance requests yet.</p>
                    <Button
                      onClick={handleNewRequest}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit Your First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRequests.map((request) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'completed': return 'bg-green-800 text-white';
                          case 'in_progress': return 'bg-blue-100 text-blue-800';
                          case 'pending': return 'bg-gray-100 text-gray-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };

                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'urgent': return 'bg-red-100 text-red-800';
                          case 'high': return 'bg-red-100 text-red-800';
                          case 'medium': return 'bg-yellow-100 text-yellow-800';
                          case 'low': return 'bg-green-100 text-green-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };

                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'completed': return <CheckCircle className="w-6 h-6 text-green-600" />;
                          case 'in_progress': return <Wrench className="w-6 h-6 text-blue-600" />;
                          case 'pending': return <Clock className="w-6 h-6 text-gray-500" />;
                          default: return <Clock className="w-6 h-6 text-gray-500" />;
                        }
                      };

                      const formatDate = (dateString: string) => {
                        return new Date(dateString).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      };

                      return (
                        <Card key={request.request_id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Wrench className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {request.description?.substring(0, 50)}...
                                    </h4>
                                    <Badge className={getPriorityColor(request.priority)}>
                                      {request.priority}
                                    </Badge>
                                    <Badge className={getStatusColor(request.status)}>
                                      {request.status}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 mb-4">
                                    {request.description}
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Submitted:</span>
                                      <span className="ml-2 font-medium">
                                        {formatDate(request.created_date)}
                                      </span>
                                    </div>
                                    {request.resolved_date && (
                                      <div>
                                        <span className="text-gray-500">Resolved:</span>
                                        <span className="ml-2 font-medium">
                                          {formatDate(request.resolved_date)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Priority:</span> {request.priority}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-medium">Status:</span> {request.status}
                                    </p>
                                  </div>

                                  {/* Feedback Section for Completed/Resolved Requests */}
                                  {request.resolved_date && (
                                    <div className="mt-4 border-t pt-4">
                                      {request.tenant_feedback ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                          <div className="flex items-start space-x-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                            <h5 className="font-semibold text-gray-900">Your Feedback</h5>
                                          </div>
                                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {request.tenant_feedback}
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                          <h5 className="font-semibold text-gray-900 mb-2">Provide Feedback</h5>
                                          <p className="text-sm text-gray-600 mb-3">
                                            Please let us know if the maintenance was fixed properly or if there are any issues.
                                          </p>
                                          <Textarea
                                            placeholder="Enter your feedback about the maintenance work..."
                                            value={feedbackText[request.request_id] || ''}
                                            onChange={(e) => setFeedbackText(prev => ({
                                              ...prev,
                                              [request.request_id]: e.target.value
                                            }))}
                                            className="mb-3"
                                            rows={4}
                                            disabled={submittingFeedback[request.request_id]}
                                          />
                                          <Button
                                            onClick={() => handleSubmitFeedback(request.request_id)}
                                            disabled={submittingFeedback[request.request_id] || !feedbackText[request.request_id]?.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            size="sm"
                                          >
                                            {submittingFeedback[request.request_id] ? 'Submitting...' : 'Submit Feedback'}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center">
                                {getStatusIcon(request.status)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Emergency Contacts and Tips */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Emergency Contacts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Philippine Emergency Contacts</CardTitle>
                    <p className="text-sm text-gray-600">For urgent issues that need immediate attention</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <PhoneCall className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Emergency Hotline</h4>
                        <p className="text-lg font-bold text-red-600">911</p>
                        <p className="text-sm text-gray-600">24/7 for all emergencies (fire, medical, police)</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Maintenance Office</h4>
                        <p className="text-lg font-bold text-blue-600">(02) 8765-4321</p>
                        <p className="text-sm text-gray-600">Mon-Fri 8AM-5PM for general maintenance</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Fire Department</h4>
                        <p className="text-lg font-bold text-green-600">911</p>
                        <p className="text-sm text-gray-600">Fire emergencies and rescue operations</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Police</h4>
                        <p className="text-lg font-bold text-purple-600">911</p>
                        <p className="text-sm text-gray-600">Crime reporting and police assistance</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Medical Emergency</h4>
                        <p className="text-lg font-bold text-orange-600">911</p>
                        <p className="text-sm text-gray-600">Ambulance and medical emergencies</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Maintenance Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Philippine Maintenance Tips</CardTitle>
                    <p className="text-sm text-gray-600">Prevent common issues with these simple tips for Philippine living</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Plumbing Tips */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Droplets className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-900">Plumbing</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Don't flush anything other than toilet paper</li>
                          <li>• Report small leaks immediately (common in rainy season)</li>
                          <li>• Clean sink drains regularly to prevent clogging</li>
                          <li>• Don't pour cooking oil down the drain</li>
                          <li>• Check for water pressure issues during peak hours</li>
                        </ul>
                      </div>

                      {/* Electrical Tips */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-gray-900">Electrical</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Don't overload power outlets (220V system)</li>
                          <li>• Replace burnt out bulbs promptly</li>
                          <li>• Keep electrical appliances away from water</li>
                          <li>• Report flickering lights or sparks immediately</li>
                          <li>• Use surge protectors during typhoon season</li>
                          <li>• Check for loose connections after power outages</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-8">
              {/* Notifications Header */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                <p className="text-gray-600 mt-1">Stay updated with important messages and alerts</p>
              </div>

              {/* Filter Buttons and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={notificationFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('all')}
                    className="rounded-full"
                  >
                    All ({getNotificationCounts().total})
                  </Button>
                  <Button
                    variant={notificationFilter === 'unread' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('unread')}
                    className="rounded-full"
                  >
                    Unread ({getNotificationCounts().unread})
                  </Button>
                  <Button
                    variant={notificationFilter === 'payment' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('payment')}
                    className="rounded-full"
                  >
                    Payment ({getNotificationCounts().payment})
                  </Button>
                  <Button
                    variant={notificationFilter === 'maintenance' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('maintenance')}
                    className="rounded-full"
                  >
                    Maintenance ({getNotificationCounts().maintenance})
                  </Button>
                  <Button
                    variant={notificationFilter === 'general' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('general')}
                    className="rounded-full"
                  >
                    General ({getNotificationCounts().general})
                  </Button>
                  <Button
                    variant={notificationFilter === 'settings' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('settings')}
                    className="rounded-full"
                  >
                    Settings
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleMarkAllRead}
                    className="flex items-center space-x-2"
                    disabled={getNotificationCounts().unread === 0}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark All Read</span>
                  </Button>
                  <Badge className="bg-gray-800 text-white">
                    {getNotificationCounts().unread} unread
                  </Badge>
                </div>
              </div>

              {/* Notifications List or Settings */}
              {notificationFilter === 'settings' ? (
                <div className="space-y-8">
                  {/* Notification Settings Header */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Notification Settings</h3>
                    <p className="text-gray-600 mt-1">Customize how and when you receive notifications</p>
                  </div>

                  {/* Delivery Methods */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <SettingsIcon className="w-5 h-5" />
                        <span>Delivery Methods</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MailIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <Label className="text-base font-medium">Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="w-5 h-5 text-gray-600" />
                          <div>
                            <Label className="text-base font-medium">SMS Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                          </div>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => handleSettingsChange('smsNotifications', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Types */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BellIcon className="w-5 h-5" />
                        <span>Notification Types</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Payment Reminders</Label>
                          <p className="text-sm text-gray-600">Rent due notifications and payment confirmations</p>
                        </div>
                        <Switch
                          checked={notificationSettings.paymentReminders}
                          onCheckedChange={(checked) => handleSettingsChange('paymentReminders', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Maintenance Updates</Label>
                          <p className="text-sm text-gray-600">Status updates for your maintenance requests</p>
                        </div>
                        <Switch
                          checked={notificationSettings.maintenanceUpdates}
                          onCheckedChange={(checked) => handleSettingsChange('maintenanceUpdates', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">General Announcements</Label>
                          <p className="text-sm text-gray-600">Building news and general information</p>
                        </div>
                        <Switch
                          checked={notificationSettings.generalAnnouncements}
                          onCheckedChange={(checked) => handleSettingsChange('generalAnnouncements', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">Emergency Alerts</Label>
                          <p className="text-sm text-gray-600">Critical safety and emergency notifications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emergencyAlerts}
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500">* Emergency alerts cannot be disabled for safety reasons</p>
                    </CardContent>
                  </Card>

                  {/* Notification Timing */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Timing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Payment reminders: 7, 3, and 1 day before due date</li>
                        <li>• Maintenance updates: Immediate when status changes</li>
                        <li>• General announcements: As needed during business hours</li>
                        <li>• Emergency alerts: Immediate, any time</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                  ) : getFilteredNotifications().length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-gray-600">
                          {notificationFilter === 'unread'
                            ? "You're all caught up! No unread notifications."
                            : notificationFilter === 'all'
                              ? "You don't have any notifications yet."
                              : `No ${notificationFilter} notifications found.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    getFilteredNotifications().map((notification) => {
                      const priority = getNotificationPriority(notification.notification_type);
                      const isUnread = notification.status === 'unread';
                      const isEmergency = notification.notification_type === 'emergency';

                      return (
                        <Card
                          key={notification.notification_id}
                          className={`${isEmergency ? 'border-l-4 border-l-red-500' : isUnread ? 'border-l-4 border-l-blue-500' : ''}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="relative">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.notification_type === 'payment' ? 'bg-green-100' :
                                    notification.notification_type === 'maintenance' ? 'bg-blue-100' :
                                      notification.notification_type === 'emergency' ? 'bg-red-100' :
                                        'bg-gray-100'
                                    }`}>
                                    {getNotificationIcon(notification.notification_type)}
                                  </div>
                                  {isUnread && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      {notification.notification_type === 'payment' ? 'Payment Notification' :
                                        notification.notification_type === 'maintenance' ? 'Maintenance Update' :
                                          notification.notification_type === 'emergency' ? 'Emergency Alert' :
                                            'General Notification'}
                                    </h4>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {notification.notification_type}
                                    </Badge>
                                    {!isEmergency && (
                                      <Badge className={priority.color}>
                                        {priority.label}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-600 mb-3">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                      {new Date(notification.sent_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isUnread && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNotificationAction(notification.notification_id, 'marked as read')}
                                    className="h-8 w-8 p-0"
                                    title="Mark as read"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNotificationAction(notification.notification_id, 'deleted')}
                                  className="h-8 w-8 p-0"
                                  title="Delete notification"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      )}

      {/* Maintenance Request Modal */}
      <Dialog open={maintenanceModalOpen} onOpenChange={setMaintenanceModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4">
            <DialogTitle className="text-2xl font-bold">Submit Maintenance Request</DialogTitle>
            <DialogDescription>
              Describe the issue you're experiencing and we'll address it promptly
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 px-6">
            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={maintenanceForm.category} onValueChange={(value) => handleMaintenanceFormChange('category', value)}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="appliance">Appliance</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={maintenanceForm.priority} onValueChange={(value) => handleMaintenanceFormChange('priority', value)}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait a few days</SelectItem>
                    <SelectItem value="medium">Medium - Should be fixed soon</SelectItem>
                    <SelectItem value="high">High - Needs immediate attention</SelectItem>
                    <SelectItem value="urgent">Urgent - Emergency situation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the problem"
                value={maintenanceForm.title}
                onChange={(e) => handleMaintenanceFormChange('title', e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about the issue, including when it started, what you've tried, and how it affects you"
                value={maintenanceForm.description}
                onChange={(e) => handleMaintenanceFormChange('description', e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>

            {/* Photos Section */}
            <div>
              <Label className="text-base font-medium">Photos (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload photos to help us understand the issue better</p>
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('photos')?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photos</span>
                </Button>
                {maintenanceForm.photos.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {maintenanceForm.photos.length} photo(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Emergency Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Emergency?</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    For urgent issues like gas leaks, electrical sparks, or flooding, please call the emergency hotline immediately: <strong>(02) 8123-4567</strong>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 border-t pt-4 mt-4 px-6 pb-6">
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleCloseMaintenanceModal}
                disabled={maintenanceLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitMaintenanceRequest}
                disabled={maintenanceLoading}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                {maintenanceLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and contact details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editForm.first_name}
                  onChange={(e) => handleEditFormChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editForm.last_name}
                  onChange={(e) => handleEditFormChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Phone Number</Label>
              <Input
                id="contact_number"
                value={editForm.contact_number}
                onChange={(e) => handleEditFormChange('contact_number', e.target.value)}
                placeholder="+63 917 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={editForm.branch}
                onValueChange={(value) => handleEditFormChange('branch', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cainta-rizal">Cainta Rizal Branch</SelectItem>
                  <SelectItem value="sampaloc-manila">Sampaloc Manila Branch</SelectItem>
                  <SelectItem value="cubao-qc">Cubao QC Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Emergency Contact (Philippines)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={editForm.emergency_contact_name}
                    onChange={(e) => handleEditFormChange('emergency_contact_name', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={editForm.emergency_contact_phone}
                    onChange={(e) => handleEditFormChange('emergency_contact_phone', e.target.value)}
                    placeholder="+63 917 123 4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={editForm.emergency_contact_relationship}
                  onChange={(e) => handleEditFormChange('emergency_contact_relationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>

            {/* Occupation Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Occupation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Job Title</Label>
                  <Input
                    id="occupation"
                    value={editForm.occupation}
                    onChange={(e) => handleEditFormChange('occupation', e.target.value)}
                    placeholder="Enter your job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editForm.company}
                    onChange={(e) => handleEditFormChange('company', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Receipt</DialogTitle>
            <DialogDescription>
              Upload a photo or screenshot of your payment receipt for verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt File</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptFileChange}
                className="cursor-pointer"
                key={receiptModalOpen ? 'open' : 'closed'}
              />
              <p className="text-xs text-gray-500">
                Accepted formats: JPG, PNG, PDF (Max 10MB)
              </p>
              {receiptFile && (
                <p className="text-xs text-green-600">
                  Selected: {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Preview */}
            {receiptPreview && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                  {receiptFile?.type.startsWith('image/') ? (
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="max-h-64 max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">{receiptFile?.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Details Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-semibold">₱{paymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reference:</span>
                <span className="text-sm font-semibold">
                  {paymentReference || `RENT-${contractData?.units?.unit_number || '000'}-${Date.now().toString().slice(-6)}`}
                </span>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Please ensure your receipt clearly shows the transaction details, 
                amount, and reference number for faster processing.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setReceiptFile(null);
                setReceiptPreview(null);
                setReceiptModalOpen(false);
              }}
              disabled={uploadingReceipt}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadReceipt}
              disabled={!receiptFile || uploadingReceipt}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {uploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={changePasswordForm.currentPassword}
                onChange={(e) => setChangePasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                disabled={changingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={changePasswordForm.newPassword}
                onChange={(e) => setChangePasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min. 6 characters)"
                disabled={changingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={changePasswordForm.confirmPassword}
                onChange={(e) => setChangePasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                disabled={changingPassword}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setChangePasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setChangePasswordDialogOpen(false);
              }}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              {changingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Chatbot */}
      <TenantFAQChatbot />
    </div>
  );
};

export default TenantDashboard;
