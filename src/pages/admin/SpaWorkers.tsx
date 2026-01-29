import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  useSpaWorkers, 
  useDeactivateSpaWorker, 
  useReactivateSpaWorker,
  useSendWorkerInvite,
  useDeleteSpaWorker,
  type SpaWorker 
} from "@/hooks/useSpaWorkers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  MoreHorizontal, 
  Mail, 
  UserX, 
  UserCheck, 
  Pencil, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { SpaWorkerFormModal } from "@/components/admin/SpaWorkerFormModal";
import { SpaWorkerAvailabilityModal } from "@/components/admin/SpaWorkerAvailabilityModal";

export default function SpaWorkersPage() {
  const { data: workers = [], isLoading } = useSpaWorkers();
  const deactivateMutation = useDeactivateSpaWorker();
  const reactivateMutation = useReactivateSpaWorker();
  const sendInviteMutation = useSendWorkerInvite();
  const deleteMutation = useDeleteSpaWorker();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<SpaWorker | null>(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedWorkerForAvailability, setSelectedWorkerForAvailability] = useState<SpaWorker | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [workerToDeactivate, setWorkerToDeactivate] = useState<SpaWorker | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<SpaWorker | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleAddWorker = () => {
    setEditingWorker(null);
    setFormModalOpen(true);
  };

  const handleEditWorker = (worker: SpaWorker) => {
    setEditingWorker(worker);
    setFormModalOpen(true);
  };

  const handleManageAvailability = (worker: SpaWorker) => {
    setSelectedWorkerForAvailability(worker);
    setAvailabilityModalOpen(true);
  };

  const handleSendInvite = (worker: SpaWorker) => {
    sendInviteMutation.mutate(worker.id);
  };

  const handleDeactivate = (worker: SpaWorker) => {
    setWorkerToDeactivate(worker);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = () => {
    if (workerToDeactivate) {
      deactivateMutation.mutate(workerToDeactivate.id);
    }
    setDeactivateDialogOpen(false);
    setWorkerToDeactivate(null);
  };

  const handleDelete = (worker: SpaWorker) => {
    setWorkerToDelete(worker);
    setDeleteConfirmText("");
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (workerToDelete && deleteConfirmText === "DELETE") {
      deleteMutation.mutate(workerToDelete.id);
      setDeleteDialogOpen(false);
      setWorkerToDelete(null);
      setDeleteConfirmText("");
    }
  };

  const handleReactivate = (worker: SpaWorker) => {
    reactivateMutation.mutate(worker.id);
  };

  const getStatusBadge = (worker: SpaWorker) => {
    if (!worker.is_active) {
      return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">Inactive</Badge>;
    }
    if (worker.invite_accepted_at) {
      return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Active</Badge>;
    }
    if (worker.invited_at) {
      const isExpired = worker.invite_expires_at && new Date(worker.invite_expires_at) < new Date();
      if (isExpired) {
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">Invite Expired</Badge>;
      }
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Invite Sent</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pending Invite</Badge>;
  };

  const activeWorkers = workers.filter(w => w.is_active);
  const inactiveWorkers = workers.filter(w => !w.is_active);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Spa Workers</h1>
            <p className="text-zinc-400 mt-1">
              Manage massage therapists for Restoration Lounge
            </p>
          </div>
          <Button onClick={handleAddWorker} className="bg-amber-500 hover:bg-amber-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeWorkers.length}</p>
                <p className="text-sm text-zinc-400">Active Workers</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {workers.filter(w => w.invited_at && !w.invite_accepted_at && w.is_active).length}
                </p>
                <p className="text-sm text-zinc-400">Pending Invites</p>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{inactiveWorkers.length}</p>
                <p className="text-sm text-zinc-400">Inactive Workers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workers Table */}
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">No workers yet. Add your first worker to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Worker</TableHead>
                  <TableHead className="text-zinc-400">Display Name</TableHead>
                  <TableHead className="text-zinc-400">Contact</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Added</TableHead>
                  <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id} className="border-zinc-700">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">
                          {worker.first_name} {worker.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-amber-400 font-medium">{worker.display_name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-zinc-300">{worker.email}</p>
                        {worker.phone && (
                          <p className="text-sm text-zinc-500">{worker.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(worker)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-400">
                        {formatDistanceToNow(new Date(worker.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                          <DropdownMenuItem 
                            className="text-white focus:bg-zinc-700 cursor-pointer"
                            onClick={() => handleEditWorker(worker)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-white focus:bg-zinc-700 cursor-pointer"
                            onClick={() => handleManageAvailability(worker)}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Manage Availability
                          </DropdownMenuItem>
                          {worker.is_active && !worker.invite_accepted_at && (
                            <DropdownMenuItem 
                              className="text-white focus:bg-zinc-700 cursor-pointer"
                              onClick={() => handleSendInvite(worker)}
                              disabled={sendInviteMutation.isPending}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {worker.invited_at ? "Resend Invite" : "Send Invite"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-zinc-700" />
                          {worker.is_active ? (
                            <DropdownMenuItem 
                              className="text-orange-400 focus:bg-zinc-700 focus:text-orange-400 cursor-pointer"
                              onClick={() => handleDeactivate(worker)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-green-400 focus:bg-zinc-700 focus:text-green-400 cursor-pointer"
                              onClick={() => handleReactivate(worker)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-red-400 focus:bg-zinc-700 focus:text-red-400 cursor-pointer"
                            onClick={() => handleDelete(worker)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Worker
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <SpaWorkerFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        worker={editingWorker}
      />

      {/* Availability Modal */}
      <SpaWorkerAvailabilityModal
        open={availabilityModalOpen}
        onOpenChange={setAvailabilityModalOpen}
        worker={selectedWorkerForAvailability}
      />

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Deactivate Worker</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to deactivate {workerToDeactivate?.first_name} {workerToDeactivate?.last_name}?
              <br /><br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remove them from the booking dropdown</li>
                <li>Prevent them from logging in</li>
                <li>Keep their historical bookings intact</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeactivate}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) {
          setDeleteConfirmText("");
          setWorkerToDelete(null);
        }
      }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete worker?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will remove <span className="font-semibold text-white">{workerToDelete?.first_name} {workerToDelete?.last_name}</span> from the Spa Workers list and the website booking dropdown.
              <br /><br />
              Historical bookings will be preserved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <p className="text-sm text-zinc-400">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="bg-zinc-800 border-zinc-700 text-white font-mono"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteConfirmText !== "DELETE" || deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Worker"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
