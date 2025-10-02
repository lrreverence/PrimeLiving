import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  Home, 
  CreditCard, 
  FileText, 
  Bell, 
  Wrench,
  Plus,
  Download,
  Send,
  LogOut,
  ArrowRight,
  Clock,
  AlertTriangle,
  Search,
  Edit,
  Eye,
  Trash2,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Check,
  X,
  DollarSign,
  AlertTriangle as Warning,
  Calendar as CalendarIcon,
  ChevronDown,
  Mail,
  MessageSquare,
  Trash,
  Play,
  Zap,
  Droplets,
  Thermometer
} from 'lucide-react';

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
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const overviewMetrics = [
    {
      title: 'Total Units',
      value: '24',
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-blue-600'
    },
    {
      title: 'Occupied Units',
      value: '18',
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600'
    },
    {
      title: 'Vacant Units',
      value: '6',
      icon: <Home className="w-6 h-6" />,
      color: 'text-gray-600'
    },
    {
      title: 'Pending Payments',
      value: '3',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add Tenant',
      icon: <Plus className="w-5 h-5" />,
      onClick: () => console.log('Add Tenant')
    },
    {
      title: 'Record Payment',
      icon: <CreditCard className="w-5 h-5" />,
      onClick: () => console.log('Record Payment')
    },
    {
      title: 'Generate Report',
      icon: <Download className="w-5 h-5" />,
      onClick: () => console.log('Generate Report')
    },
    {
      title: 'Send Notice',
      icon: <Send className="w-5 h-5" />,
      onClick: () => console.log('Send Notice')
    }
  ];

  const recentActivity = [
    {
      type: 'payment',
      title: 'Payment received from Ana Garcia (A-101)',
      time: '2 hours ago',
      amount: '₱15,000',
      status: 'completed',
      icon: <CreditCard className="w-5 h-5 text-green-600" />
    },
    {
      type: 'maintenance',
      title: 'Maintenance request from Unit B-205',
      time: '1 day ago',
      status: 'pending',
      icon: <Wrench className="w-5 h-5 text-blue-600" />
    },
    {
      type: 'contract',
      title: 'Contract expiring for Unit C-304',
      time: '3 days ago',
      status: 'urgent',
      icon: <FileText className="w-5 h-5 text-orange-600" />
    }
  ];

  const tenants = [
    {
      id: 1,
      name: 'Ana Garcia',
      email: 'ana.garcia@email.com',
      unit: 'A-101',
      contact: '+63-912-345-6789',
      monthlyRent: 15000,
      contractStart: '2024-01-15',
      contractEnd: '2025-01-14',
      status: 'active',
      balance: 0
    },
    {
      id: 2,
      name: 'Roberto Martinez',
      email: 'roberto.martinez@email.com',
      unit: 'B-205',
      contact: '+63-923-456-7890',
      monthlyRent: 18000,
      contractStart: '2024-03-01',
      contractEnd: '2025-02-28',
      status: 'active',
      balance: 18000
    },
    {
      id: 3,
      name: 'Sofia Reyes',
      email: 'sofia.reyes@email.com',
      unit: 'C-304',
      contact: '+63-934-567-8901',
      monthlyRent: 20000,
      contractStart: '2023-06-01',
      contractEnd: '2024-05-31',
      status: 'inactive',
      balance: 40000
    }
  ];

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const payments = [
    {
      id: 1,
      tenantName: 'Ana Garcia',
      unit: 'A-101',
      amount: 15000,
      period: 'August 2024',
      paymentDate: '2024-08-01',
      method: 'gcash',
      status: 'confirmed'
    },
    {
      id: 2,
      tenantName: 'Roberto Martinez',
      unit: 'B-205',
      amount: 18000,
      period: 'July 2024',
      paymentDate: '2024-07-15',
      method: 'cash',
      status: 'confirmed'
    },
    {
      id: 3,
      tenantName: 'Sofia Reyes',
      unit: 'C-304',
      amount: 20000,
      period: 'August 2024',
      paymentDate: '2024-08-20',
      method: 'bank transfer',
      status: 'pending'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    if (paymentFilter === 'all') return true;
    return payment.status === paymentFilter;
  });

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const confirmedCount = payments.filter(p => p.status === 'confirmed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const documentTypes = [
    'Payment Receipt',
    'Rental Contract',
    'Payment Due Notice',
    'Contract Expiry Notice'
  ];

  const quickGenerateTemplates = [
    {
      id: 'monthly-receipts',
      title: 'Monthly Receipts',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      description: 'Generate monthly payment receipts'
    },
    {
      id: 'due-notices',
      title: 'Due Notices',
      icon: <Warning className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-600',
      description: 'Send payment due notices'
    },
    {
      id: 'expiry-alerts',
      title: 'Expiry Alerts',
      icon: <CalendarIcon className="w-6 h-6" />,
      color: 'bg-red-100 text-red-600',
      description: 'Contract expiry notifications'
    },
    {
      id: 'monthly-report',
      title: 'Monthly Report',
      icon: <Download className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
      description: 'Generate monthly reports'
    }
  ];

  const handleGenerateDocument = () => {
    if (!selectedTenant || !selectedDocumentType) {
      toast({
        title: "Missing Information",
        description: "Please select both tenant and document type.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Document Generated",
      description: `${selectedDocumentType} for ${selectedTenant} has been generated and downloaded.`,
    });
  };

  const handleQuickGenerate = (templateId: string) => {
    toast({
      title: "Document Generated",
      description: `${templateId.replace('-', ' ')} template has been generated and downloaded.`,
    });
  };

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

  const handleSendNotification = () => {
    if (!subject || !message || selectedRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one recipient.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Notification Sent",
      description: `Notification sent to ${selectedRecipients.length} recipient(s) via ${deliveryMethod}.`,
    });

    // Reset form
    setSubject('');
    setMessage('');
    setSelectedRecipients([]);
    setScheduleDate('');
  };

  const handleClearForm = () => {
    setSubject('');
    setMessage('');
    setSelectedRecipients([]);
    setScheduleDate('');
  };

  const maintenanceRequests = [
    {
      id: 1,
      title: 'Kitchen sink leak',
      description: 'Water is leaking from under the kitchen sink. Getting worse...',
      tenant: 'Ana Garcia',
      unit: 'A-101',
      category: 'Plumbing',
      priority: 'high',
      status: 'in progress',
      assignedTo: 'Mario Santos (Plumber)',
      submittedDate: '2024-08-25',
      scheduledDate: '2024-08-30',
      completedDate: null
    },
    {
      id: 2,
      title: 'Light switch not working',
      description: 'Living room light switch stopped working yesterday....',
      tenant: 'Roberto Martinez',
      unit: 'B-205',
      category: 'Electrical',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Unassigned',
      submittedDate: '2024-08-28',
      scheduledDate: null,
      completedDate: null
    },
    {
      id: 3,
      title: 'AC not cooling properly',
      description: 'Air conditioning unit is running but not cooling the room ef...',
      tenant: 'Sofia Reyes',
      unit: 'C-304',
      category: 'HVAC',
      priority: 'low',
      status: 'completed',
      assignedTo: 'Juan Cruz (HVAC Tech)',
      submittedDate: '2024-08-20',
      scheduledDate: '2024-08-22',
      completedDate: '2024-08-23'
    }
  ];

  const filteredMaintenanceRequests = maintenanceRequests.filter(request => {
    if (maintenanceFilter === 'all') return true;
    return request.status === maintenanceFilter;
  });

  const maintenancePendingCount = maintenanceRequests.filter(r => r.status === 'pending').length;
  const maintenanceInProgressCount = maintenanceRequests.filter(r => r.status === 'in progress').length;
  const maintenanceCompletedCount = maintenanceRequests.filter(r => r.status === 'completed').length;
  const maintenanceTotalCount = maintenanceRequests.length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Plumbing':
        return <Droplets className="w-4 h-4" />;
      case 'Electrical':
        return <Zap className="w-4 h-4" />;
      case 'HVAC':
        return <Thermometer className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">high</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Badge className="bg-gray-100 text-gray-800">pending</Badge>
          </div>
        );
      case 'in progress':
        return (
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            <Badge className="bg-blue-100 text-blue-800">in progress</Badge>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <Badge className="bg-gray-800 text-white">completed</Badge>
          </div>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleMaintenanceAction = (requestId: number, action: string) => {
    toast({
      title: "Action Performed",
      description: `${action} action completed for request #${requestId}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Caretaker Dashboard</h1>
              <p className="text-gray-600">Cainta Rizal Branch</p>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
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
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                      <div className={`${metric.color} p-3 rounded-lg bg-gray-50`}>
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Quick Actions</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                        onClick={action.onClick}
                      >
                        {action.icon}
                        <span className="text-sm font-medium">{action.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 mt-1">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{activity.time}</span>
                            {activity.amount && (
                              <span className="text-xs font-medium text-green-600">{activity.amount}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(activity.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tenants">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Tenant Management</h2>
                  <p className="text-gray-600 mt-1">Manage tenant profiles, contracts, and unit assignments.</p>
                </div>
                <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Tenant</span>
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tenants by name or unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Active Tenants Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Tenants</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Current tenant list and contract information.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Unit</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Monthly Rent</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Contract Period</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Balance</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTenants.map((tenant) => (
                          <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{tenant.name}</div>
                                <div className="text-sm text-gray-500">{tenant.email}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                {tenant.unit}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{tenant.contact}</td>
                            <td className="py-4 px-4 font-medium">₱{tenant.monthlyRent.toLocaleString()}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {tenant.contractStart} to {tenant.contractEnd}
                            </td>
                            <td className="py-4 px-4">
                              <Badge 
                                className={
                                  tenant.status === 'active' 
                                    ? 'bg-gray-800 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                                }
                              >
                                {tenant.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <span className={tenant.balance === 0 ? 'text-green-600' : 'text-red-600'}>
                                ₱{tenant.balance.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  {tenant.id === 3 ? <User className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Payment Tracking</h2>
                  <p className="text-gray-600 mt-1">Record and monitor rent payments from tenants</p>
                </div>
                <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Record Payment</span>
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Payments</p>
                        <p className="text-3xl font-bold text-gray-900">₱{totalPayments.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Confirmed</p>
                        <p className="text-3xl font-bold text-gray-900">{confirmedCount}</p>
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
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Filters */}
              <div className="flex space-x-2">
                <Button
                  variant={paymentFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setPaymentFilter('all')}
                  className="rounded-full"
                >
                  All Payments
                </Button>
                <Button
                  variant={paymentFilter === 'confirmed' ? 'default' : 'outline'}
                  onClick={() => setPaymentFilter('confirmed')}
                  className="rounded-full"
                >
                  Confirmed
                </Button>
                <Button
                  variant={paymentFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setPaymentFilter('pending')}
                  className="rounded-full"
                >
                  Pending
                </Button>
              </div>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment History</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Complete payment records and transaction details</p>
                    </div>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Tenant</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Payment Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{payment.tenantName}</div>
                                <div className="text-sm text-gray-500">({payment.unit})</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium">₱{payment.amount.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{payment.period}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{payment.paymentDate}</td>
                            <td className="py-4 px-4">
                              <Badge 
                                className={
                                  payment.method === 'gcash' ? 'bg-blue-100 text-blue-800' :
                                  payment.method === 'cash' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }
                              >
                                {payment.method}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {payment.status === 'confirmed' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                )}
                                <Badge 
                                  className={
                                    payment.status === 'confirmed' 
                                      ? 'bg-gray-800 text-white' 
                                      : 'bg-orange-100 text-orange-800'
                                  }
                                >
                                  {payment.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {payment.status === 'pending' ? (
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                                    <Check className="w-4 h-4 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                                    <X className="w-4 h-4 mr-1" />
                                    Mark Failed
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-8">
              {/* Document Generation Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Document Generation</h2>
                <p className="text-gray-600 mt-1">Generate and manage printable documents</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Generate New Document</CardTitle>
                  <p className="text-sm text-gray-600">Create receipts, contracts, and notices for tenants</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
                      <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={`${tenant.name} (${tenant.unit})`}>
                              {tenant.name} ({tenant.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                      <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button 
                        onClick={handleGenerateDocument}
                        className="bg-gray-800 text-white hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Generate & Download</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Generate Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Generate</h3>
                <p className="text-gray-600 mt-1">Common document templates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickGenerateTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                    onClick={() => handleQuickGenerate(template.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mx-auto mb-4`}>
                        {template.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6">
              {/* Notification System Header */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Notification System</h2>
                <p className="text-gray-600 mt-1">Send SMS and email notifications to tenants</p>
              </div>

              {/* Notification Tabs */}
              <Tabs value={notificationTab} onValueChange={setNotificationTab}>
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
                        <Select value={notificationType} onValueChange={setNotificationType}>
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
                        <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
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
                          onChange={(e) => setSubject(e.target.value)}
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
                          onChange={(e) => setMessage(e.target.value)}
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
                              onCheckedChange={(checked) => handleRecipientChange('All Tenants', checked as boolean)}
                            />
                            <Label htmlFor="all-tenants" className="text-sm font-normal">
                              All Tenants
                            </Label>
                          </div>
                          {tenants.map((tenant) => (
                            <div key={tenant.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tenant-${tenant.id}`}
                                checked={selectedRecipients.includes(`${tenant.name} (${tenant.unit})`)}
                                onCheckedChange={(checked) => handleRecipientChange(`${tenant.name} (${tenant.unit})`, checked as boolean)}
                              />
                              <Label htmlFor={`tenant-${tenant.id}`} className="text-sm font-normal">
                                {tenant.name} ({tenant.unit})
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
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-4 pt-4">
                        <Button 
                          onClick={handleSendNotification}
                          className="bg-gray-800 text-white hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send Now</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleClearForm}
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
                      <CardTitle>Notification Templates</CardTitle>
                      <p className="text-sm text-gray-600">Manage reusable notification templates</p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No templates created yet</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Maintenance & Incidents</h2>
                  <p className="text-gray-600 mt-1">Track and manage maintenance requests and incident reports</p>
                </div>
                <Button className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Request</span>
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-gray-900">{maintenancePendingCount}</p>
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
                        <p className="text-3xl font-bold text-gray-900">{maintenanceInProgressCount}</p>
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
                        <p className="text-3xl font-bold text-gray-900">{maintenanceCompletedCount}</p>
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
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-3xl font-bold text-gray-900">{maintenanceTotalCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-2">
                <Button
                  variant={maintenanceFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setMaintenanceFilter('all')}
                  className="rounded-full"
                >
                  All Requests
                </Button>
                <Button
                  variant={maintenanceFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setMaintenanceFilter('pending')}
                  className="rounded-full"
                >
                  Pending
                </Button>
                <Button
                  variant={maintenanceFilter === 'in progress' ? 'default' : 'outline'}
                  onClick={() => setMaintenanceFilter('in progress')}
                  className="rounded-full"
                >
                  In Progress
                </Button>
                <Button
                  variant={maintenanceFilter === 'completed' ? 'default' : 'outline'}
                  onClick={() => setMaintenanceFilter('completed')}
                  className="rounded-full"
                >
                  Completed
                </Button>
              </div>

              {/* Maintenance Requests Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Maintenance Requests</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Complete list of maintenance requests and incidents</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Request</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Tenant</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned To</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaintenanceRequests.map((request) => (
                          <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{request.title}</div>
                                <div className="text-sm text-gray-500 mt-1">{request.description}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{request.tenant}</div>
                                <div className="text-sm text-gray-500">({request.unit})</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(request.category)}
                                <span className="text-sm text-gray-600">{request.category}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {getPriorityBadge(request.priority)}
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(request.status)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{request.assignedTo}</td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-600">
                                <div>Submitted: {request.submittedDate}</div>
                                {request.scheduledDate && <div>Scheduled: {request.scheduledDate}</div>}
                                {request.completedDate && <div>Completed: {request.completedDate}</div>}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {request.status === 'pending' ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMaintenanceAction(request.id, 'Start')}
                                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                  Start
                                </Button>
                              ) : request.status === 'in progress' ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMaintenanceAction(request.id, 'Complete')}
                                  className="bg-gray-800 text-white hover:bg-gray-700"
                                >
                                  Compl
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CaretakerDashboard;
