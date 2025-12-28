import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentTemplate {
  id: string;
  name: string;
  type: "contract" | "waiver" | "policy" | "intake_form";
  content: string;
  version: number;
  requires_signature: boolean;
}

interface DocumentSigningProps {
  documents: DocumentTemplate[];
  bookingId?: string;
  membershipId?: string;
  onComplete: (signedDocIds: string[]) => void;
  onCancel?: () => void;
}

export function DocumentSigning({
  documents,
  bookingId,
  membershipId,
  onComplete,
  onCancel,
}: DocumentSigningProps) {
  const { toast } = useToast();
  const [signedDocs, setSignedDocs] = useState<Set<string>>(new Set());
  const [currentDoc, setCurrentDoc] = useState<DocumentTemplate | null>(null);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingDocs = documents.filter((doc) => !signedDocs.has(doc.id));
  const allSigned = pendingDocs.length === 0;

  const handleSign = async () => {
    if (!currentDoc || !typedName.trim() || !agreed) return;

    setIsSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please log in to sign documents.",
          variant: "destructive",
        });
        return;
      }

      // Create signed document record
      const { error } = await supabase.from("signed_documents").insert({
        user_id: userId,
        template_id: currentDoc.id,
        template_version: currentDoc.version,
        booking_id: bookingId,
        membership_id: membershipId,
        signature_data: JSON.stringify({
          typed_name: typedName,
          agreed: true,
          timestamp: new Date().toISOString(),
        }),
        signed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update local state
      const newSignedDocs = new Set(signedDocs);
      newSignedDocs.add(currentDoc.id);
      setSignedDocs(newSignedDocs);

      // Reset form
      setCurrentDoc(null);
      setTypedName("");
      setAgreed(false);

      toast({
        title: "Document signed",
        description: `${currentDoc.name} has been signed successfully.`,
      });

      // Check if all done
      if (newSignedDocs.size === documents.length) {
        onComplete(Array.from(newSignedDocs));
      }
    } catch (error) {
      console.error("Error signing document:", error);
      toast({
        title: "Error",
        description: "Failed to sign document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "contract":
        return "Contract";
      case "waiver":
        return "Waiver";
      case "policy":
        return "Policy";
      case "intake_form":
        return "Intake Form";
      default:
        return "Document";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Required Documents</h3>
        <p className="text-sm text-muted-foreground">
          Please review and sign the following documents to complete your booking.
        </p>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const isSigned = signedDocs.has(doc.id);

          return (
            <Card
              key={doc.id}
              className={isSigned ? "border-success/50 bg-success/5" : ""}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isSigned ? "bg-success/20" : "bg-muted"
                      }`}
                    >
                      {isSigned ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{doc.name}</CardTitle>
                      <CardDescription>
                        {getDocTypeLabel(doc.type)} • Version {doc.version}
                      </CardDescription>
                    </div>
                  </div>

                  {isSigned ? (
                    <span className="text-sm text-success font-medium">Signed</span>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentDoc(doc)}
                        >
                          Review & Sign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>{doc.name}</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Document content */}
                          <ScrollArea className="h-[300px] border rounded-lg p-4">
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: doc.content }}
                            />
                          </ScrollArea>

                          {/* Signature section */}
                          <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                              <Label htmlFor="typed-name">
                                Type your full legal name to sign
                              </Label>
                              <Input
                                id="typed-name"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="Your full name"
                                className="text-lg"
                              />
                            </div>

                            <div className="flex items-start gap-3">
                              <Checkbox
                                id="agree"
                                checked={agreed}
                                onCheckedChange={(checked) => setAgreed(!!checked)}
                              />
                              <Label htmlFor="agree" className="text-sm leading-relaxed">
                                I have read and understand this {getDocTypeLabel(doc.type).toLowerCase()}, 
                                and I agree to be bound by its terms. I understand that this electronic 
                                signature has the same legal effect as a handwritten signature.
                              </Label>
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCurrentDoc(null);
                                  setTypedName("");
                                  setAgreed(false);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSign}
                                disabled={!typedName.trim() || !agreed || isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing...
                                  </>
                                ) : (
                                  "Sign Document"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Status / Actions */}
      {allSigned ? (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
          <Check className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium text-success">All documents signed</p>
            <p className="text-sm text-muted-foreground">
              You're all set! Your booking can now be confirmed.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium">
              {pendingDocs.length} document{pendingDocs.length !== 1 ? "s" : ""} remaining
            </p>
            <p className="text-sm text-muted-foreground">
              Please sign all required documents to complete your booking.
            </p>
          </div>
        </div>
      )}

      {onCancel && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
