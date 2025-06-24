import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import LeaseDurationSelector from "@/features/rentals/components/LeaseDurationSelector";

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string, applicantLeaseDuration?: string) => Promise<void>;
  listingTitle: string;
  leaseDuration?: string;
}

export default function ApplicationModal({ 
  open, 
  onClose, 
  onSubmit, 
  listingTitle,
  leaseDuration 
}: ApplicationModalProps) {
  const [message, setMessage] = useState("");
  const [applicantLeaseDuration, setApplicantLeaseDuration] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if lease duration selection is required
  const isNegotiable = leaseDuration === 'Negotiable';

  const handleSubmit = async () => {
    // Allow empty message since it's optional
    setLoading(true);
    try {
      await onSubmit(message.trim(), isNegotiable ? applicantLeaseDuration : undefined);
      setMessage("");
      setApplicantLeaseDuration("");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage("");
      setApplicantLeaseDuration("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-40px)] max-w-md bg-black/40 backdrop-blur-sm rounded-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Apply for {listingTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Lease Duration Selection - Only show if negotiable */}
          {isNegotiable && (
            <div className="space-y-2">
              <label className="text-base font-medium text-white">
                Select your preferred lease duration
              </label>
              <LeaseDurationSelector
                selectedDuration={applicantLeaseDuration}
                onDurationSelect={setApplicantLeaseDuration}
              />
            </div>
          )}

          {/* Message Textarea */}
          <div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something to the host... (optional)"
              className="min-h-[120px] resize-none bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
              disabled={loading}
              maxLength={1000}
            />
            <div className="text-sm text-white/70 mt-2">
              {message.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            onClick={handleClose} 
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (isNegotiable && !applicantLeaseDuration)}
            className="min-w-[100px] bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/20 rounded-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-0.5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 