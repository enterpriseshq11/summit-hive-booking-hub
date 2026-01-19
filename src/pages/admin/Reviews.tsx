import { useState } from "react";
import { AdminLayout } from "@/components/admin";
import { useReviews } from "@/hooks/useReviews";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, Loader2, Eye, EyeOff, Flag, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Review } from "@/types";

export default function AdminReviews() {
  const { authUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useReviews();
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logAudit = async (actionType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_log").insert({
      action_type: actionType,
      entity_type: "review",
      entity_id: entityId,
      actor_user_id: authUser?.id,
      before_json: before,
      after_json: after,
    });
  };

  const togglePublic = async (review: Review) => {
    try {
      const newState = !review.is_public;
      const { error } = await supabase
        .from("reviews")
        .update({ is_public: newState })
        .eq("id", review.id);
      if (error) throw error;
      await logAudit("toggle_visibility", review.id, { is_public: review.is_public }, { is_public: newState });
      toast.success(`Review ${newState ? "published" : "hidden"}`);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleFeatured = async (review: Review) => {
    try {
      const newState = !review.is_featured;
      const { error } = await supabase
        .from("reviews")
        .update({ is_featured: newState })
        .eq("id", review.id);
      if (error) throw error;
      await logAudit("toggle_featured", review.id, { is_featured: review.is_featured }, { is_featured: newState });
      toast.success(`Review ${newState ? "featured" : "unfeatured"}`);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openResponseDialog = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.admin_response || "");
    setShowResponseDialog(true);
  };

  const handleResponse = async () => {
    if (!selectedReview) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ 
          admin_response: responseText || null,
          responded_at: responseText ? new Date().toISOString() : null,
        })
        .eq("id", selectedReview.id);
      if (error) throw error;
      await logAudit("respond", selectedReview.id, 
        { admin_response: selectedReview.admin_response }, 
        { admin_response: responseText }
      );
      toast.success(responseText ? "Response saved" : "Response removed");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setShowResponseDialog(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const allReviews = reviews || [];
  const pendingReviews = allReviews.filter((r) => !r.is_public);
  const publishedReviews = allReviews.filter((r) => r.is_public);
  const lowRatingReviews = allReviews.filter((r) => r.rating <= 2);
  const featuredReviews = allReviews.filter((r) => r.is_featured);

  const avgRating = allReviews.length > 0 
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : "—";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Star className="h-6 w-6" />
              Reviews
            </h1>
            <p className="text-zinc-300">
              View and respond to customer reviews
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allReviews.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {avgRating}
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Low Ratings (≤2)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowRatingReviews.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({allReviews.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
            <TabsTrigger value="low">Low Ratings ({lowRatingReviews.length})</TabsTrigger>
            <TabsTrigger value="featured">Featured ({featuredReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ReviewTable 
              reviews={allReviews} 
              renderStars={renderStars}
              onTogglePublic={togglePublic}
              onToggleFeatured={toggleFeatured}
              onRespond={openResponseDialog}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <ReviewTable 
              reviews={pendingReviews} 
              renderStars={renderStars}
              onTogglePublic={togglePublic}
              onToggleFeatured={toggleFeatured}
              onRespond={openResponseDialog}
            />
          </TabsContent>

          <TabsContent value="low" className="mt-4">
            <ReviewTable 
              reviews={lowRatingReviews} 
              renderStars={renderStars}
              onTogglePublic={togglePublic}
              onToggleFeatured={toggleFeatured}
              onRespond={openResponseDialog}
            />
          </TabsContent>

          <TabsContent value="featured" className="mt-4">
            <ReviewTable 
              reviews={featuredReviews} 
              renderStars={renderStars}
              onTogglePublic={togglePublic}
              onToggleFeatured={toggleFeatured}
              onRespond={openResponseDialog}
            />
          </TabsContent>
        </Tabs>

        {/* Response Dialog */}
        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Respond to Review</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(selectedReview.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  {selectedReview.title && (
                    <div className="font-medium">{selectedReview.title}</div>
                  )}
                  {selectedReview.content && (
                    <div className="text-sm mt-1">{selectedReview.content}</div>
                  )}
                </div>
                <div>
                  <Textarea
                    placeholder="Write your response to this review..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cancel</Button>
              <Button onClick={handleResponse} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function ReviewTable({
  reviews,
  renderStars,
  onTogglePublic,
  onToggleFeatured,
  onRespond,
}: {
  reviews: Review[];
  renderStars: (rating: number) => JSX.Element;
  onTogglePublic: (r: Review) => void;
  onToggleFeatured: (r: Review) => void;
  onRespond: (r: Review) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {renderStars(review.rating)}
                    {review.rating <= 2 && (
                      <Badge variant="destructive" className="w-fit">
                        <Flag className="h-3 w-3 mr-1" />
                        Low
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    {review.title && <div className="font-medium text-white">{review.title}</div>}
                    {review.content && (
                      <div className="text-sm text-zinc-300 line-clamp-2">{review.content}</div>
                    )}
                    {review.admin_response && (
                      <div className="mt-2 text-xs text-zinc-400 border-l-2 pl-2">
                        <span className="font-medium text-zinc-300">Response:</span> {review.admin_response}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={review.is_public ? "default" : "secondary"}>
                      {review.is_public ? "Published" : "Hidden"}
                    </Badge>
                    {review.is_featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onRespond(review)} title="Respond">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onTogglePublic(review)} title={review.is_public ? "Hide" : "Publish"}>
                      {review.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggleFeatured(review)} title={review.is_featured ? "Unfeature" : "Feature"}>
                      {review.is_featured ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No reviews
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
