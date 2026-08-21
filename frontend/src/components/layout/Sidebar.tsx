import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Users, Shield, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Documents', href: '/documents' },
  { icon: MessageSquare, label: 'AI Chat', href: '/chat' },
  { icon: Users, label: 'Teams', href: '/teams' },
  { icon: Shield, label: 'Audit Logs', href: '/audit' },
];

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (o: boolean) => void }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface/80 backdrop-blur-xl border-r border-border/50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Sentinel AI
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium border-l-2",
                isActive 
                  ? "bg-primary/10 text-primary border-primary shadow-[inset_2px_0_10px_rgba(0,210,255,0.1)]" 
                  : "text-text-muted hover:bg-surfaceHover hover:text-white border-transparent"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-3 text-xs text-text-muted truncate">
            {user?.email}
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium text-text-muted hover:bg-surfaceHover hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
