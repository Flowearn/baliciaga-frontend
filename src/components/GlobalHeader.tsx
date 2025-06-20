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
  Share2,
  Building2
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
      to: "/?type=cowork", 
      text: "Cowork", 
      icon: Building2,
      // Custom match function for cowork link  
      isActiveMatch: () => {
        const isHomePage = location.pathname === '/';
        const selectedCategory = searchParams.get('type') || 'cafe';
        return isHomePage && selectedCategory === 'cowork';
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
    <div className="sticky top-0 z-50 bg-background-creamy/70 backdrop-blur-sm py-3 px-4">
      <div className="pt-0 pb-0">
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-black hover:bg-gray-200/50"
            onClick={handleSearchClick}
          >
            <SearchIcon className="h-6 w-6" />
          </Button>

          <h1 
            className="text-4xl font-bold text-black cursor-pointer"
            onClick={() => navigate('/')}
          >
            Baliciaga
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-200/50">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl">
              <DropdownMenuItem 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer mb-1" 
                onSelect={() => navigate('/profile')}
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-base font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer mb-1" 
                onSelect={() => { window.location.href = 'mailto:yo@baliciaga.com'; }}
              >
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-base font-medium">Contact</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer" 
                onSelect={handleShareClick}
              >
                <Share2 className="w-4 h-4 text-gray-500" />
                <span className="text-base font-medium">Share</span>
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
                <div key={link.text} className="flex-1 flex flex-col items-center gap-1">
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-gray-500'}`} />
                  <NavLink
                    to={link.to}
                    data-testid={`${link.text.toLowerCase()}-category-button`}
                    className={`w-full flex items-center justify-center py-1.5 px-2 rounded-full text-base transition-colors duration-200 ease-in-out ${
                      isActive
                        ? 'bg-brand/80 text-white shadow-lg border border-brand/80' // 激活状态: 使用品牌色
                        : 'bg-white/80 text-gray-500 border border-gray-400/50 hover:bg-white/90' // 非激活状态
                  }`}
                  style={{ height: '32px' }}
                  >
                    <span>{link.text}</span>
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalHeader; 