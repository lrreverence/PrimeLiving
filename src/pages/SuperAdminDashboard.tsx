import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  LogOut,
  Users,
  Building2,
  CreditCard,
  FileText,
  Wrench,
  Settings,
  BarChart3,
  Search,
  Edit,
  Trash2,
  Plus,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  Calendar,
  PhilippinePeso,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BRANCH_LABELS: Record<string, string> = {
  cainta: 'Cainta Rizal',
  sampaloc: 'Sampaloc Manila',
  cubao: 'Cubao QC',
};

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [allApartmentManagers, setAllApartmentManagers] = useState<any[]>([]);
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [allMaintenance, setAllMaintenance] = useState<any[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalApartmentManagers: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalMaintenance: 0,
    activeContracts: 0
  });

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editType, setEditType] = useState<'user' | 'apartment_manager' | 'unit' | null>(null);

  // Tenant status update (for Tenants tab)
  const [updatingStatusTenantId, setUpdatingStatusTenantId] = useState<number | null>(null);

  // Add apartment manager dialog states
  const [addApartmentManagerDialogOpen, setAddApartmentManagerDialogOpen] = useState(false);
  const [newApartmentManager, setNewApartmentManager] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    branch: ''
  });

  const { logout, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Note: We can't use admin API from client side
      // Users will be inferred from tenant/apartment_manager records
      
      // Fetch all tenants
      const { data: tenants } = await supabase
        .from('tenants')
        .select(`
          *,
          contracts (
            *,
            units (*)
          )
        `);
      
      // Fetch all apartment_managers
      const { data: apartment_managers } = await supabase
        .from('apartment_managers')
        .select('*');
      
      // Fetch all units
      const { data: units } = await supabase
        .from('units')
        .select(`
          *,
          contracts (
            *,
            tenants (*)
          )
        `);
      
      // Fetch all payments
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          tenants (*),
          contracts (
            *,
            units (*)
          )
        `)
        .order('payment_date', { ascending: false });
      
      // Fetch all contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select(`
          *,
          tenants (*),
          units (*)
        `)
        .order('start_date', { ascending: false });
      
      // Fetch all maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenants (*),
          units (*)
        `)
        .order('created_date', { ascending: false });

      // Combine tenant and apartment_manager data to create user list
      // We'll use tenant/apartment_manager records to infer users
      const usersMap = new Map();
      
      // Add tenants as users
      tenants?.forEach(tenant => {
        if (tenant.user_id) {
          usersMap.set(tenant.user_id, {
            id: tenant.user_id,
            email: tenant.email,
            name: `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim(),
            role: 'tenant',
            tenantData: tenant,
            created_at: tenant.created_at
          });
        }
      });
      
      // Add apartment_managers as users
      apartment_managers?.forEach(apartment_manager => {
        if (apartment_manager.user_id) {
          const existing = usersMap.get(apartment_manager.user_id);
          if (existing) {
            existing.apartment_managerData = apartment_manager;
            existing.role = 'apartment_manager'; // If they have both, prioritize apartment_manager
          } else {
            usersMap.set(apartment_manager.user_id, {
              id: apartment_manager.user_id,
              email: apartment_manager.email,
              name: `${apartment_manager.first_name || ''} ${apartment_manager.last_name || ''}`.trim(),
              role: 'apartment_manager',
              apartment_managerData: apartment_manager,
              created_at: apartment_manager.created_at
            });
          }
        }
      });

      const usersWithRoles = Array.from(usersMap.values());
      setAllUsers(usersWithRoles);
      setAllTenants(tenants || []);
      setAllApartmentManagers(apartment_managers || []);
      setAllUnits(units || []);
      setAllPayments(payments || []);
      setAllContracts(contracts || []);
      setAllMaintenance(maintenance || []);

      // Calculate stats
      const occupiedUnits = units?.filter(u => {
        const contract = Array.isArray(u.contracts) ? u.contracts[0] : u.contracts;
        return contract && contract.status === 'active';
      }).length || 0;

      // Total revenue = sum of (units × monthly rent) across all units (same formula as per-branch)
      const totalRevenue = units?.reduce((sum, u) => sum + (parseFloat(u.monthly_rent) || 0), 0) || 0;

      const pendingPayments = payments?.filter(p => 
        p.status === 'pending'
      ).length || 0;

      const activeContracts = contracts?.filter(c => 
        c.status === 'active'
      ).length || 0;

      setStats({
        totalUsers: usersWithRoles.length,
        totalTenants: tenants?.length || 0,
        totalApartmentManagers: apartment_managers?.length || 0,
        totalUnits: units?.length || 0,
        occupiedUnits,
        vacantUnits: (units?.length || 0) - occupiedUnits,
        totalPayments: payments?.length || 0,
        totalRevenue,
        pendingPayments,
        totalMaintenance: maintenance?.length || 0,
        activeContracts
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleEdit = (item: any, type: 'user' | 'apartment_manager' | 'unit') => {
    setEditingItem(item);
    setEditType(type);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editType) return;

    try {
      let error;
      
      if (editType === 'apartment_manager') {
        const { error: updateError } = await supabase
          .from('apartment_managers')
          .update({
            first_name: editingItem.first_name,
            last_name: editingItem.last_name,
            email: editingItem.email,
            contact_number: editingItem.contact_number,
            branch: editingItem.branch,
            company_name: editingItem.company_name,
            updated_at: new Date().toISOString()
          })
          .eq('apartment_manager_id', editingItem.apartment_manager_id);
        error = updateError;
      } else if (editType === 'unit') {
        const { error: updateError } = await supabase
          .from('units')
          .update({
            unit_number: editingItem.unit_number,
            unit_type: editingItem.unit_type,
            monthly_rent: editingItem.monthly_rent,
            status: editingItem.status,
            branch: editingItem.branch,
            updated_at: new Date().toISOString()
          })
          .eq('unit_id', editingItem.unit_id);
        error = updateError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Item updated successfully.",
      });
      
      setEditDialogOpen(false);
      setEditingItem(null);
      setEditType(null);
      await fetchAllData();
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: `Failed to update item: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleTenantStatusChange = async (tenant: any, newStatus: string) => {
    const contract = Array.isArray(tenant.contracts) ? tenant.contracts[0] : tenant.contracts;
    if (!contract?.contract_id) {
      toast({
        title: "No contract",
        description: "This tenant has no contract to update.",
        variant: "destructive"
      });
      return;
    }
    try {
      setUpdatingStatusTenantId(tenant.tenant_id);
      const { error } = await supabase
        .from('contracts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('contract_id', contract.contract_id);
      if (error) throw error;
      const unitId = contract.unit_id;
      if (unitId) {
        const unitStatus = newStatus === 'active' ? 'occupied' : 'available';
        await supabase
          .from('units')
          .update({ status: unitStatus, updated_at: new Date().toISOString() })
          .eq('unit_id', unitId);
      }
      toast({ title: "Status Updated", description: "Tenant status has been updated." });
      await fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update status.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatusTenantId(null);
    }
  };

  const handleDelete = async (item: any, type: 'apartment_manager' | 'unit') => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    try {
      let error;
      
      if (type === 'apartment_manager') {
        const { error: deleteError } = await supabase
          .from('apartment_managers')
          .delete()
          .eq('apartment_manager_id', item.apartment_manager_id);
        error = deleteError;
      } else if (type === 'unit') {
        const { error: deleteError } = await supabase
          .from('units')
          .delete()
          .eq('unit_id', item.unit_id);
        error = deleteError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `${type} deleted successfully.`,
      });
      
      await fetchAllData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: `Failed to delete ${type}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleAddApartmentManager = async () => {
    // Validate required fields
    if (!newApartmentManager.first_name || !newApartmentManager.last_name || 
        !newApartmentManager.email || !newApartmentManager.branch) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (First Name, Last Name, Email, Branch).",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call API route to create user and send invitation
      const response = await fetch('/api/invite-apartment-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: newApartmentManager.first_name,
          last_name: newApartmentManager.last_name,
          email: newApartmentManager.email,
          contact_number: newApartmentManager.contact_number || null,
          branch: newApartmentManager.branch
        })
      });

      const data = await response.json();

      console.log('API response:', data);

      // Check for errors in the response
      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error from API';
        const errorDetails = data.details ? ` Details: ${data.details}` : '';
        const errorHint = data.hint ? ` Hint: ${data.hint}` : '';
        throw new Error(`${errorMsg}${errorDetails}${errorHint}`);
      }

      // Check if response is successful
      if (!data || !data.success) {
        throw new Error('API did not return success. Please check the server logs.');
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully. The apartment manager will receive an email with a link to set up their password.",
      });

      // Reset form and close dialog
      setNewApartmentManager({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        branch: ''
      });
      setAddApartmentManagerDialogOpen(false);
      
      // Refresh data
      await fetchAllData();
    } catch (error: any) {
      console.error('Error creating apartment manager:', error);
      toast({
        title: "Error",
        description: `Failed to create apartment manager: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const generateReport = () => {
    try {
      const csvRows: string[] = [];
      
      csvRows.push('PRIME LIVING - SUPER ADMIN REPORT');
      csvRows.push(`Generated: ${new Date().toLocaleString()}`);
      csvRows.push('');
      
      // Users section
      csvRows.push('USERS');
      csvRows.push('Email,Role,Name,Status,Created At');
      allUsers.forEach(user => {
        csvRows.push([
          user.email || '',
          user.role || 'unknown',
          `${user.user_metadata?.name || ''}`,
          user.email_confirmed_at ? 'Confirmed' : 'Pending',
          user.created_at || ''
        ].join(','));
      });
      csvRows.push('');
      
      // Tenants section
      csvRows.push('TENANTS');
      csvRows.push('Name,Email,Contact,Branch,Unit');
      allTenants.forEach(tenant => {
        const contract = Array.isArray(tenant.contracts) ? tenant.contracts[0] : tenant.contracts;
        const unit = contract?.units ? (Array.isArray(contract.units) ? contract.units[0] : contract.units) : null;
        csvRows.push([
          `"${tenant.first_name || ''} ${tenant.last_name || ''}"`.trim(),
          tenant.email || '',
          tenant.contact_number || '',
          tenant.branch || '',
          unit?.unit_number || 'N/A'
        ].join(','));
      });
      csvRows.push('');
      
      // Payments section
      csvRows.push('PAYMENTS');
      csvRows.push('Date,Tenant,Amount,Status,Method');
      allPayments.forEach(payment => {
        const tenant = Array.isArray(payment.tenants) ? payment.tenants[0] : payment.tenants;
        const tenantName = tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() : 'Unknown';
        csvRows.push([
          payment.payment_date || '',
          `"${tenantName}"`,
          payment.amount || '0',
          payment.status || 'pending',
          payment.payment_mode || 'N/A'
        ].join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `super-admin-report-${new Date().toISOString().split('T')[0]}.csv`);
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

  // Filter functions
  const filteredTenants = allTenants.filter(tenant => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tenant.first_name?.toLowerCase().includes(search) ||
      tenant.last_name?.toLowerCase().includes(search) ||
      tenant.email?.toLowerCase().includes(search) ||
      tenant.branch?.toLowerCase().includes(search)
    );
  });

  // Demographics for system monitoring (by branch + overall distribution)
  const demographics = useMemo(() => {
    const branches = Array.from(new Set([
      ...allTenants.map(t => t.branch).filter(Boolean),
      ...allUnits.map(u => u.branch).filter(Boolean),
      ...allApartmentManagers.map(m => m.branch).filter(Boolean),
    ])) as string[];
    const uniqueBranches = [...new Set(branches)].sort();

    const byBranch = uniqueBranches.map(branch => {
      const tenants = allTenants.filter(t => t.branch === branch).length;
      const units = allUnits.filter(u => u.branch === branch);
      const occupied = units.filter(u => {
        const contract = Array.isArray(u.contracts) ? u.contracts[0] : u.contracts;
        return contract && contract.status === 'active';
      }).length;
      const revenue = units.reduce((sum, u) => sum + (parseFloat(u.monthly_rent) || 0), 0);
      const managers = allApartmentManagers.filter(m => m.branch === branch).length;
      return {
        branch,
        label: BRANCH_LABELS[branch] || branch,
        tenants,
        units: units.length,
        occupied,
        vacant: units.length - occupied,
        revenue,
        managers,
      };
    });

    const contractActive = allContracts.filter(c => c.status === 'active').length;
    const contractInactive = allContracts.length - contractActive;
    const paymentPending = allPayments.filter(p => p.status === 'pending').length;
    const paymentConfirmed = allPayments.filter(p => p.status === 'confirmed').length;
    const maintenancePending = allMaintenance.filter(m => m.status === 'pending').length;
    const maintenanceInProgress = allMaintenance.filter(m => m.status === 'in_progress').length;
    const maintenanceCompleted = allMaintenance.filter(m => m.status === 'completed').length;

    return {
      byBranch,
      contracts: { active: contractActive, inactive: contractInactive, total: allContracts.length },
      payments: { pending: paymentPending, confirmed: paymentConfirmed, total: allPayments.length },
      maintenance: { pending: maintenancePending, inProgress: maintenanceInProgress, completed: maintenanceCompleted, total: allMaintenance.length },
    };
  }, [allTenants, allUnits, allApartmentManagers, allContracts, allPayments, allMaintenance]);

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
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Prime Living System Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Super Admin'}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="apartment_managers">Apartment Managers</TabsTrigger>
          </TabsList>
        </Tabs>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Overview</h2>
              <Button onClick={generateReport} className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Generate Report</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalTenants} tenants, {stats.totalApartmentManagers} apartment managers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUnits}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.occupiedUnits} occupied, {stats.vacantUnits} vacant
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    monthly rent (all units × rent)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeContracts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalMaintenance} maintenance requests
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Demographics - overall monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Demographics
                </CardTitle>
                <CardDescription>
                  Branch-level and system-wide distribution for monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {demographics.byBranch.length > 0 ? (
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Branch</TableHead>
                          <TableHead className="text-right">Tenants</TableHead>
                          <TableHead className="text-right">Units</TableHead>
                          <TableHead className="text-right">Occupied</TableHead>
                          <TableHead className="text-right">Vacant</TableHead>
                          <TableHead className="text-right">Revenue (₱/mo)</TableHead>
                          <TableHead className="text-right">Managers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {demographics.byBranch.map((row) => (
                          <TableRow key={row.branch}>
                            <TableCell className="font-medium">{row.label}</TableCell>
                            <TableCell className="text-right">{row.tenants}</TableCell>
                            <TableCell className="text-right">{row.units}</TableCell>
                            <TableCell className="text-right">{row.occupied}</TableCell>
                            <TableCell className="text-right">{row.vacant}</TableCell>
                            <TableCell className="text-right">₱{row.revenue.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{row.managers}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No branch data yet.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Contracts</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Active: {demographics.contracts.active}</Badge>
                      <Badge variant="secondary">Inactive: {demographics.contracts.inactive}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total: {demographics.contracts.total}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Payments</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Confirmed: {demographics.payments.confirmed}</Badge>
                      <Badge variant="secondary">Pending: {demographics.payments.pending}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total: {demographics.payments.total}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Maintenance</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Completed: {demographics.maintenance.completed}</Badge>
                      <Badge variant="secondary">Pending: {demographics.maintenance.pending}</Badge>
                      {demographics.maintenance.inProgress > 0 && (
                        <Badge variant="outline">In progress: {demographics.maintenance.inProgress}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total: {demographics.maintenance.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allPayments.slice(0, 5).map((payment) => {
                      const tenant = Array.isArray(payment.tenants) ? payment.tenants[0] : payment.tenants;
                      const tenantName = tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() : 'Unknown';
                      return (
                        <div key={payment.payment_id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{tenantName}</p>
                            <p className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₱{parseFloat(payment.amount || '0').toLocaleString()}</p>
                            <Badge variant={payment.status === 'confirmed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Maintenance Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allMaintenance.slice(0, 5).map((request) => {
                      const tenant = Array.isArray(request.tenants) ? request.tenants[0] : request.tenants;
                      const unit = Array.isArray(request.units) ? request.units[0] : request.units;
                      const tenantName = tenant ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() : 'Unknown';
                      return (
                        <div key={request.request_id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{request.description}</p>
                            <p className="text-sm text-gray-500">{tenantName} - {unit?.unit_number || 'N/A'}</p>
                          </div>
                          <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Tenants</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map((tenant) => {
                      const contract = Array.isArray(tenant.contracts) ? tenant.contracts[0] : tenant.contracts;
                      const unit = contract?.units ? (Array.isArray(contract.units) ? contract.units[0] : contract.units) : null;
                      const contractStatus = contract?.status || 'inactive';
                      return (
                        <TableRow key={tenant.tenant_id}>
                          <TableCell>{`${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'N/A'}</TableCell>
                          <TableCell>{tenant.email || 'N/A'}</TableCell>
                          <TableCell>{tenant.contact_number || 'N/A'}</TableCell>
                          <TableCell>{tenant.branch || 'N/A'}</TableCell>
                          <TableCell>{unit?.unit_number || 'N/A'}</TableCell>
                          <TableCell>
                            {contract ? (
                              updatingStatusTenantId === tenant.tenant_id ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                                  <span className="text-sm text-gray-500">Updating...</span>
                                </div>
                              ) : (
                                <Select
                                  value={contractStatus}
                                  onValueChange={(value) => handleTenantStatusChange(tenant, value)}
                                >
                                  <SelectTrigger className="w-[120px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              )
                            ) : (
                              <Badge variant="secondary">No contract</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apartment Managers Tab */}
          <TabsContent value="apartment_managers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Apartment Managers</h2>
              <Button onClick={() => setAddApartmentManagerDialogOpen(true)} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add New Apartment Manager</span>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allApartmentManagers.map((apartment_manager) => (
                      <TableRow key={apartment_manager.apartment_manager_id}>
                        <TableCell>{`${apartment_manager.first_name || ''} ${apartment_manager.last_name || ''}`.trim() || 'N/A'}</TableCell>
                        <TableCell>{apartment_manager.email || 'N/A'}</TableCell>
                        <TableCell>{apartment_manager.contact_number || 'N/A'}</TableCell>
                        <TableCell>{apartment_manager.branch || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(apartment_manager, 'apartment_manager')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(apartment_manager, 'apartment_manager')}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Apartment Manager Dialog */}
      <Dialog open={addApartmentManagerDialogOpen} onOpenChange={setAddApartmentManagerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Apartment Manager</DialogTitle>
            <DialogDescription>
              Create a new apartment manager account. They will receive an invitation email with a link to set up their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={newApartmentManager.first_name}
                  onChange={(e) => setNewApartmentManager({ ...newApartmentManager, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={newApartmentManager.last_name}
                  onChange={(e) => setNewApartmentManager({ ...newApartmentManager, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={newApartmentManager.email}
                onChange={(e) => setNewApartmentManager({ ...newApartmentManager, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Number</label>
              <Input
                value={newApartmentManager.contact_number}
                onChange={(e) => setNewApartmentManager({ ...newApartmentManager, contact_number: e.target.value })}
                placeholder="+63XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Branch *</label>
              <Select
                value={newApartmentManager.branch}
                onValueChange={(value) => setNewApartmentManager({ ...newApartmentManager, branch: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cainta">Cainta Rizal Branch</SelectItem>
                  <SelectItem value="sampaloc">Sampaloc Manila Branch</SelectItem>
                  <SelectItem value="cubao">Cubao QC Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddApartmentManagerDialogOpen(false);
              setNewApartmentManager({
                first_name: '',
                last_name: '',
                email: '',
                contact_number: '',
                branch: ''
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddApartmentManager}>Create Apartment Manager</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {editType}</DialogTitle>
            <DialogDescription>
              Make changes to the {editType} information below.
            </DialogDescription>
          </DialogHeader>
          {editingItem && editType && (
            <div className="space-y-4">
              {editType === 'apartment_manager' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={editingItem.first_name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, first_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={editingItem.last_name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={editingItem.email || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Number</label>
                    <Input
                      value={editingItem.contact_number || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, contact_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      value={editingItem.company_name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, company_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Branch</label>
                    <Input
                      value={editingItem.branch || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, branch: e.target.value })}
                    />
                  </div>
                </>
              )}
              {editType === 'unit' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Unit Number</label>
                    <Input
                      value={editingItem.unit_number || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, unit_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unit Type</label>
                    <Input
                      value={editingItem.unit_type || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, unit_type: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Rent</label>
                    <Input
                      type="number"
                      value={editingItem.monthly_rent || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, monthly_rent: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={editingItem.status || 'vacant'}
                      onValueChange={(value) => setEditingItem({ ...editingItem, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Branch</label>
                    <Input
                      value={editingItem.branch || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, branch: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;

