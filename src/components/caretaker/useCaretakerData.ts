import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCaretakerData = () => {
  const [landlordData, setLandlordData] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitStats, setUnitStats] = useState({
    total: 0,
    occupied: 0,
    vacant: 0
  });
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [maintenanceRequestsLoading, setMaintenanceRequestsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch landlord data from Supabase
  const fetchLandlordData = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching landlord data for user:', user.id);
      
      const { data, error } = await supabase
        .from('landlords' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching landlord data:', error);
        setLandlordData(null);
      } else {
        console.log('Fetched landlord data:', data);
        setLandlordData(data);
      }
    } catch (error) {
      console.error('Error fetching landlord data:', error);
      setLandlordData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tenants filtered by branch
  const fetchTenants = async () => {
    if (!landlordData?.branch) {
      console.log('No landlord branch found');
      return;
    }

    try {
      setTenantsLoading(true);
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          contracts (
            *,
            units (
              *
            )
          )
        `)
        .eq('branch', landlordData.branch)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tenants:', error);
        toast({
          title: "Error",
          description: "Failed to load tenants. Please try again.",
          variant: "destructive"
        });
      } else {
        setTenants(data || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: "Error",
        description: "Failed to load tenants. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTenantsLoading(false);
    }
  };

  // Fetch payments for tenants in the same branch
  const fetchPayments = async () => {
    if (!landlordData?.branch) {
      console.log('No landlord branch found for payments');
      return;
    }

    try {
      setPaymentsLoading(true);
      const tenantIds = tenants.length > 0 ? tenants.map(t => t.tenant_id) : [];
      
      let query = supabase
        .from('payments')
        .select(`
          *,
          tenants (
            tenant_id,
            first_name,
            last_name,
            email,
            branch
          ),
          contracts (
            *,
            units (
              unit_number
            )
          )
        `)
        .order('payment_date', { ascending: false });

      if (tenantIds.length > 0) {
        query = query.in('tenant_id', tenantIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: "Error",
          description: `Failed to load payments: ${error.message}`,
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
        description: "Failed to load payments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Fetch documents from database
  const fetchDocuments = async () => {
    if (!landlordData?.branch) {
      console.log('No landlord branch found for documents');
      return;
    }

    try {
      setDocumentsLoading(true);
      const { data, error } = await supabase
        .from('documents' as any)
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
        .order('generated_date', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: `Failed to load documents: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch units and calculate statistics
  const fetchUnits = async () => {
    if (!landlordData?.branch) {
      console.log('No landlord branch found for units');
      return;
    }

    try {
      setUnitsLoading(true);
      
      // Get tenant IDs in the same branch to filter units by contracts
      const tenantIds = tenants.length > 0 ? tenants.map(t => t.tenant_id) : [];
      
      // Fetch all units with their contracts
      let query = supabase
        .from('units')
        .select(`
          *,
          contracts (
            contract_id,
            status,
            tenant_id,
            tenants (
              tenant_id,
              branch
            )
          )
        `);

      // If landlord_id exists, filter by it; otherwise get all units
      if (landlordData.landlord_id) {
        query = query.eq('landlord_id', landlordData.landlord_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching units:', error);
        toast({
          title: "Error",
          description: `Failed to load units: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        // Filter units that are associated with tenants in the same branch
        // A unit is relevant if:
        // 1. It has a contract with a tenant in this branch, OR
        // 2. It has no contracts (available units that could be assigned to this branch)
        const relevantUnits = data.filter(unit => {
          const contracts = unit.contracts;
          
          // If unit has no contracts, include it (available for assignment)
          if (!contracts || (Array.isArray(contracts) && contracts.length === 0)) {
            return true;
          }
          
          // Check if unit has contracts with tenants in this branch
          const contractArray = Array.isArray(contracts) ? contracts : [contracts];
          return contractArray.some((contract: any) => {
            // Check if contract tenant is in this branch
            const tenant = contract?.tenants;
            if (tenant) {
              const tenantBranch = Array.isArray(tenant) ? tenant[0]?.branch : tenant?.branch;
              return tenantBranch === landlordData.branch;
            }
            // Fallback: check if tenant_id is in our tenant list
            return contract?.tenant_id && tenantIds.includes(contract.tenant_id);
          });
        });

        setUnits(relevantUnits);
        
        // Calculate statistics based on units table status field
        const total = relevantUnits.length;
        // Count occupied units: status = 'occupied' OR has active contract with tenant in this branch
        const occupied = relevantUnits.filter(unit => {
          // Check status field first (most reliable)
          if (unit.status?.toLowerCase() === 'occupied') {
            return true;
          }
          
          // Also check for active contracts with tenants in this branch
          const contracts = unit.contracts;
          if (contracts) {
            const contractArray = Array.isArray(contracts) ? contracts : [contracts];
            return contractArray.some((contract: any) => {
              if (contract?.status === 'active') {
                const tenant = contract?.tenants;
                if (tenant) {
                  const tenantBranch = Array.isArray(tenant) ? tenant[0]?.branch : tenant?.branch;
                  return tenantBranch === landlordData.branch;
                }
                return contract?.tenant_id && tenantIds.includes(contract.tenant_id);
              }
              return false;
            });
          }
          
          return false;
        }).length;
        
        const vacant = total - occupied;

        setUnitStats({
          total,
          occupied,
          vacant
        });
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      toast({
        title: "Error",
        description: "Failed to load units. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUnitsLoading(false);
    }
  };

  // Load landlord data when component mounts
  useEffect(() => {
    if (user) {
      fetchLandlordData();
    }
  }, [user]);

  // Load tenants when landlord data is available
  useEffect(() => {
    if (landlordData?.branch) {
      fetchTenants();
    }
  }, [landlordData]);

  // Load payments when tenants are available
  useEffect(() => {
    if (tenants.length > 0) {
      fetchPayments();
    }
  }, [tenants]);

  // Load documents when landlord data is available
  useEffect(() => {
    if (landlordData?.branch) {
      fetchDocuments();
    }
  }, [landlordData]);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  // Fetch maintenance requests filtered by branch
  const fetchMaintenanceRequests = useCallback(async () => {
    const branch = landlordData?.branch;
    if (!branch) {
      return;
    }

    try {
      setMaintenanceRequestsLoading(true);
      
      // Fetch maintenance requests directly filtered by branch
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenants (
            tenant_id,
            first_name,
            last_name,
            email,
            branch
          ),
          units (
            unit_id,
            unit_number,
            branch
          )
        `)
        .eq('branch', branch)
        .order('created_date', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance requests:', error);
        toast({
          title: "Error",
          description: `Failed to load maintenance requests: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setMaintenanceRequests(data);
      } else {
        setMaintenanceRequests([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance requests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMaintenanceRequestsLoading(false);
    }
  }, [landlordData, toast]);

  // Load units when landlord data and tenants are available
  useEffect(() => {
    if (landlordData?.branch && tenants.length >= 0) {
      fetchUnits();
    }
  }, [landlordData, tenants]);

  // Load maintenance requests when landlord data is available
  useEffect(() => {
    if (landlordData?.branch) {
      fetchMaintenanceRequests();
    }
  }, [landlordData, fetchMaintenanceRequests]);

  // Fetch recent activity (payments, maintenance requests, expiring contracts)
  const fetchRecentActivity = async () => {
    if (!landlordData?.branch || tenants.length === 0) {
      return;
    }

    try {
      setRecentActivityLoading(true);
      const tenantIds = tenants.map(t => t.tenant_id);
      const activities: any[] = [];

      // Fetch recent payments (last 5, ordered by date)
      const { data: recentPayments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          tenants (
            tenant_id,
            first_name,
            last_name,
            email
          ),
          contracts (
            *,
            units (
              unit_number
            )
          )
        `)
        .in('tenant_id', tenantIds)
        .order('payment_date', { ascending: false })
        .limit(5);

      if (!paymentsError && recentPayments) {
        recentPayments.forEach((payment: any) => {
          const tenant = payment.tenants;
          const unit = payment.contracts?.units;
          const tenantName = tenant 
            ? `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || tenant.email?.split('@')[0] || 'Unknown'
            : 'Unknown';
          const unitNumber = unit?.unit_number || 'N/A';
          const paymentDate = new Date(payment.payment_date);
          const status = (payment.status?.toLowerCase() === 'confirmed' || 
                         payment.status?.toLowerCase() === 'completed' || 
                         payment.status?.toLowerCase() === 'paid') 
            ? 'completed' 
            : payment.status?.toLowerCase() || 'pending';

          activities.push({
            type: 'payment',
            title: `Payment received from ${tenantName} (${unitNumber})`,
            time: formatTimeAgo(paymentDate),
            timestamp: paymentDate.getTime(),
            amount: `₱${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: status,
            icon: 'payment'
          });
        });
      }

      // Fetch recent maintenance requests (last 5, ordered by date)
      const { data: recentMaintenance, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenants (
            tenant_id,
            first_name,
            last_name,
            email
          ),
          units (
            unit_number
          )
        `)
        .in('tenant_id', tenantIds)
        .order('created_date', { ascending: false })
        .limit(5);

      if (!maintenanceError && recentMaintenance) {
        recentMaintenance.forEach((request: any) => {
          const unit = request.units;
          const unitNumber = unit?.unit_number || 'N/A';
          const createdDate = new Date(request.created_date);
          const status = request.status?.toLowerCase() || 'pending';

          activities.push({
            type: 'maintenance',
            title: `Maintenance request from Unit ${unitNumber}`,
            time: formatTimeAgo(createdDate),
            timestamp: createdDate.getTime(),
            status: status,
            icon: 'maintenance'
          });
        });
      }

      // Fetch contracts expiring soon (within next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const now = new Date();

      const { data: expiringContracts, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          *,
          tenants (
            tenant_id,
            first_name,
            last_name,
            email
          ),
          units (
            unit_number
          )
        `)
        .in('tenant_id', tenantIds)
        .eq('status', 'active')
        .gte('end_date', now.toISOString())
        .lte('end_date', thirtyDaysFromNow.toISOString())
        .order('end_date', { ascending: true })
        .limit(5);

      if (!contractsError && expiringContracts) {
        expiringContracts.forEach((contract: any) => {
          const unit = contract.units;
          const unitNumber = unit?.unit_number || 'N/A';
          const endDate = new Date(contract.end_date);
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          let timeText: string;
          if (daysUntilExpiry === 0) {
            timeText = 'expires today';
          } else if (daysUntilExpiry === 1) {
            timeText = 'expires tomorrow';
          } else {
            timeText = `expires in ${daysUntilExpiry} days`;
          }
          
          activities.push({
            type: 'contract',
            title: `Contract expiring for Unit ${unitNumber}`,
            time: timeText,
            timestamp: endDate.getTime(),
            status: daysUntilExpiry <= 7 ? 'urgent' : 'pending',
            icon: 'contract'
          });
        });
      }

      // Sort all activities by timestamp (most recent first) and take top 10
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setRecentActivityLoading(false);
    }
  };

  // Load recent activity when tenants and payments are available
  useEffect(() => {
    if (tenants.length > 0 && landlordData?.branch) {
      fetchRecentActivity();
    }
  }, [tenants, payments, landlordData]);

  return {
    landlordData,
    tenants,
    tenantsLoading,
    payments,
    paymentsLoading,
    documents,
    documentsLoading,
    recentActivity,
    recentActivityLoading,
    units,
    unitsLoading,
    unitStats,
    maintenanceRequests,
    maintenanceRequestsLoading,
    isLoading,
    fetchTenants,
    fetchPayments,
    fetchDocuments,
    fetchRecentActivity,
    fetchUnits,
    fetchMaintenanceRequests,
    setPayments
  };
};

