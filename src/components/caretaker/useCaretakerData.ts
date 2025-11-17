import { useState, useEffect } from 'react';
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

  return {
    landlordData,
    tenants,
    tenantsLoading,
    payments,
    paymentsLoading,
    documents,
    documentsLoading,
    isLoading,
    fetchTenants,
    fetchPayments,
    fetchDocuments,
    setPayments
  };
};

