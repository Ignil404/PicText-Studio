import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileImage, Users, BarChart3, Home } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/admin/templates', label: 'Templates', icon: <FileImage size={20} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={20} /> },
  { to: '/admin/stats', label: 'Statistics', icon: <BarChart3 size={20} /> },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-slate-50 border-r border-slate-200 flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Image Text Constructor</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Back to App */}
      <div className="p-4 border-t border-slate-200">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Home size={20} />
          <span className="font-medium">Back to App</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
