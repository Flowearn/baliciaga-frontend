import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, X, ChevronDown } from "lucide-react";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { COUNTRY_CODES, DEFAULT_COUNTRY, getCountryFromPhone, formatPhoneNumber, CountryCode } from '@/constants/countryCodes';

interface PhoneEditableFieldProps {
  label: string;
  value: string | undefined;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  icon?: React.ReactNode;
}

const PhoneEditableField: React.FC<PhoneEditableFieldProps> = ({
  label,
  value,
  onSave,
  placeholder = "Enter phone number",
  icon
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse existing value to extract country code and phone number
  useEffect(() => {
    if (value) {
      const country = getCountryFromPhone(value);
      if (country) {
        setSelectedCountry(country);
        // Remove country code from the phone number
        const numberWithoutCode = value.replace(new RegExp(`^\\${country.dial_code}\\s?`), '');
        setPhoneNumber(numberWithoutCode);
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const fullNumber = formatPhoneNumber(selectedCountry.dial_code, phoneNumber);
      await onSave(fullNumber);
      setIsEditing(false);
      toast.success(`${label} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${label}:`, error);
      toast.error(`Failed to update ${label}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (value) {
      const country = getCountryFromPhone(value);
      if (country) {
        setSelectedCountry(country);
        const numberWithoutCode = value.replace(new RegExp(`^\\${country.dial_code}\\s?`), '');
        setPhoneNumber(numberWithoutCode);
      } else {
        setSelectedCountry(DEFAULT_COUNTRY);
        setPhoneNumber(value);
      }
    } else {
      setSelectedCountry(DEFAULT_COUNTRY);
      setPhoneNumber('');
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getDisplayValue = () => {
    if (!value) return 'Not set';
    return value;
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {icon}
          <div className="flex items-center space-x-2 flex-1">
            {/* Country Code Selector */}
            <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={isCountryOpen}
                  className="p-2 h-auto bg-black/20 text-white hover:bg-black/30 border border-white/20"
                >
                  <span className="text-lg mr-1">{selectedCountry.flag}</span>
                  <span className="text-sm">{selectedCountry.dial_code}</span>
                  <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-black/90 border-white/20">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Search country..." className="text-white" />
                  <CommandEmpty className="text-white/60">No country found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList className="max-h-60">
                      {COUNTRY_CODES.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={`${country.name} ${country.dial_code}`}
                          onSelect={() => {
                            setSelectedCountry(country);
                            setIsCountryOpen(false);
                          }}
                          className="text-white/80 hover:bg-white/20 hover:text-white cursor-pointer"
                        >
                          <span className="text-lg mr-2">{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                          <span className="text-white/60">{country.dial_code}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Phone Number Input */}
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border-white/20 bg-black/20 text-white placeholder:text-white/50 focus:border-white/40"
              placeholder={placeholder}
              autoFocus
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 w-9 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/20"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div 
      className="flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors rounded-lg p-1 -m-1"
      onClick={handleEdit}
    >
      <div className="flex items-center gap-4 w-full">
        {/* Icon */}
        {icon}
        {/* Label (takes about 1/3 width, slightly dimmed) */}
        <span className="w-1/3 text-white/70">{label}</span>
        {/* Value (takes remaining space, right-aligned, brighter) */}
        <div className="flex-grow text-white/100 text-right">
          {getDisplayValue()}
        </div>
      </div>
    </div>
  );
};

export default PhoneEditableField;