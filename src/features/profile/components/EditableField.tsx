import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from 'sonner';

interface EditableFieldProps {
  label: string;
  value: string | number | undefined;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  type?: 'text' | 'number' | 'tel';
  icon?: React.ReactNode;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  placeholder,
  type = 'text',
  icon
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(editValue);
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
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = value || 'Not set';

  if (isEditing) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {icon}
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent text-white placeholder:text-white/50"
            placeholder={placeholder}
            autoFocus
          />
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/20"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-between cursor-pointer hover:bg-black/20 transition-colors rounded-lg p-1 -m-1"
      onClick={handleEdit}
    >
      <div className="flex items-center space-x-3 flex-1">
        {icon}
        <span className="text-white/90">{displayValue}</span>
      </div>
    </div>
  );
};

export default EditableField; 