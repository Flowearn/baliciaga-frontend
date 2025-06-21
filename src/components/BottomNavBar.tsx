import { NavLink, useLocation } from 'react-router-dom';
import { User, FileText, PlusSquare } from 'lucide-react';

const navItems = [
  { to: "/my-listings", icon: PlusSquare, label: "My Listing" },
  { to: "/my-applications", icon: FileText, label: "My Application" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNavBar() {
  const location = useLocation();

  const handleNavClick = (to: string, event: React.MouseEvent) => {
    // 如果已经在目标路径，阻止导航
    if (location.pathname === to) {
      event.preventDefault();
      console.log(`Already on ${to}, preventing navigation`);
      return;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center z-40">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={(e) => handleNavClick(item.to, e)}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-brand' : 'text-gray-500'
            }`
          }
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-sm font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
} 