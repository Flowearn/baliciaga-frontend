import React from 'react';
import { Button } from '@aws-amplify/ui-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Mail, MessageSquare, CircleUserRound, Briefcase, Globe, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// 临时Application类型定义
interface Application {
  applicationId: string;
  status: 'pending' | 'accepted' | 'ignored';
  createdAt: string;
  applicant?: {
    email?: string;
    profile?: {
      name?: string;
      whatsApp?: string;
      age?: number;
      gender?: string;
      occupation?: string;
      languages?: string[];
      profilePictureUrl?: string;
    };
  };
}

// 定义组件接收的Props
interface ApplicationCardProps {
  application: Application;
  onStatusUpdate: (applicationId: string, status: 'accepted' | 'ignored' | 'pending') => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onStatusUpdate }) => {
  
  // 调试application状态
  console.log(`🔍 ApplicationCard render - ID: ${application.applicationId}, Status: ${application.status}`);
  
  // 事件处理函数
  const handleAccept = () => {
    onStatusUpdate(application.applicationId, 'accepted');
  };

  const handleIgnore = () => {
    onStatusUpdate(application.applicationId, 'ignored');
  };

  const handleWithdraw = () => {
    // "撤回"操作总是将状态重置为'pending'
    onStatusUpdate(application.applicationId, 'pending');
  };

  const applier = application.applicant?.profile;
  const applierName = applier?.name || 'Applier';

  return (
    <div className="p-4 bg-white/10 rounded-lg border-none">
      <div className="flex gap-3 items-start">
        <div className="flex-1 pr-2">
          <h4 className="font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis mb-1">{applierName}</h4>
          <div className="text-sm text-white/60 mb-2">Applied {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          
          {application.applicant?.email && (
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{application.applicant.email}</span>
            </div>
          )}

          {applier?.whatsApp && (
             <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <MessageSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
              <a href={`https://wa.me/${applier.whatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline transition-colors">{applier.whatsApp}</a>
            </div>
          )}
          
          {(applier?.age || applier?.gender) && (
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <CircleUserRound className="w-4 h-4 text-white/60 flex-shrink-0" />
              <span className="whitespace-nowrap">{[applier.age ? `${applier.age} years old` : null, applier.gender].filter(Boolean).join(' • ')}</span>
            </div>
          )}

          {applier?.occupation && (
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <Briefcase className="w-4 h-4 text-white/60 flex-shrink-0" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{applier.occupation}</span>
            </div>
          )}

          {applier?.languages && applier.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <Globe className="w-4 h-4 text-white/60 flex-shrink-0" />
              <span className="capitalize">{applier.languages.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="w-24 h-24 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {applier?.profilePictureUrl ? (
            <OptimizedImage
              src={applier.profilePictureUrl}
              alt={applierName}
              aspectRatio="1:1"
            />
          ) : (
            <User className="w-12 h-12 text-white/50" />
          )}
        </div>
      </div>
      
      {/* --- Action Buttons & Tags Container --- */}
      {application.status === 'pending' && (
        <div className="flex w-full items-center gap-x-3 pt-4 mt-4 border-t border-white/10">
          <Button variation="destructive" size="small" className="flex-1" onClick={handleIgnore}>
            Ignore
          </Button>
          <Button variation="primary" size="small" className="flex-1" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      )}

      {application.status === 'accepted' && (
        <div className="flex w-full items-center gap-x-3 pt-4 mt-4 border-t border-white/10">
          <Button size="small" className="flex-1" onClick={handleWithdraw}>Withdraw</Button>
          <div className="flex flex-1 items-center justify-center text-sm font-semibold text-green-400">Accepted</div>
        </div>
      )}

      {application.status === 'ignored' && (
        <div className="flex w-full items-center gap-x-3 pt-4 mt-4 border-t border-white/10">
          <Button size="small" className="flex-1" onClick={handleWithdraw}>Reconsider</Button>
          <div className="flex flex-1 items-center justify-center text-sm font-medium text-neutral-400">Ignored</div>
        </div>
      )}

      {/* 处理异常的withdrawn状态：应该显示为pending */}
      {(application.status as string) === 'withdrawn' && (
        <div className="flex w-full items-center gap-x-3 pt-4 mt-4 border-t border-white/10">
          <Button variation="destructive" size="small" className="flex-1" onClick={handleIgnore}>
            Ignore
          </Button>
          <Button variation="primary" size="small" className="flex-1" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      )}
      
      {/* 其他未知状态的调试信息 */}
      {!['pending', 'accepted', 'ignored', 'withdrawn'].includes(application.status as string) && (
        <div className="text-sm font-medium text-red-400 pt-4 mt-4 border-t border-white/10">
          Unexpected status: {application.status}
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
