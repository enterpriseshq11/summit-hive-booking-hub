import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentSchedule = Database["public"]["Tables"]["payment_schedules"]["Row"];

export function usePayments(bookingId?: string) {
  return useQuery({
    queryKey: ["payments", bookingId],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function usePaymentSchedules(bookingId: string) {
  return useQuery({
    queryKey: ["payment_schedules", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_schedules")
        .select("*, payments(*)")
        .eq("booking_id", bookingId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: PaymentInsert) => {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "payment",
        entity_id: data.id,
        action_type: "created",
        after_json: data,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments", variables.booking_id] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.booking_id] });
      toast.success("Payment recorded");
    },
    onError: (error) => {
      toast.error("Failed to record payment: " + error.message);
    },
  });
}

export function useCreatePaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schedules: {
      bookingId: string;
      items: { amount: number; dueDate: string; description: string }[];
    }) => {
      const insertData = schedules.items.map((item) => ({
        booking_id: schedules.bookingId,
        amount: item.amount,
        due_date: item.dueDate,
        description: item.description,
        status: "pending",
      }));

      const { data, error } = await supabase
        .from("payment_schedules")
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment_schedules", variables.bookingId] });
      toast.success("Payment schedule created");
    },
    onError: (error) => {
      toast.error("Failed to create payment schedule: " + error.message);
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      amount,
      reason,
    }: {
      paymentId: string;
      amount: number;
      reason: string;
    }) => {
      const { data: before } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      const { data, error } = await supabase
        .from("payments")
        .update({
          status: "refunded",
          refund_amount: amount,
          refund_reason: reason,
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_log").insert({
        entity_type: "payment",
        entity_id: paymentId,
        action_type: "refunded",
        before_json: before,
        after_json: { ...data, refund_amount: amount, refund_reason: reason },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Refund processed");
    },
    onError: (error) => {
      toast.error("Failed to process refund: " + error.message);
    },
  });
}

// Calculate deposit and balance for a booking
export function calculatePaymentSchedule(params: {
  totalAmount: number;
  depositPercentage?: number;
  depositFixed?: number;
  balanceDueDays?: number;
  eventDate: string;
}) {
  const { totalAmount, depositPercentage, depositFixed, balanceDueDays = 14, eventDate } = params;

  let depositAmount = 0;
  if (depositFixed && depositFixed > 0) {
    depositAmount = depositFixed;
  } else if (depositPercentage && depositPercentage > 0) {
    depositAmount = Math.round(totalAmount * (depositPercentage / 100));
  }

  const balanceAmount = totalAmount - depositAmount;
  const eventDateObj = new Date(eventDate);
  const balanceDueDate = new Date(eventDateObj);
  balanceDueDate.setDate(balanceDueDate.getDate() - balanceDueDays);

  return {
    deposit: {
      amount: depositAmount,
      dueDate: new Date().toISOString(),
      description: "Deposit due at booking",
    },
    balance: {
      amount: balanceAmount,
      dueDate: balanceDueDate.toISOString(),
      description: `Balance due ${balanceDueDays} days before event`,
    },
    total: totalAmount,
  };
}
