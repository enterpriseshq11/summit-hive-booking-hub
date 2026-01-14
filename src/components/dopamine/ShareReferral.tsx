import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="p-6 bg-zinc-900/80 border-zinc-700">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-bold text-white">Share & Earn</h3>
          <p className="text-sm text-muted-foreground">Tell friends about Spin & Win</p>
        </div>
      </div>
      
      <p className="text-sm text-zinc-400 mb-4">
        Share this page with friends. Future referral bonuses coming soon!
      </p>
      
      <div className="flex gap-2">
        <Button 
          className="flex-1 border border-primary/40 bg-transparent text-primary hover:bg-primary/20 hover:border-primary"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button 
          className="border border-primary/40 bg-transparent text-primary hover:bg-primary/20 hover:border-primary"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </Card>
  );
}
