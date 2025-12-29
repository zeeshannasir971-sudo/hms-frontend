'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
  Building,
  UserPlus
} from 'lucide-react';
import { NotificationBell } from './ui/NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'patient' | 'doctor' | 'staff' | 'admin';
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      }
    };

    // Load user data on mount
    loadUserData();

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/${userRole}/dashboard`, icon: Home }
    ];

    switch (userRole) {
      case 'patient':
        return [
          ...baseItems,
          { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
          { name: 'Book Appointment', href: '/patient/appointments/book', icon: UserPlus },
          { name: 'Medical Records', href: '/patient/medical-records', icon: FileText },
          { name: 'Notifications', href: '/patient/notifications', icon: Bell },
          { name: 'Profile', href: '/patient/profile', icon: User }
        ];
      
      case 'doctor':
        return [
          ...baseItems,
          { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
          { name: 'Patients', href: '/doctor/patients', icon: Users },
          { name: 'Schedule', href: '/doctor/schedule', icon: Clock },
          { name: 'Medical Records', href: '/doctor/medical-records', icon: FileText },
          { name: 'Profile', href: '/doctor/profile', icon: User }
        ];
      
      case 'staff':
        return [
          ...baseItems,
          { name: 'Appointments', href: '/staff/appointments', icon: Calendar },
          { name: 'Queue Management', href: '/staff/queue', icon: Clock },
          { name: 'Patients', href: '/staff/patients', icon: Users },
          { name: 'Reports', href: '/staff/reports', icon: BarChart3 }
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Departments', href: '/admin/departments', icon: Building },
          { name: 'Staff', href: '/admin/staff', icon: Users },
          { name: 'Reports', href: '/admin/reports', icon: BarChart3 }
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">HMS</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-1">
                <p className="text-base font-medium text-gray-700">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'
                  }
                </p>
                <p className="text-sm font-medium text-gray-500 capitalize">
                  {user?.role || userRole}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Hospital Management System</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'
                  }
                </p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {user?.role || userRole}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {userRole} Dashboard
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || 'User'
                  }
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || userRole}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;