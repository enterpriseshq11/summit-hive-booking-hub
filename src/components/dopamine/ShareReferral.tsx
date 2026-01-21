import { Share2, Copy, Check, Users, Gift, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";

interface ShareReferralProps {
  isAuthenticated: boolean;
}

export function ShareReferral({ isAuthenticated }: ShareReferralProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/dopamine-drop` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Spin & Win at A-Z Enterprises",
          text: "Spin the wheel daily and earn entries into monthly prize drawings!",
          url: shareUrl,
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700 h-full flex flex-col">
      {/* Header with Coming Soon Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Share & Earn</h3>
            <p className="text-sm text-zinc-300">Referral bonuses coming soon</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary text-xs font-semibold">
          <Clock className="w-3 h-3 mr-1" />
          COMING
        </Badge>
      </div>
      
      {/* Visual emphasis for referrals coming */}
      <div className="flex-1 space-y-4">
        <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/50">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-5 h-5 text-primary" />
            <div>
              <p className="text-base text-white font-semibold">Referral Rewards</p>
              <p className="text-sm text-zinc-300">Earn bonus entries for each friend</p>
            </div>
          </div>
          
          {/* Disabled Progress Bar - Coming Soon placeholder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">Friends referred</span>
              <span className="text-zinc-400 font-medium">0 / 5</span>
            </div>
            <Progress value={0} className="h-2 bg-zinc-700" />
            <p className="text-xs text-zinc-400 text-center">
              Referral tracking coming soon
            </p>
          </div>
        </div>
        
        <p className="text-base text-zinc-200 leading-relaxed">
          Share this page with friends now to prepare for future referral bonuses!
        </p>
      </div>
      
      {/* Share Buttons */}
      <div className="flex gap-2 mt-4">
        <Button 
          className="flex-1 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary font-semibold"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Page
        </Button>
        <Button 
          className="border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      
      <p className="text-xs text-zinc-400 text-center mt-3">
        Sharing now prepares you for future referral bonuses
      </p>
    </Card>
  );
}
