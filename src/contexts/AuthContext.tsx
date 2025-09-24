import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('primeliving_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - in real app, validate with backend
      if (email && password.length >= 6) {
        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          phone: '+63 917 123 4567'
        };
        
        setUser(mockUser);
        localStorage.setItem('primeliving_user', JSON.stringify(mockUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration - in real app, create user in backend
      if (name && email && password.length >= 6) {
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          phone: phone || '+63 917 123 4567'
        };
        
        setUser(newUser);
        localStorage.setItem('primeliving_user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('primeliving_user');
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
