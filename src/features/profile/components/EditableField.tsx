import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, X, ChevronDown } from "lucide-react";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface EditableFieldProps {
  label: string;
  value: string | number | string[] | undefined;
  onSave: (value: string | string[]) => Promise<void>;
  placeholder?: string;
  type?: 'text' | 'number' | 'tel' | 'select' | 'multi-select';
  options?: SelectOption[];
  icon?: React.ReactNode;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  placeholder,
  type = 'text',
  options = [],
  icon
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    type === 'multi-select' ? 
      (Array.isArray(value) ? value : []) : 
      (value?.toString() || '')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  const handleEdit = () => {
    if (type === 'multi-select') {
      setEditValue(Array.isArray(value) ? value : []);
    } else {
      setEditValue(value?.toString() || '');
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (type === 'multi-select') {
        await onSave(editValue as string[]);
      } else {
        await onSave(editValue as string);
      }
      setIsEditing(false);
      setIsMultiSelectOpen(false);
      toast.success(`${label} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${label}:`, error);
      toast.error(`Failed to update ${label}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (type === 'multi-select') {
      setEditValue(Array.isArray(value) ? value : []);
    } else {
      setEditValue(value?.toString() || '');
    }
    setIsEditing(false);
    setIsMultiSelectOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'multi-select') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleMultiSelectToggle = (optionValue: string) => {
    const currentValues = editValue as string[];
    if (currentValues.includes(optionValue)) {
      setEditValue(currentValues.filter(v => v !== optionValue));
    } else {
      setEditValue([...currentValues, optionValue]);
    }
  };

  // 获取显示值
  const getDisplayValue = () => {
    if (type === 'multi-select') {
      if (!Array.isArray(value) || value.length === 0) return 'No languages selected';
      
      const selectedLabels = value.map(val => {
        const option = options.find(opt => opt.value === val);
        return option ? option.label : val;
      });
      
      return selectedLabels.join(', ');
    }
    
    if (!value) return 'Not set';
    
    if (type === 'select' && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    return value;
  };

  const displayValue = getDisplayValue();

  // Multi-select编辑模式的渲染
  const renderMultiSelectEdit = () => {
    const selectedValues = editValue as string[];
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {icon}
          <div className="flex-1">
            <Popover open={isMultiSelectOpen} onOpenChange={setIsMultiSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={isMultiSelectOpen}
                  className="justify-between p-0 h-auto bg-transparent text-white hover:bg-transparent"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedValues.length > 0 ? (
                      selectedValues.map((val) => {
                        const option = options.find(opt => opt.value === val);
                        return (
                          <Badge
                            key={val}
                            variant="secondary"
                            className="text-sm bg-white/20 text-white/80"
                          >
                            {option ? option.label : val}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-white/50">{placeholder}</span>
                    )}
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-black/90 border-white/20">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Search languages..." className="text-white" />
                  <CommandEmpty className="text-white/60">No language found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList className="max-h-60">
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleMultiSelectToggle(option.value)}
                          className="text-white/80 hover:bg-white/20 hover:text-white cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
  };

  // Multi-select显示模式的渲染
  const renderMultiSelectDisplay = () => {
    const valueArray = Array.isArray(value) ? value : [];
    
    return (
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors rounded-lg p-1 -m-1"
        onClick={handleEdit}
      >
        <div className="flex items-center gap-4 w-full">
          {/* 图标 */}
          {icon}
          {/* 标签名 (占据约1/3宽度，颜色稍暗) */}
          <span className="w-1/3 text-white/70">{label}</span>
          {/* 值 (占据剩余空间，右对齐，颜色更亮) */}
          <div className="flex-grow text-right">
            <div className="flex flex-wrap gap-2 justify-end">
              {valueArray.length > 0 ? (
                valueArray.map((lang) => {
                  const option = options.find(opt => opt.value === lang);
                  return (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="text-sm bg-white/20 text-white/80 hover:bg-white/30"
                    >
                      {option ? option.label : lang}
                    </Badge>
                  );
                })
              ) : (
                <span className="text-white/60 text-base">No languages selected</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isEditing) {
    if (type === 'multi-select') {
      return renderMultiSelectEdit();
    }
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {icon}
          {type === 'select' ? (
            <Select value={editValue as string} onValueChange={setEditValue}>
              <SelectTrigger className="border-0 shadow-none focus:ring-0 p-0 bg-transparent text-white h-auto">
                <SelectValue placeholder={placeholder} className="text-white" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                {options.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white/30 hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white data-[highlighted]:text-white data-[highlighted]:bg-white/20"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={type}
              value={editValue as string}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent text-white placeholder:text-white/50"
              placeholder={placeholder}
              autoFocus
            />
          )}
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

  // 显示模式
  if (type === 'multi-select') {
    return renderMultiSelectDisplay();
  }

  return (
    <div 
      className="flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors rounded-lg p-1 -m-1"
      onClick={handleEdit}
    >
      <div className="flex items-center gap-4 w-full">
        {/* 图标 */}
        {icon}
        {/* 标签名 (占据约1/3宽度，颜色稍暗) */}
        <span className="w-1/3 text-white/70">{label}</span>
        {/* 值 (占据剩余空间，右对齐，颜色更亮) */}
        <div className="flex-grow text-white/100 text-right">
          {displayValue}
        </div>
      </div>
    </div>
  );
};

export default EditableField; 