import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
  Bell as BellIcon
} from 'lucide-react';

const TenantDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentYear, setPaymentYear] = useState('2024');
  const [tenantData, setTenantData] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('All Status');
  const [paymentFor, setPaymentFor] = useState('Monthly Rent');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [paymentAmount, setPaymentAmount] = useState(15000);
  const [paymentOption, setPaymentOption] = useState('full');
  const [qrGenerated, setQrGenerated] = useState(false);
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
  const [maintenanceLoadingData, setMaintenanceLoadingData] = useState(false);
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch tenant data from Supabase
  const fetchTenantData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching tenant data:', error);
        toast({
          title: "Error",
          description: "Failed to load tenant data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setTenantData(data);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        title: "Error",
        description: "Failed to load tenant data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  // Load tenant data when component mounts
  useEffect(() => {
    if (user) {
      fetchTenantData();
    }
  }, [user]);

  // Load maintenance requests when tenant data is available
  useEffect(() => {
    if (tenantData) {
      fetchMaintenanceRequests();
    }
  }, [tenantData]);

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
      description: 'Make rent payment'
    },
    {
      id: 'report-issue',
      title: 'Report Issue',
      icon: <Wrench className="w-6 h-6" />,
      description: 'Report maintenance issue'
    },
    {
      id: 'payment-history',
      title: 'Payment History',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'View payment records'
    },
    {
      id: 'view-alerts',
      title: 'View Alerts',
      icon: <Bell className="w-6 h-6" />,
      description: 'Check notifications'
    }
  ];

  const handleQuickAction = (actionId: string) => {
    toast({
      title: "Action Selected",
      description: `${actionId.replace('-', ' ')} functionality will be implemented.`,
    });
  };

  const paymentRecords = [
    {
      id: 1,
      date: '2024-08-15',
      period: 'August 2024',
      amount: 15000,
      method: 'gcash',
      reference: 'RENT-A101-789123',
      status: 'confirmed'
    },
    {
      id: 2,
      date: '2024-07-15',
      period: 'July 2024',
      amount: 15000,
      method: 'gcash',
      reference: 'RENT-A101-654987',
      status: 'confirmed'
    },
    {
      id: 3,
      date: '2024-06-15',
      period: 'June 2024',
      amount: 15000,
      method: 'cash',
      reference: 'RENT-A101-321456',
      status: 'confirmed'
    },
    {
      id: 4,
      date: '2024-05-15',
      period: 'May 2024',
      amount: 15000,
      method: 'bank transfer',
      reference: 'RENT-A101-987654',
      status: 'confirmed'
    },
    {
      id: 5,
      date: '2024-04-15',
      period: 'April 2024',
      amount: 15000,
      method: 'gcash',
      reference: 'RENT-A101-456789',
      status: 'confirmed'
    }
  ];

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
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Badge className="bg-green-800 text-white">confirmed</Badge>
          </div>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleDownloadReceipt = (recordId: number) => {
    toast({
      title: "Receipt Downloaded",
      description: `Receipt for payment #${recordId} has been downloaded.`,
    });
  };

  const handleDownloadAll = () => {
    toast({
      title: "All Receipts Downloaded",
      description: "All payment receipts have been downloaded as a ZIP file.",
    });
  };

  const handleGenerateQR = () => {
    setQrGenerated(true);
    toast({
      title: "QR Code Generated",
      description: "QR code has been generated successfully!",
    });
  };

  const handleCopyReference = () => {
    const reference = `RENT-A-101-${Math.floor(Math.random() * 1000000)}`;
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

      // Get a unit_id (for now, we'll use a default or first available unit)
      // In a real app, you'd get this from the tenant's current contract
      let unitId = 1; // Default unit_id
      
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('unit_id')
        .eq('status', 'available')
        .limit(1);

      if (unitError || !unitData || unitData.length === 0) {
        console.warn('No available unit found, using default unit_id');
        // Try to get any unit if no available units
        const { data: anyUnit } = await supabase
          .from('units')
          .select('unit_id')
          .limit(1);
        
        if (anyUnit && anyUnit.length > 0) {
          unitId = anyUnit[0].unit_id;
        }
      } else {
        unitId = unitData[0].unit_id;
      }

      // Insert maintenance request into database
      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: tenantRecord.tenant_id,
          unit_id: unitId,
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

  const handleMarkAllRead = () => {
    toast({
      title: "All Notifications Marked Read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleNotificationAction = (notificationId: number, action: string) => {
    toast({
      title: "Notification Updated",
      description: `Notification ${action} successfully.`,
    });
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
        email: tenantData.email || ''
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
                {loading ? 'Loading...' : tenantData ? `${tenantData.branch || 'Unknown Branch'} • Unit A-101` : 'No tenant data'}
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
                  <h2 className="text-3xl font-bold text-gray-900">Welcome back, Ana!</h2>
                  <p className="text-gray-600 mt-1">Here's your rental summary for Unit A-101</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Contract Progress</p>
                    <p className="text-2xl font-bold text-gray-900">163%</p>
                  </div>
                  <div className="w-32">
                    <Progress value={163} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
                        <p className="text-2xl font-bold text-red-600">-350 days</p>
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
                        <p className="text-2xl font-bold text-gray-900">₱15,000</p>
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
                        <p className="text-2xl font-bold text-green-600">₱0</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
                        <p className="text-2xl font-bold text-gray-900">2</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-blue-600" />
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
                        <span className="font-medium">2024-01-15 to 2025-01-14</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="font-medium">₱15,000</span>
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
                        <span className="font-medium">A-101</span>
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
                    <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {quickActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="flex flex-col items-center justify-center h-24 space-y-2 hover:bg-gray-50"
                          onClick={() => handleQuickAction(action.id)}
                        >
                          {action.icon}
                          <span className="text-sm font-medium">{action.title}</span>
                        </Button>
                      ))}
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
                            <Button variant="outline" size="sm" className="flex items-center space-x-2" onClick={handleEditProfile}>
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
                            <Button size="sm" className="flex items-center space-x-2">
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
                            <Button size="sm" className="flex items-center space-x-2">
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
                            <Button size="sm" className="flex items-center space-x-2">
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
                            <Button size="sm" className="flex items-center space-x-2">
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

                      {/* Auto-pay Reminders */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Auto-pay Reminders</p>
                            <p className="text-sm text-gray-600">Automatic reminders for rent due dates</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">Disabled</Badge>
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-8">
              {/* Payment History Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Payment History</h2>
                  <p className="text-gray-600 mt-1">View your payment records and download receipts</p>
                </div>
                <Button 
                  onClick={handleDownloadAll}
                  className="bg-gray-800 text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All</span>
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Balance</p>
                        <p className="text-2xl font-bold text-green-600">₱0</p>
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
                        <p className="text-sm font-medium text-gray-600">Next Due Date</p>
                        <p className="text-2xl font-bold text-red-600">-350 days</p>
                        <p className="text-xs text-gray-500">2024-09-15</p>
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
                        <p className="text-sm font-medium text-gray-600">Total Paid (2024)</p>
                        <p className="text-2xl font-bold text-gray-900">₱75,000</p>
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
                        <Badge className="bg-gray-800 text-white mt-1">current</Badge>
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
                    <p className="text-gray-600 mt-1">Filter and view your payment history</p>
                  </div>
                  <div className="flex space-x-4">
                    <Select value={paymentYear} onValueChange={setPaymentYear}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
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
                            <th className="text-left py-4 px-6 font-medium text-gray-700">Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentRecords.map((record) => (
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
                              <td className="py-4 px-6">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(record.id)}
                                  className="p-2"
                                >
                                  <Receipt className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Summary Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Summary (2024)</h3>
                <p className="text-gray-600 mb-6">Overview of your payment activity</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Payments Made</p>
                          <p className="text-3xl font-bold text-gray-900">5</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Amount Paid</p>
                          <p className="text-3xl font-bold text-gray-900">₱75,000</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Average Payment</p>
                          <p className="text-3xl font-bold text-gray-900">₱15,000</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Method Breakdown */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Breakdown</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Gcash</p>
                        <p className="text-2xl font-bold text-gray-900">60%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Paymaya</p>
                        <p className="text-2xl font-bold text-gray-900">0%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Cash</p>
                        <p className="text-2xl font-bold text-gray-900">20%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Bank Transfer</p>
                        <p className="text-2xl font-bold text-gray-900">20%</p>
                      </CardContent>
                    </Card>
                  </div>
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
                              <h5 className="font-semibold text-gray-900">September 2024 Rent</h5>
                              <p className="text-sm text-gray-600">Due: 2024-09-15</p>
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
                              <h5 className="font-semibold text-gray-900">October 2024 Rent</h5>
                              <p className="text-sm text-gray-600">Due: 2024-10-15</p>
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
                          <SelectItem value="Utilities">Utilities</SelectItem>
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
                        <Button
                          variant={paymentOption === 'half' ? 'default' : 'outline'}
                          onClick={() => {
                            setPaymentOption('half');
                            setPaymentAmount(7500);
                          }}
                          className="w-full justify-start"
                        >
                          Half Payment
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
                          <span className="font-medium">RENT-A-101-406707</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tenant:</span>
                          <span className="font-medium">{user?.user_metadata?.name || 'Ana Garcia'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit:</span>
                          <span className="font-medium">A-101</span>
                        </div>
                      </div>
                    </div>

                    {/* Generate QR Button */}
                    <Button
                      onClick={handleGenerateQR}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Generate QR Code</span>
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
                          <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="w-56 h-56 bg-black rounded grid grid-cols-8 grid-rows-8 gap-1">
                              {/* Simulated QR Code Pattern */}
                              {Array.from({ length: 64 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`bg-white ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                                />
                              ))}
                            </div>
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
                              <span className="font-medium">RENT-A-101-406707</span>
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
                        <div className="flex items-center justify-end space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">QR Code generated successfully!</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Generate a QR code to start your payment</p>
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
                        <p className="text-lg font-bold text-green-600">117</p>
                        <p className="text-sm text-gray-600">Fire emergencies and rescue operations</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Police</h4>
                        <p className="text-lg font-bold text-purple-600">117</p>
                        <p className="text-sm text-gray-600">Crime reporting and police assistance</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Medical Emergency</h4>
                        <p className="text-lg font-bold text-orange-600">117</p>
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
                    All (6)
                  </Button>
                  <Button
                    variant={notificationFilter === 'unread' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('unread')}
                    className="rounded-full"
                  >
                    Unread (2)
                  </Button>
                  <Button
                    variant={notificationFilter === 'payment' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('payment')}
                    className="rounded-full"
                  >
                    Payment
                  </Button>
                  <Button
                    variant={notificationFilter === 'maintenance' ? 'default' : 'outline'}
                    onClick={() => setNotificationFilter('maintenance')}
                    className="rounded-full"
                  >
                    Maintenance
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
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark All Read</span>
                  </Button>
                  <Badge className="bg-gray-800 text-white">2 unread</Badge>
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
                {/* Payment Reminder (Unread) */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Payment Reminder</h4>
                            <Badge className="bg-blue-100 text-blue-800">payment</Badge>
                            <Badge className="bg-red-100 text-red-800">high priority</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            Your rent payment for September 2024 is due in 3 days. Please settle your payment to avoid late charges.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">2024-08-28</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(1, 'marked as read')}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(1, 'deleted')}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Maintenance Request Update */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Maintenance Request Update</h4>
                            <Badge className="bg-blue-100 text-blue-800">maintenance</Badge>
                            <Badge className="bg-orange-100 text-orange-800">medium priority</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            Your kitchen sink repair has been completed. The technician has fixed the leak and tested the system.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">2024-08-25</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(2, 'deleted')}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Building Maintenance Notice */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Building Maintenance Notice</h4>
                            <Badge className="bg-gray-100 text-gray-800">general</Badge>
                            <Badge className="bg-orange-100 text-orange-800">medium priority</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            Scheduled water system maintenance on September 5, 2024 from 10 AM to 2 PM. Water supply will be temporarily interrupted.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">2024-08-24</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(3, 'deleted')}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Confirmation */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Payment Confirmation</h4>
                            <Badge className="bg-blue-100 text-blue-800">payment</Badge>
                            <Badge className="bg-green-100 text-green-800">low priority</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            Your payment of ₱15,000 for August 2024 has been successfully processed. Thank you for your prompt payment.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">2024-08-15</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(4, 'deleted')}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Maintenance Alert */}
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Emergency Maintenance Alert</h4>
                          </div>
                          <p className="text-gray-600 mb-3">
                            Emergency electrical work required tonight from 10 PM to 6 AM. Power will be temporarily shut off in affected areas.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">2024-08-20</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationAction(5, 'deleted')}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

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
                    <SelectItem value="hvac">HVAC</SelectItem>
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
    </div>
  );
};

export default TenantDashboard;
