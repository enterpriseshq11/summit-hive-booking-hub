import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { useBookableTypes } from "@/hooks/useBookableTypes";
import { useBusinesses } from "@/hooks/useBusinesses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Plus, Loader2, Edit, Trash2, ToggleLeft, ToggleRight, Eye, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DocumentTemplate } from "@/types";

const DOCUMENT_TYPES = [
  { value: "contract", label: "Contract" },
  { value: "waiver", label: "Waiver" },
  { value: "policy", label: "Policy" },
  { value: "intake_form", label: "Intake Form" },
];

export default function AdminDocuments() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useDocumentTemplates();
  const { data: bookableTypes } = useBookableTypes();
  const { data: businesses } = useBusinesses();
  const [showDialog, setShowDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "waiver" as "contract" | "waiver" | "policy" | "intake_form",
    business_id: "",
    bookable_type_id: "",
    content: "",
    is_required: true,
    requires_signature: true,
    is_active: true,
  });

  const logAudit = async (actionType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: "document_template",
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const openEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      type: template.type,
      business_id: template.business_id,
      bookable_type_id: template.bookable_type_id || "",
      content: template.content,
      is_required: template.is_required ?? true,
      requires_signature: template.requires_signature ?? true,
      is_active: template.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.business_id || !form.content) {
      toast.error("Name, business, and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        bookable_type_id: form.bookable_type_id || null,
        version: editingTemplate ? (editingTemplate.version || 1) + 1 : 1,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("document_templates")
          .update(payload)
          .eq("id", editingTemplate.id);
        if (error) throw error;
        await logAudit("update", editingTemplate.id, editingTemplate, payload);
        toast.success(`Document updated (v${payload.version})`);
      } else {
        const { data, error } = await supabase
          .from("document_templates")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        await logAudit("create", data.id, null, payload);
        toast.success("Document created");
      }

      queryClient.invalidateQueries({ queryKey: ["document_templates"] });
      setShowDialog(false);
      setEditingTemplate(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (template: DocumentTemplate) => {
    if (!confirm(`Delete document "${template.name}"? This cannot be undone.`)) return;
    
    try {
      const { error } = await supabase.from("document_templates").delete().eq("id", template.id);
      if (error) throw error;
      await logAudit("delete", template.id, template, null);
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["document_templates"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleActive = async (template: DocumentTemplate) => {
    try {
      const newState = !template.is_active;
      const { error } = await supabase
        .from("document_templates")
        .update({ is_active: newState })
        .eq("id", template.id);
      if (error) throw error;
      await logAudit("toggle_active", template.id, { is_active: template.is_active }, { is_active: newState });
      toast.success(`Document ${newState ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["document_templates"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openPreview = (template: DocumentTemplate) => {
    setPreviewContent(template.content);
    setShowPreview(true);
  };

  const getBusinessName = (id: string) => businesses?.find((b) => b.id === id)?.name || "Unknown";
  const getBookableTypeName = (id: string | null) => {
    if (!id) return "All Types";
    return bookableTypes?.find((bt) => bt.id === id)?.name || "Unknown";
  };
  const getTypeLabel = (type: string) => DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;

  const groupedTemplates = templates?.reduce((acc, template) => {
    const type = template.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<string, DocumentTemplate[]>) || {};

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Documents & Templates
            </h1>
            <p className="text-muted-foreground">
              Manage contracts, waivers, policies, and intake forms
            </p>
          </div>
          <Button onClick={() => { 
            setEditingTemplate(null); 
            setForm({ 
              name: "", 
              type: "waiver", 
              business_id: "", 
              bookable_type_id: "", 
              content: "", 
              is_required: true, 
              requires_signature: true, 
              is_active: true 
            }); 
            setShowDialog(true); 
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({templates?.length || 0})</TabsTrigger>
            {DOCUMENT_TYPES.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label} ({groupedTemplates[type.value]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DocumentTable 
              templates={templates || []} 
              getBusinessName={getBusinessName}
              getBookableTypeName={getBookableTypeName}
              getTypeLabel={getTypeLabel}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={toggleActive}
              onPreview={openPreview}
            />
          </TabsContent>

          {DOCUMENT_TYPES.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-4">
              <DocumentTable 
                templates={groupedTemplates[type.value] || []} 
                getBusinessName={getBusinessName}
                getBookableTypeName={getBookableTypeName}
                getTypeLabel={getTypeLabel}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={toggleActive}
                onPreview={openPreview}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? `Edit Document (v${editingTemplate.version || 1})` : "Add Document"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business *</Label>
                  <Select value={form.business_id} onValueChange={(v) => setForm({ ...form, business_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                    <SelectContent>
                      {businesses?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service Type (optional)</Label>
                  <Select value={form.bookable_type_id} onValueChange={(v) => setForm({ ...form, bookable_type_id: v === "all" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {bookableTypes?.map((bt) => (
                        <SelectItem key={bt.id} value={bt.id}>{bt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Content * (supports Markdown)</Label>
                <Textarea 
                  value={form.content} 
                  onChange={(e) => setForm({ ...form, content: e.target.value })} 
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter document content here. Use Markdown for formatting.

# Liability Waiver

I, {{customer_name}}, acknowledge and agree to the following terms...

## Assumption of Risk

By participating in activities at {{business_name}}, I understand that...

---

Signature: _______________
Date: {{date}}"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Required</div>
                    <div className="text-xs text-muted-foreground">Must be completed before booking</div>
                  </div>
                  <Switch 
                    checked={form.is_required} 
                    onCheckedChange={(v) => setForm({ ...form, is_required: v })} 
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Requires Signature</div>
                    <div className="text-xs text-muted-foreground">Customer must sign</div>
                  </div>
                  <Switch 
                    checked={form.requires_signature} 
                    onCheckedChange={(v) => setForm({ ...form, requires_signature: v })} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTemplate ? "Save (New Version)" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm max-w-none overflow-y-auto max-h-[60vh] p-4 border rounded-lg bg-muted/30">
              <pre className="whitespace-pre-wrap font-sans text-sm">{previewContent}</pre>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPreview(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function DocumentTable({ 
  templates, 
  getBusinessName, 
  getBookableTypeName, 
  getTypeLabel,
  onEdit, 
  onDelete, 
  onToggle,
  onPreview 
}: {
  templates: DocumentTemplate[];
  getBusinessName: (id: string) => string;
  getBookableTypeName: (id: string | null) => string;
  getTypeLabel: (type: string) => string;
  onEdit: (t: DocumentTemplate) => void;
  onDelete: (t: DocumentTemplate) => void;
  onToggle: (t: DocumentTemplate) => void;
  onPreview: (t: DocumentTemplate) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">v{template.version || 1}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeLabel(template.type)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{getBusinessName(template.business_id)}</div>
                    <div className="text-muted-foreground">{getBookableTypeName(template.bookable_type_id)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {template.is_required && <Badge variant="secondary">Required</Badge>}
                    {template.requires_signature && (
                      <Badge variant="secondary">
                        <FileSignature className="h-3 w-3 mr-1" />
                        Sign
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onPreview(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggle(template)}>
                      {template.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(template)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No documents
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
