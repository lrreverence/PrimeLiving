import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, Edit, Eye, Trash2, IdCard, X, Download, FileText, User, Mail, Phone, MapPin, Calendar, Users, Briefcase, Building, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface Tenant {
  id: number;
  name: string;
  email: string;
  unit: string;
  contact: string;
  monthlyRent: number;
  contractStart: string;
  contractEnd: string;
  status: string;
  balance: number;
  validIdUrl?: string;
  validIdUploadedAt?: string;
  tenantData?: any; // Full tenant data from database
}

interface Unit {
  unit_id: number;
  unit_number: string;
  unit_type?: string;
  monthly_rent?: number;
  status?: string;
}

interface TenantsTabProps {
  tenants: Tenant[];
  tenantsLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  units?: Unit[];
  onTenantUpdate?: () => void;
  apartmentManagerBranch?: string;
}

export const TenantsTab = ({ tenants, tenantsLoading, searchTerm, onSearchChange, units = [], onTenantUpdate, apartmentManagerBranch }: TenantsTabProps) => {
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [viewIdModalOpen, setViewIdModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [inviteTenantDialogOpen, setInviteTenantDialogOpen] = useState(false);
  const [inviteTenantLoading, setInviteTenantLoading] = useState(false);
  const [newTenant, setNewTenant] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    branch: apartmentManagerBranch || ''
  });
  const [updatingUnit, setUpdatingUnit] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [updatingContractPeriod, setUpdatingContractPeriod] = useState<number | null>(null);
  const [updatingMonthlyRent, setUpdatingMonthlyRent] = useState<number | null>(null);
  const [contractPeriodForm, setContractPeriodForm] = useState<{ start_date: string; end_date: string } | null>(null);
  const [contractPeriodPopoverOpen, setContractPeriodPopoverOpen] = useState<number | null>(null);
  const [monthlyRentForm, setMonthlyRentForm] = useState<string>('');
  const [monthlyRentPopoverOpen, setMonthlyRentPopoverOpen] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    occupation: '',
    company: ''
  });

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setProfileModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    if (tenant.tenantData) {
      setEditForm({
        first_name: tenant.tenantData.first_name || '',
        last_name: tenant.tenantData.last_name || '',
        contact_number: tenant.tenantData.contact_number || '',
        emergency_contact_name: tenant.tenantData.emergency_contact_name || '',
        emergency_contact_phone: tenant.tenantData.emergency_contact_phone || '',
        emergency_contact_relationship: tenant.tenantData.emergency_contact_relationship || '',
        occupation: tenant.tenantData.occupation || '',
        company: tenant.tenantData.company || ''
      });
    }
    setEditModalOpen(true);
  };

  const handleUnitChange = async (tenantId: number, newUnitId: string) => {
    if (!newUnitId) return;

    try {
      setUpdatingUnit(tenantId);
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant || !tenant.tenantData) return;

      // Get contract from tenant data
      let contract = null;
      if (Array.isArray(tenant.tenantData.contracts)) {
        contract = tenant.tenantData.contracts.length > 0 ? tenant.tenantData.contracts[0] : null;
      } else if (tenant.tenantData.contracts) {
        contract = tenant.tenantData.contracts;
      }

      const unitId = parseInt(newUnitId);

      if (contract && contract.contract_id) {
        // Get the old unit_id to update its status
        const oldUnitId = contract.unit_id;
        
        // Update existing contract
        const { error: contractError } = await supabase
          .from('contracts')
          .update({
            unit_id: unitId,
            updated_at: new Date().toISOString()
          })
          .eq('contract_id', contract.contract_id);

        if (contractError) {
          throw contractError;
        }

        // Update old unit status to available if it's different
        if (oldUnitId && oldUnitId !== unitId) {
          await supabase
            .from('units')
            .update({
              status: 'available',
              updated_at: new Date().toISOString()
            })
            .eq('unit_id', oldUnitId);
        }

        // Update new unit status to occupied
        const { error: unitError } = await supabase
          .from('units')
          .update({
            status: 'occupied',
            updated_at: new Date().toISOString()
          })
          .eq('unit_id', unitId);

        if (unitError) {
          console.error('Error updating unit status:', unitError);
          // Don't throw, just log - the contract update succeeded
        }

        toast({
          title: "Unit Updated",
          description: "Tenant's unit has been updated successfully.",
        });
      } else {
        // Create new contract if none exists
        const { error: contractError } = await supabase
          .from('contracts')
          .insert({
            tenant_id: tenantId,
            unit_id: unitId,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (contractError) {
          throw contractError;
        }

        // Update unit status to occupied
        const { error: unitError } = await supabase
          .from('units')
          .update({
            status: 'occupied',
            updated_at: new Date().toISOString()
          })
          .eq('unit_id', unitId);

        if (unitError) {
          console.error('Error updating unit status:', unitError);
          // Don't throw, just log - the contract creation succeeded
        }

        toast({
          title: "Contract Created",
          description: "New contract has been created with the selected unit.",
        });
      }

      // Refresh tenant data
      if (onTenantUpdate) {
        onTenantUpdate();
      }
    } catch (error: any) {
      console.error('Error updating unit:', error);
      toast({
        title: "Error",
        description: `Failed to update unit: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingUnit(null);
    }
  };

  const handleStatusChange = async (tenantId: number, newStatus: string) => {
    if (!newStatus) return;

    try {
      setUpdatingStatus(tenantId);
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant || !tenant.tenantData) return;

      // Get contract from tenant data
      let contract = null;
      if (Array.isArray(tenant.tenantData.contracts)) {
        contract = tenant.tenantData.contracts.length > 0 ? tenant.tenantData.contracts[0] : null;
      } else if (tenant.tenantData.contracts) {
        contract = tenant.tenantData.contracts;
      }

      if (contract && contract.contract_id) {
        // Get unit_id from contract
        const unitId = contract.unit_id;
        
        // Update existing contract status
        const { error } = await supabase
          .from('contracts')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('contract_id', contract.contract_id);

        if (error) {
          throw error;
        }

        // Update unit status based on contract status
        if (unitId) {
          const unitStatus = newStatus === 'active' ? 'occupied' : 'available';
          await supabase
            .from('units')
            .update({
              status: unitStatus,
              updated_at: new Date().toISOString()
            })
            .eq('unit_id', unitId);
        }

        toast({
          title: "Status Updated",
          description: `Contract status has been updated to ${newStatus}.`,
        });
      } else {
        // If no contract exists, we can't set status
        toast({
          title: "No Contract",
          description: "Cannot update status: Tenant has no active contract.",
          variant: "destructive"
        });
        setUpdatingStatus(null);
        return;
      }

      // Refresh tenant data
      if (onTenantUpdate) {
        onTenantUpdate();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleContractPeriodChange = async (tenantId: number, startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Dates",
        description: "Please provide both start and end dates.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdatingContractPeriod(tenantId);
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant || !tenant.tenantData) return;

      // Get contract from tenant data
      let contract = null;
      if (Array.isArray(tenant.tenantData.contracts)) {
        contract = tenant.tenantData.contracts.length > 0 ? tenant.tenantData.contracts[0] : null;
      } else if (tenant.tenantData.contracts) {
        contract = tenant.tenantData.contracts;
      }

      if (contract && contract.contract_id) {
        // Update existing contract dates
        const { error } = await supabase
          .from('contracts')
          .update({
            start_date: startDate,
            end_date: endDate,
            updated_at: new Date().toISOString()
          })
          .eq('contract_id', contract.contract_id);

        if (error) {
          throw error;
        }

        toast({
          title: "Contract Period Updated",
          description: "Contract period has been updated successfully.",
        });
      } else {
        // If no contract exists, we need a unit_id to create one
        toast({
          title: "No Contract",
          description: "Cannot update contract period: Tenant has no active contract. Please assign a unit first.",
          variant: "destructive"
        });
        setUpdatingContractPeriod(null);
        setContractPeriodPopoverOpen(null);
        return;
      }

      // Refresh tenant data
      if (onTenantUpdate) {
        onTenantUpdate();
      }
      
      setContractPeriodPopoverOpen(null);
      setContractPeriodForm(null);
    } catch (error: any) {
      console.error('Error updating contract period:', error);
      toast({
        title: "Error",
        description: `Failed to update contract period: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingContractPeriod(null);
    }
  };

  const handleMonthlyRentChange = async (tenantId: number, newMonthlyRent: string) => {
    const rentValue = parseFloat(newMonthlyRent);
    if (isNaN(rentValue) || rentValue < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number for monthly rent.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdatingMonthlyRent(tenantId);
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant || !tenant.tenantData) return;

      // Get contract and unit from tenant data
      let contract = null;
      if (Array.isArray(tenant.tenantData.contracts)) {
        contract = tenant.tenantData.contracts.length > 0 ? tenant.tenantData.contracts[0] : null;
      } else if (tenant.tenantData.contracts) {
        contract = tenant.tenantData.contracts;
      }

      if (!contract) {
        toast({
          title: "No Contract",
          description: "Cannot update monthly rent: Tenant has no active contract. Please assign a unit first.",
          variant: "destructive"
        });
        setUpdatingMonthlyRent(null);
        setMonthlyRentPopoverOpen(null);
        return;
      }

      // Get unit_id from contract
      let unitId = contract.unit_id;
      if (!unitId && contract.units) {
        const unit = Array.isArray(contract.units) ? contract.units[0] : contract.units;
        unitId = unit?.unit_id;
      }

      if (!unitId) {
        toast({
          title: "No Unit",
          description: "Cannot update monthly rent: No unit assigned to this contract.",
          variant: "destructive"
        });
        setUpdatingMonthlyRent(null);
        setMonthlyRentPopoverOpen(null);
        return;
      }

      // Update the unit's monthly_rent
      const { error } = await supabase
        .from('units')
        .update({
          monthly_rent: rentValue,
          updated_at: new Date().toISOString()
        })
        .eq('unit_id', unitId);

      if (error) {
        throw error;
      }

      toast({
        title: "Monthly Rent Updated",
        description: `Monthly rent has been updated to ₱${rentValue.toLocaleString()}.`,
      });

      // Refresh tenant data
      if (onTenantUpdate) {
        onTenantUpdate();
      }
      
      setMonthlyRentPopoverOpen(null);
      setMonthlyRentForm('');
    } catch (error: any) {
      console.error('Error updating monthly rent:', error);
      toast({
        title: "Error",
        description: `Failed to update monthly rent: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingMonthlyRent(null);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTenant || !selectedTenant.tenantData) return;

    try {
      setEditLoading(true);
      const { error } = await supabase
        .from('tenants')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          contact_number: editForm.contact_number,
          emergency_contact_name: editForm.emergency_contact_name,
          emergency_contact_phone: editForm.emergency_contact_phone,
          emergency_contact_relationship: editForm.emergency_contact_relationship,
          occupation: editForm.occupation,
          company: editForm.company,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', selectedTenant.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Tenant Updated",
        description: "Tenant information has been updated successfully.",
      });

      setEditModalOpen(false);
      // Refresh the page or reload tenant data
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update tenant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleInviteTenant = async () => {
    // Validate required fields
    if (!newTenant.first_name || !newTenant.last_name || 
        !newTenant.email || !newTenant.branch) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (First Name, Last Name, Email).",
        variant: "destructive"
      });
      return;
    }

    try {
      setInviteTenantLoading(true);
      // Call API route to create user and send invitation
      const response = await fetch('/api/invite-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: newTenant.first_name,
          last_name: newTenant.last_name,
          email: newTenant.email,
          contact_number: newTenant.contact_number || null,
          branch: newTenant.branch
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
        description: "Invitation sent successfully. The tenant will receive an email with a link to set up their password.",
      });

      // Reset form and close dialog
      setNewTenant({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        branch: apartmentManagerBranch || ''
      });
      setInviteTenantDialogOpen(false);
      
      // Refresh tenant data
      if (onTenantUpdate) {
        onTenantUpdate();
      }
    } catch (error: any) {
      console.error('Error inviting tenant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite tenant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setInviteTenantLoading(false);
    }
  };

  const handleViewId = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setViewIdModalOpen(true);
    setSignedUrl(null);
    setLoadingUrl(true);

    if (tenant.validIdUrl) {
      try {
        // Extract the file path from the URL
        // URL format: https://project.supabase.co/storage/v1/object/public/tenant-documents/valid-ids/filename.ext
        // or: https://project.supabase.co/storage/v1/object/sign/tenant-documents/valid-ids/filename.ext
        const url = new URL(tenant.validIdUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.indexOf('tenant-documents');
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(bucketIndex + 1).join('/');
          
          // Generate signed URL (valid for 1 hour)
          const { data, error } = await supabase.storage
            .from('tenant-documents')
            .createSignedUrl(filePath, 3600);

          if (error) {
            console.error('Error creating signed URL:', error);
            // Fallback to original URL
            setSignedUrl(tenant.validIdUrl);
          } else {
            setSignedUrl(data.signedUrl);
          }
        } else {
          // If we can't parse the path, try to extract it differently
          // Sometimes the URL might be in a different format
          const match = tenant.validIdUrl.match(/tenant-documents\/(.+)$/);
          if (match) {
            const filePath = match[1];
            const { data, error } = await supabase.storage
              .from('tenant-documents')
              .createSignedUrl(filePath, 3600);

            if (error) {
              console.error('Error creating signed URL:', error);
              setSignedUrl(tenant.validIdUrl);
            } else {
              setSignedUrl(data.signedUrl);
            }
          } else {
            // Fallback to original URL
            setSignedUrl(tenant.validIdUrl);
          }
        }
      } catch (error) {
        console.error('Error generating signed URL:', error);
        setSignedUrl(tenant.validIdUrl);
      } finally {
        setLoadingUrl(false);
      }
    } else {
      setLoadingUrl(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tenant Management</h2>
          <p className="text-gray-600 mt-1">Manage tenant profiles, contracts, and unit assignments.</p>
        </div>
        <Button 
          className="bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2"
          onClick={() => {
            setNewTenant({
              first_name: '',
              last_name: '',
              email: '',
              contact_number: '',
              branch: apartmentManagerBranch || ''
            });
            setInviteTenantDialogOpen(true);
          }}
        >
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
          onChange={(e) => onSearchChange(e.target.value)}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valid ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Overdue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenantsLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      Loading tenants...
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      {searchTerm ? 'No tenants found matching your search.' : 'No tenants found in your branch.'}
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {updatingUnit === tenant.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span className="text-sm text-gray-500">Updating...</span>
                          </div>
                        ) : (
                          <Select
                            value={(() => {
                              // Find the current unit_id for this tenant
                              const tenantData = tenant.tenantData;
                              if (!tenantData) return '';
                              
                              let contract = null;
                              if (Array.isArray(tenantData.contracts)) {
                                contract = tenantData.contracts.length > 0 ? tenantData.contracts[0] : null;
                              } else if (tenantData.contracts) {
                                contract = tenantData.contracts;
                              }
                              
                              // Try to get unit_id from contract or from nested units
                              const unitId = contract?.unit_id || 
                                            (contract?.units ? (Array.isArray(contract.units) ? contract.units[0]?.unit_id : contract.units.unit_id) : null);
                              return unitId ? unitId.toString() : '';
                            })()}
                            onValueChange={(value) => handleUnitChange(tenant.id, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue placeholder={tenant.unit !== 'N/A' ? tenant.unit : 'Select Unit'} />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.unit_id} value={unit.unit_id.toString()}>
                                  {unit.unit_number} {unit.status === 'available' ? '(Available)' : unit.status === 'occupied' ? '(Occupied)' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{tenant.contact}</td>
                      <td className="py-4 px-4">
                        {updatingMonthlyRent === tenant.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span className="text-sm text-gray-500">Updating...</span>
                          </div>
                        ) : (
                          <Popover 
                            open={monthlyRentPopoverOpen === tenant.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setMonthlyRentPopoverOpen(tenant.id);
                                setMonthlyRentForm(tenant.monthlyRent.toString());
                              } else {
                                setMonthlyRentPopoverOpen(null);
                                setMonthlyRentForm('');
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 text-sm font-medium hover:text-gray-900 hover:bg-transparent"
                              >
                                ₱{tenant.monthlyRent.toLocaleString()}
                                <Edit className="w-3 h-3 ml-1" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-4" align="start">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-3">Monthly Rent</h4>
                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`rent-${tenant.id}`} className="text-xs">Amount (₱)</Label>
                                      <Input
                                        id={`rent-${tenant.id}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={monthlyRentForm}
                                        onChange={(e) => setMonthlyRentForm(e.target.value)}
                                        className="h-8"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setMonthlyRentPopoverOpen(null);
                                      setMonthlyRentForm('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gray-900 text-white hover:bg-gray-800"
                                    onClick={() => {
                                      if (monthlyRentForm) {
                                        handleMonthlyRentChange(tenant.id, monthlyRentForm);
                                      }
                                    }}
                                    disabled={!monthlyRentForm || parseFloat(monthlyRentForm) < 0}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {updatingContractPeriod === tenant.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span className="text-sm text-gray-500">Updating...</span>
                          </div>
                        ) : (
                          <Popover 
                            open={contractPeriodPopoverOpen === tenant.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setContractPeriodPopoverOpen(tenant.id);
                                // Initialize form with current dates
                                const startDate = tenant.contractStart !== 'N/A' ? tenant.contractStart : '';
                                const endDate = tenant.contractEnd !== 'N/A' ? tenant.contractEnd : '';
                                setContractPeriodForm({ start_date: startDate, end_date: endDate });
                              } else {
                                setContractPeriodPopoverOpen(null);
                                setContractPeriodForm(null);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 text-sm text-gray-600 hover:text-gray-900 hover:bg-transparent"
                              >
                                {tenant.contractStart !== 'N/A' && tenant.contractEnd !== 'N/A' 
                                  ? `${tenant.contractStart} to ${tenant.contractEnd}`
                                  : 'No contract'
                                }
                                <Calendar className="w-3 h-3 ml-1" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="start">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-3">Contract Period</h4>
                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`start-${tenant.id}`} className="text-xs">Start Date</Label>
                                      <Input
                                        id={`start-${tenant.id}`}
                                        type="date"
                                        value={contractPeriodForm?.start_date || ''}
                                        onChange={(e) => setContractPeriodForm({
                                          ...contractPeriodForm!,
                                          start_date: e.target.value
                                        })}
                                        className="h-8"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`end-${tenant.id}`} className="text-xs">End Date</Label>
                                      <Input
                                        id={`end-${tenant.id}`}
                                        type="date"
                                        value={contractPeriodForm?.end_date || ''}
                                        onChange={(e) => setContractPeriodForm({
                                          ...contractPeriodForm!,
                                          end_date: e.target.value
                                        })}
                                        className="h-8"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setContractPeriodPopoverOpen(null);
                                      setContractPeriodForm(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gray-900 text-white hover:bg-gray-800"
                                    onClick={() => {
                                      if (contractPeriodForm) {
                                        handleContractPeriodChange(
                                          tenant.id,
                                          contractPeriodForm.start_date,
                                          contractPeriodForm.end_date
                                        );
                                      }
                                    }}
                                    disabled={!contractPeriodForm?.start_date || !contractPeriodForm?.end_date}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {updatingStatus === tenant.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span className="text-sm text-gray-500">Updating...</span>
                          </div>
                        ) : (
                          <Select
                            value={tenant.status || 'inactive'}
                            onValueChange={(value) => handleStatusChange(tenant.id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {tenant.validIdUrl ? (
                          <Badge className="bg-green-100 text-green-800">
                            <IdCard className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <IdCard className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={tenant.balance === 0 ? 'text-green-600' : 'text-red-600 font-medium'}>
                          ₱{tenant.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(tenant)}
                            title="Edit Tenant"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewProfile(tenant)}
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {tenant.validIdUrl ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                              onClick={() => handleViewId(tenant)}
                              title="View Valid ID"
                            >
                              <IdCard className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-400 cursor-not-allowed"
                              disabled
                              title="No Valid ID uploaded"
                            >
                              <IdCard className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Valid ID Modal */}
      <Dialog open={viewIdModalOpen} onOpenChange={setViewIdModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Valid ID Document</DialogTitle>
            <DialogDescription className="mt-1">
              {selectedTenant?.name} - {selectedTenant?.email}
              {selectedTenant?.validIdUploadedAt && (
                <span className="block text-xs text-gray-500 mt-1">
                  Uploaded: {new Date(selectedTenant.validIdUploadedAt).toLocaleDateString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {selectedTenant?.validIdUrl ? (
              <div className="space-y-4">
                {loadingUrl ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="text-gray-600">Loading document...</p>
                  </div>
                ) : signedUrl ? (
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    {(signedUrl.toLowerCase().includes('.pdf') || selectedTenant.validIdUrl?.toLowerCase().endsWith('.pdf')) ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-semibold text-gray-700">PDF Document</p>
                          <p className="text-sm text-gray-500 mt-1">Click below to view the PDF</p>
                        </div>
                        <Button
                          onClick={() => window.open(signedUrl, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Open PDF in New Tab
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <img
                        src={signedUrl}
                        alt={`Valid ID for ${selectedTenant.name}`}
                        className="max-w-full h-auto rounded-lg shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                  <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <p class="text-lg font-semibold text-gray-700">Failed to load image</p>
                                  <p class="text-sm text-gray-500 mt-1">The image may have been deleted or is no longer accessible</p>
                                </div>
                                <a href="${signedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">
                                  Try opening in new tab
                                </a>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">Failed to load document</p>
                      <p className="text-sm text-gray-500 mt-1">Unable to generate access URL for this document</p>
                    </div>
                  </div>
                )}
                {signedUrl && (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (signedUrl) {
                          window.open(signedUrl, '_blank');
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={() => setViewIdModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <IdCard className="w-16 h-16 text-gray-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">No Valid ID Available</p>
                  <p className="text-sm text-gray-500 mt-1">This tenant has not uploaded a valid ID yet</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tenant Profile Modal */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Tenant Profile</DialogTitle>
            <DialogDescription className="mt-1">
              Complete profile information for {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {selectedTenant && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-gray-900">{selectedTenant.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedTenant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-medium text-gray-900">{selectedTenant.contact || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Unit</p>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {selectedTenant.unit}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contract Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contract Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contract Period</p>
                        <p className="font-medium text-gray-900">
                          {selectedTenant.contractStart !== 'N/A' && selectedTenant.contractEnd !== 'N/A'
                            ? `${selectedTenant.contractStart} to ${selectedTenant.contractEnd}`
                            : 'No contract'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge 
                          className={
                            selectedTenant.status === 'active' 
                              ? 'bg-gray-800 text-white' 
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {selectedTenant.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-600">Monthly Rent</p>
                        <p className="font-medium text-gray-900">₱{selectedTenant.monthlyRent.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-gray-600">Overdue</p>
                        <p className={`font-medium ${selectedTenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₱{selectedTenant.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information from tenantData */}
                {selectedTenant.tenantData && (
                  <>
                    {/* Emergency Contact */}
                    {(selectedTenant.tenantData.emergency_contact_name || selectedTenant.tenantData.emergency_contact_phone) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedTenant.tenantData.emergency_contact_name && (
                            <div className="flex items-center space-x-3">
                              <Users className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Contact Name</p>
                                <p className="font-medium text-gray-900">{selectedTenant.tenantData.emergency_contact_name}</p>
                              </div>
                            </div>
                          )}
                          {selectedTenant.tenantData.emergency_contact_phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Contact Phone</p>
                                <p className="font-medium text-gray-900">{selectedTenant.tenantData.emergency_contact_phone}</p>
                              </div>
                            </div>
                          )}
                          {selectedTenant.tenantData.emergency_contact_relationship && (
                            <div className="flex items-center space-x-3">
                              <Users className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Relationship</p>
                                <p className="font-medium text-gray-900">{selectedTenant.tenantData.emergency_contact_relationship}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Occupation Information */}
                    {(selectedTenant.tenantData.occupation || selectedTenant.tenantData.company) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Occupation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedTenant.tenantData.occupation && (
                            <div className="flex items-center space-x-3">
                              <Briefcase className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Occupation</p>
                                <p className="font-medium text-gray-900">{selectedTenant.tenantData.occupation}</p>
                              </div>
                            </div>
                          )}
                          {selectedTenant.tenantData.company && (
                            <div className="flex items-center space-x-3">
                              <Building className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-600">Company</p>
                                <p className="font-medium text-gray-900">{selectedTenant.tenantData.company}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Move-in Date */}
                    {selectedTenant.tenantData.move_in_date && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Move-in Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Move-in Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(selectedTenant.tenantData.move_in_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Valid ID Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Valid ID Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <IdCard className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">ID Verification</p>
                        {selectedTenant.validIdUrl ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            {selectedTenant.validIdUploadedAt && (
                              <span className="text-xs text-gray-500">
                                Uploaded: {new Date(selectedTenant.validIdUploadedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 mt-1">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Edit Tenant Information</DialogTitle>
            <DialogDescription className="mt-1">
              Update information for {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6">
            {selectedTenant && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_number">Contact Number</Label>
                      <Input
                        id="contact_number"
                        value={editForm.contact_number}
                        onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                        placeholder="Contact number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        value={editForm.emergency_contact_name}
                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        value={editForm.emergency_contact_phone}
                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                      <Input
                        id="emergency_contact_relationship"
                        value={editForm.emergency_contact_relationship}
                        onChange={(e) => setEditForm({ ...editForm, emergency_contact_relationship: e.target.value })}
                        placeholder="Relationship (e.g., Spouse, Parent, Sibling)"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Occupation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Occupation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={editForm.occupation}
                        onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                        placeholder="Occupation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        placeholder="Company name"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
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
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    {editLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Tenant Dialog */}
      <Dialog open={inviteTenantDialogOpen} onOpenChange={setInviteTenantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite New Tenant</DialogTitle>
            <DialogDescription>
              Create a new tenant account. They will receive an invitation email with a link to set up their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">First Name *</Label>
                <Input
                  value={newTenant.first_name}
                  onChange={(e) => setNewTenant({ ...newTenant, first_name: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Last Name *</Label>
                <Input
                  value={newTenant.last_name}
                  onChange={(e) => setNewTenant({ ...newTenant, last_name: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Email *</Label>
              <Input
                type="email"
                value={newTenant.email}
                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Contact Number</Label>
              <Input
                value={newTenant.contact_number}
                onChange={(e) => setNewTenant({ ...newTenant, contact_number: e.target.value })}
                placeholder="+63XXXXXXXXXX"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Branch *</Label>
              <Input
                value={newTenant.branch}
                placeholder="Branch"
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Branch is automatically set to your branch</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setInviteTenantDialogOpen(false);
              setNewTenant({
                first_name: '',
                last_name: '',
                email: '',
                contact_number: '',
                branch: apartmentManagerBranch || ''
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleInviteTenant} disabled={inviteTenantLoading}>
              {inviteTenantLoading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

