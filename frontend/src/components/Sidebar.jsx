import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, QrCode, PlusCircle, BarChart3, Settings, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PlusCircle, label: 'Create QR', path: '/create' },
  { icon: QrCode, label: 'QR Codes', path: '/qrcodes' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <QrCode className="h-6 w-6" />
          <span>QR Generator</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 hover:bg-accent"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "border-r bg-background pt-16 lg:pt-0"
      )}>
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <QrCode className="h-6 w-6" />
          <span>QR Generator</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      </div>
    </>
  );
}
