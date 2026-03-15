import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import AuthModal from './components/AuthModal';

interface AuthModalContextType {
  openLogin: () => void;
  openSignup: () => void;
  openAdmin: () => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>('login');

  const openLogin = () => {
    setMode('login');
    setIsOpen(true);
  };

  const openSignup = () => {
    setMode('signup');
    setIsOpen(true);
  };

  const openAdmin = () => {
    setMode('admin');
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup, openAdmin, closeModal }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <AuthModal 
            isOpen={isOpen} 
            onClose={closeModal} 
            initialMode={mode} 
          />
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error('useAuthModal must be used within AuthModalProvider');
  return context;
};
