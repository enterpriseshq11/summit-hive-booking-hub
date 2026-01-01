import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginPromptModal({ open, onOpenChange }: LoginPromptModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Log in to spin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            Spins are limited to keep prizes fair. Create a free account to play.
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            Your information is secure and never shared.
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate("/login");
              }}
            >
              Log in
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate("/login?signup=true");
              }}
            >
              Create account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
