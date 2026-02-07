import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StatusChangeRequest {
  type: "order" | "shop_order" | "demand" | "payment";
  reference_id: string;
  user_id: string;
  new_status: string;
  title?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, reference_id, user_id, new_status, title, message }: StatusChangeRequest = await req.json();

    console.log("Status change notification:", { type, reference_id, user_id, new_status });

    // Get profile ID for user
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    // Generate default title and message based on type
    let notificationTitle = title;
    let notificationMessage = message;
    let notificationType = "info";

    if (!notificationTitle || !notificationMessage) {
      switch (type) {
        case "order":
          notificationType = "order_update";
          notificationTitle = "Order Status Updated";
          notificationMessage = `Your order status has been updated to: ${new_status.replace(/_/g, " ").toUpperCase()}`;
          break;
        case "shop_order":
          notificationType = "order_update";
          notificationTitle = "Nilkhet Order Status Updated";
          notificationMessage = `Your Nilkhet order status has been updated to: ${new_status.replace(/_/g, " ").toUpperCase()}`;
          break;
        case "demand":
          notificationType = "demand_update";
          notificationTitle = "Book Demand Status Updated";
          notificationMessage = `Your book demand status has been updated to: ${new_status.replace(/_/g, " ").toUpperCase()}`;
          break;
        case "payment":
          notificationType = "payment_update";
          notificationTitle = "Payment Status Updated";
          notificationMessage = `Your payment status has been updated to: ${new_status.replace(/_/g, " ").toUpperCase()}`;
          break;
      }
    }

    // Create notification
    const { error: insertError } = await supabase
      .from("user_notifications")
      .insert({
        user_id,
        profile_id: profile?.id || null,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        reference_type: type,
        reference_id,
        is_read: false,
      });

    if (insertError) {
      console.error("Error creating notification:", insertError);
      throw insertError;
    }

    console.log("Notification created successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-status-change function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
