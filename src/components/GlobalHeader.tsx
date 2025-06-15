import React from 'react';
import { useLocation, useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu as MenuIcon, 
  Search as SearchIcon, 
  Coffee, 
  Wine, 
  Home, 
  User, 
  Mail,
  Share2 
} from "lucide-react";

const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // This function will navigate to home and add a search parameter
  const handleSearchClick = () => {
    // We navigate to the home page to open the search modal
    navigate('/?search=true');
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Baliciaga',
          text: 'Check out Baliciaga',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
      alert('Link copied to clipboard!');
    }
  };

  // Define navigation links with their properties
  const navLinks = [
    { 
      to: "/?type=cafe", 
      text: "Cafe", 
      icon: Coffee,
      // Custom match function for cafe link
      isActiveMatch: () => {
        const isHomePage = location.pathname === '/';
        const selectedCategory = searchParams.get('type') || 'cafe';
        return isHomePage && selectedCategory === 'cafe';
      }
    },
    { 
      to: "/?type=bar", 
      text: "Bar", 
      icon: Wine,
      // Custom match function for bar link  
      isActiveMatch: () => {
  const isHomePage = location.pathname === '/';
        const selectedCategory = searchParams.get('type') || 'cafe';
        return isHomePage && selectedCategory === 'bar';
      }
    },
    { 
      to: "/listings", 
      text: "Rental", 
      icon: Home,
      // Custom match function for rental link
      isActiveMatch: () => {
        return location.pathname.startsWith('/listings');
      }
    }
  ];

  return (
    <div className="sticky top-0 z-50 bg-gray-50 py-3 px-4 border-b">
      <div className="pt-0 pb-0">
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-black hover:bg-gray-200"
            onClick={handleSearchClick}
          >
            <SearchIcon className="h-6 w-6" />
          </Button>

          <h1 
            className="text-3xl font-bold text-black cursor-pointer"
            onClick={() => navigate('/')}
          >
            Baliciaga
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-200">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="flex items-center gap-2" 
                onSelect={() => navigate('/profile')}
              >
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2" 
                onSelect={() => { window.location.href = 'mailto:yo@baliciaga.com'; }}
              >
                <Mail className="w-4 h-4" />
                Contact
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2" 
                onSelect={handleShareClick}
              >
                <Share2 className="w-4 h-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* 统一的导航按钮 - 使用NavLink和品牌色高亮 */}
        <div className="mt-2">
          <div className="flex gap-3">
            {navLinks.map(link => {
              const isActive = link.isActiveMatch();
              return (
                <NavLink
                  key={link.text}
                  to={link.to}
                  data-testid={`${link.text.toLowerCase()}-category-button`}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm transition-colors duration-200 ease-in-out ${
                    isActive
                      ? 'bg-brand text-white shadow-lg border border-brand' // 激活状态: 使用品牌色
                      : 'bg-white text-gray-500 border border-gray-400 hover:bg-gray-100' // 非激活状态
              }`}
              style={{ height: '32px' }}
            >
                  <link.icon className="w-4 h-4" />
                  <span>{link.text}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalHeader; 