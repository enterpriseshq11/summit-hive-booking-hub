import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { 
  useCreateSpaWorker, 
  useUpdateSpaWorker,
  type SpaWorker 
} from "@/hooks/useSpaWorkers";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  display_name: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SpaWorkerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: SpaWorker | null;
}

export function SpaWorkerFormModal({ open, onOpenChange, worker }: SpaWorkerFormModalProps) {
  const isEditing = !!worker;
  const createMutation = useCreateSpaWorker();
  const updateMutation = useUpdateSpaWorker();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      display_name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (worker) {
      form.reset({
        first_name: worker.first_name,
        last_name: worker.last_name,
        display_name: worker.display_name,
        email: worker.email,
        phone: worker.phone || "",
        notes: worker.notes || "",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        display_name: "",
        email: "",
        phone: "",
        notes: "",
      });
    }
  }, [worker, form]);

  // Auto-generate display name from first name
  const firstName = form.watch("first_name");
  useEffect(() => {
    if (!isEditing && firstName && !form.getValues("display_name")) {
      form.setValue("display_name", firstName);
    }
  }, [firstName, isEditing, form]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      display_name: data.display_name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    };
    
    if (isEditing && worker) {
      await updateMutation.mutateAsync({ id: worker.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? "Edit Worker" : "Add New Worker"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Lindsey"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="Smith"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Lindsey"
                    />
                  </FormControl>
                  <p className="text-xs text-zinc-500 mt-1">
                    This name appears in the booking dropdown on the website
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="lindsey@example.com"
                      disabled={isEditing && !!worker?.user_id}
                    />
                  </FormControl>
                  {isEditing && worker?.user_id && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Email cannot be changed after account is created
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="(555) 123-4567"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-zinc-800 border-zinc-700 text-white resize-none"
                      placeholder="Internal notes about this worker..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Save Changes" : "Add Worker"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
