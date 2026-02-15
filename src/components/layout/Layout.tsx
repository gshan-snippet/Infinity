import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, Route } from 'react-router-dom';
import { Navbar } from './Navbar';
import { SideMenu } from './SideMenu';
import { SearchModal } from './SearchModal';

export const Layout = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onMenuClick={() => setIsSideMenuOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
      />
      
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};
