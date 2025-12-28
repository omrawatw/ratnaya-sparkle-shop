import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('ratnaya-admin') === 'true';
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simple admin check - in production, use proper authentication
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ratnaya-admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ratnaya-admin');
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
