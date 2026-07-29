import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/insights', icon: BarChart3, label: 'Insights' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configurações' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <FileText className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold">NexaForm</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 truncate text-sm text-sidebar-foreground/70">
            {user?.email}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold">NexaForm</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 border-b bg-card p-4 shadow-lg lg:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
