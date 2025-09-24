import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle
} from 'lucide-react';

const CaretakerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return null;
    }
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
            <span className="text-gray-700 font-medium">John Dela Cruz</span>
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

          {/* Other tabs content - placeholder for now */}
          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Tenants Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tenants management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Payment tracking functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Document management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Notification management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Maintenance management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CaretakerDashboard;
