import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone?: string, role?: string, branch?: string, validIdUrl?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Store UI role in localStorage for redirection
      if (role) {
        localStorage.setItem('user_role', role);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string, role?: string, branch?: string, validIdUrl?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Map apartment_manager role to landlord for database storage
      const dbRole = role === 'apartment_manager' ? 'landlord' : role;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            phone,
            role: dbRole, // Store as 'landlord' in database
            uiRole: role, // Keep original UI role for reference
            branch,
            validIdUrl, // Store valid ID URL in user metadata temporarily
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If tenant and valid ID URL provided, update tenant record
      if (role === 'tenant' && validIdUrl && data.user) {
        // Wait a bit for the trigger to create the tenant record
        let retries = 0;
        let tenantRecord = null;
        
        // Retry up to 5 times to find the tenant record
        while (retries < 5 && !tenantRecord) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: tenantData, error: fetchError } = await supabase
            .from('tenants')
            .select('tenant_id')
            .eq('user_id', data.user.id)
            .single();
          
          if (tenantData) {
            tenantRecord = tenantData;
            break;
          }
          
          retries++;
        }
        
        if (tenantRecord) {
          // Update tenant record with valid ID URL
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              valid_id_url: validIdUrl,
              valid_id_uploaded_at: new Date().toISOString()
            })
            .eq('user_id', data.user.id);

          if (updateError) {
            console.error('Error updating tenant with valid ID:', updateError);
            // Don't fail signup if update fails, but log it
          }
        } else {
          console.error('Tenant record not found after signup, valid ID URL may not be saved');
        }
      } else if (role === 'tenant' && !validIdUrl) {
        // If tenant signs up without valid ID, ensure valid_id_url is explicitly null
        // Wait for tenant record to be created
        let retries = 0;
        while (retries < 5) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('tenant_id')
            .eq('user_id', data.user.id)
            .single();
          
          if (tenantData) {
            // Ensure valid_id_url is explicitly null (not empty string)
            await supabase
              .from('tenants')
              .update({
                valid_id_url: null,
                valid_id_uploaded_at: null
              })
              .eq('user_id', data.user.id);
            break;
          }
          retries++;
        }
      }

      // Store UI role in localStorage for redirection
      if (role) {
        localStorage.setItem('user_role', role);
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  };

  const resendConfirmation = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to resend confirmation email' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    signup,
    logout,
    resendConfirmation,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
