import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import InfinigamSidebar from './InfinigamSidebar';

const InfinigamLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full">
      {/* Desktop Sidebar - visible only on md+ screens */}
      <div className="hidden md:flex md:w-72 flex-shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col">
        <InfinigamSidebar 
          isOpen={true}
          onClose={() => {}}
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Mobile Menu Header */}
        <div className="md:hidden h-16 flex items-center px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-semibold">Infinigram</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <Outlet />
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-950 z-40 md:hidden flex flex-col shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Infinigram</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InfinigamSidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InfinigamLayout;