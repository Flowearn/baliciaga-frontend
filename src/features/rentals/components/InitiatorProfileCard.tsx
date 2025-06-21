import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Crown, Home, MessageCircle, Building2 } from "lucide-react";

interface InitiatorInfo {
  id: string;
  name: string;
  profilePictureUrl?: string | null;
  role: 'tenant' | 'landlord' | 'platform';
  whatsApp?: string | null;
}

interface InitiatorProfileCardProps {
  initiator: InitiatorInfo;
  className?: string;
  isAcceptedCandidate?: boolean;
  isOwner?: boolean;
}

const InitiatorProfileCard: React.FC<InitiatorProfileCardProps> = ({ 
  initiator, 
  className = "",
  isAcceptedCandidate = false,
  isOwner = false
}) => {
  const getRoleIcon = (role: string) => {
    if (role === 'landlord') return <Crown className="w-4 h-4" />;
    if (role === 'platform') return <Building2 className="w-4 h-4" />;
    return <Home className="w-4 h-4" />;
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === 'landlord') return "bg-purple-500/20 text-purple-300";
    if (role === 'platform') return "bg-green-500/20 text-green-300";
    return "bg-blue-500/20 text-blue-300";
  };

  const getRoleDisplayName = (role: string) => {
    if (role === 'landlord') return 'Landlord';
    if (role === 'platform') return 'Platform';
    return 'Tenant';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleWhatsAppContact = () => {
    if (initiator.whatsApp) {
      const cleanNumber = initiator.whatsApp.replace(/[^\d]/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <Card className={`bg-black/40 backdrop-blur-sm shadow-lg border-none ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl text-white/70">
          <User className="w-5 h-5 text-white/70" />
          Listing Initiator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={initiator.profilePictureUrl || undefined} 
              alt={initiator.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(initiator.name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white/90">{initiator.name}</h3>
              <Badge 
                variant="secondary" 
                className={getRoleBadgeStyle(initiator.role)}
              >
                {getRoleIcon(initiator.role)}
                <span className="ml-1">{getRoleDisplayName(initiator.role)}</span>
              </Badge>
            </div>
            
            {/* Contact button - only show for accepted candidates or owner */}
            {initiator.whatsApp && (isAcceptedCandidate || isOwner) && (
              <button
                onClick={handleWhatsAppContact}
                className="flex items-center gap-1 text-base text-green-400 hover:text-green-300 hover:underline transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Contact via WhatsApp
              </button>
            )}
            
            {/* No message for non-accepted users - just hide the contact info */}
            
            {!initiator.whatsApp && (isAcceptedCandidate || isOwner) && (
              <p className="text-base text-white/60">Contact info not available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InitiatorProfileCard;