import React from 'react';
import { useLocation, useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  Building2,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const GlobalHeader = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Subscribe to immersive theme state
  const activeTheme = useThemeStore((state) => state.activeTheme);
  
  // Language options
  const languageOptions: { [key: string]: string } = {
    en: 'English',
    zh: '简体中文',
    ru: 'Русский',
    ko: '한국어',
  };

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
          text: 'Baliciaga',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
      alert(t('toast.link_copied_title'));
    }
  };

  // Define navigation links with their properties
  const navLinks = [
    { 
      to: "/?type=food", 
      text: t('nav.food'), 
      icon: Coffee,
      // Custom match function for food link
      isActiveMatch: () => {
        const isHomePage = location.pathname === '/';
        const selectedCategory = searchParams.get('type');
        // Default to food when no type is specified
        return isHomePage && (!selectedCategory || selectedCategory === 'food' || selectedCategory === 'cafe');
      }
    },
    { 
      to: "/?type=bar", 
      text: t('nav.bar'), 
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
      text: t('nav.cowork'), 
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
      text: t('nav.rental'), 
      icon: Home,
      // Custom match function for rental link - highlight for all rental-related pages (Rule 4)
      isActiveMatch: () => {
        return location.pathname.startsWith('/listings') || 
               location.pathname.startsWith('/my-listings') || 
               location.pathname.startsWith('/my-applications');
      }
    }
  ];

  return (
    <div className="relative w-full">
      {/* Layer 1: Dynamic Background Color */}
      <div 
        className="absolute inset-0 transition-colors duration-300" 
        style={{ backgroundColor: activeTheme?.backgroundColor }}
      />
      
      {/* Layer 2: Black Overlay (20% opacity when theme is active) */}
      <div 
        className="absolute inset-0 bg-black/20 transition-opacity duration-300"
        style={{ opacity: activeTheme ? 1 : 0 }} 
      />
      
      {/* Layer 3: Content */}
      <div className={cn(
        "relative z-10",
        activeTheme ? "text-white" : "text-gray-800"
      )}>
        <div className="pt-2 pb-2 px-4">
          {/* Main header content */}
          <div className="flex items-center justify-between w-full">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "transition-colors duration-300",
                activeTheme 
                  ? "text-white hover:bg-white/20" 
                  : "text-black hover:bg-gray-200/50"
              )}
              onClick={handleSearchClick}
            >
              <SearchIcon className="h-6 w-6" />
            </Button>

            {/* Logo/Title */}
            <h1 
              className={cn(
                "text-[28px] font-bold cursor-pointer transition-colors duration-300",
                activeTheme ? "text-white" : "text-black"
              )}
              onClick={() => navigate('/')}
            >
              Baliciaga
            </h1>

            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "transition-colors duration-300",
                    activeTheme 
                      ? "text-white hover:bg-white/20" 
                      : "text-black hover:bg-gray-200/50"
                  )}
                >
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl">
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer mb-1" 
                  onSelect={() => navigate('/profile', { state: { from: location.pathname + location.search } })}
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-base font-medium">{t('dropdown.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer mb-1" 
                  onSelect={() => { window.location.href = 'mailto:yo@baliciaga.com'; }}
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-base font-medium">{t('dropdown.contact')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer mb-1" 
                  onSelect={handleShareClick}
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span className="text-base font-medium">{t('dropdown.share')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer" 
                  onSelect={(e) => e.preventDefault()}
                >
                  <Globe className="w-4 h-4 text-gray-500" />
                  <select 
                    className="text-base font-medium bg-transparent outline-none cursor-pointer"
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(languageOptions).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Primary Navigation Buttons */}
          <div className="mt-2">
            <div className="flex gap-2">
              {navLinks.map(link => {
                const isActive = link.isActiveMatch();
                return (
                  <div key={link.text} className="flex-1">
                    <NavLink
                      to={link.to}
                      data-testid={`${link.text.toLowerCase()}-category-button`}
                      className={cn(
                        "w-full flex items-center justify-center py-1 px-2 rounded-full text-sm transition-all duration-200 ease-in-out focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                        isActive
                          ? activeTheme
                            ? 'bg-white/30 text-white shadow-lg border border-white/50 hover:bg-white/40' // Active + Immersive theme
                            : 'bg-brand/80 text-white shadow-lg border border-brand/80 hover:bg-brand/70' // Active + Default theme
                          : activeTheme
                            ? 'bg-transparent border border-white/30 text-white hover:bg-white/20' // Inactive + Immersive theme
                            : 'bg-background-creamy/90 text-gray-500 hover:bg-background-creamy' // Inactive + Default theme
                      )}
                      style={{ height: '28px' }}
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
    </div>
  );
};

export default GlobalHeader;