import React, { useState, useEffect } from "react";
import { pickPantone } from "@/styles/pantoneBackgrounds";
import { applyImmersiveTheme, resetDefaultTheme } from '@/lib/themeUtils';

interface ColoredPageWrapperProps {
  children: React.ReactNode;
  seed?: string;
  className?: string;
}

const ColoredPageWrapper: React.FC<ColoredPageWrapperProps> = ({ children, seed, className }) => {
  const [bgColor, setBgColor] = useState<string>("");

  useEffect(() => {
    const color = pickPantone(seed);
    setBgColor(color);

    if (color) {
      applyImmersiveTheme(color);
    }

    return () => {
      resetDefaultTheme();
    };
  }, [seed]);

  return (
    <div 
      className={`min-h-screen w-full relative ${className || ''}`}
      style={{ backgroundColor: bgColor || "#534540" }}
    >
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default ColoredPageWrapper;