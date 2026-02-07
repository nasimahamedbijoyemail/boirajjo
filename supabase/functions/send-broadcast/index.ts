import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BroadcastRequest {
  title: string;
  message: string;
  target_type: "all" | "institution" | "department" | "shop" | "user";
  target_institution_id?: string | null;
  target_department_id?: string | null;
  target_shop_id?: string | null;
  target_user_id?: string | null;
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

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const body: BroadcastRequest = await req.json();
    const { title, message, target_type, target_institution_id, target_department_id, target_shop_id, target_user_id } = body;

    console.log("Broadcast request:", body);

    // Get target users based on target_type
    let targetUsers: string[] = [];

    if (target_type === "all") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id");
      targetUsers = profiles?.map(p => p.user_id) || [];
    } else if (target_type === "institution" && target_institution_id) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("institution_id", target_institution_id);
      targetUsers = profiles?.map(p => p.user_id) || [];
    } else if (target_type === "department" && target_department_id) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("department_id", target_department_id);
      targetUsers = profiles?.map(p => p.user_id) || [];
    } else if (target_type === "shop" && target_shop_id) {
      const { data: shop } = await supabase
        .from("shops")
        .select("user_id")
        .eq("id", target_shop_id)
        .single();
      if (shop) {
        targetUsers = [shop.user_id];
      }
    } else if (target_type === "user" && target_user_id) {
      targetUsers = [target_user_id];
    }

    console.log(`Found ${targetUsers.length} target users`);

    // Get profile IDs for users
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, user_id")
      .in("user_id", targetUsers);

    const userProfileMap = new Map(profilesData?.map(p => [p.user_id, p.id]) || []);

    // Create notifications for all target users
    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      profile_id: userProfileMap.get(userId) || null,
      title,
      message,
      type: "broadcast",
      is_read: false,
    }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("user_notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw insertError;
      }
    }

    // Log the broadcast
    await supabase
      .from("admin_broadcasts")
      .insert({
        title,
        message,
        target_type,
        target_institution_id,
        target_department_id,
        target_shop_id,
        target_user_id,
        sent_count: notifications.length,
        sent_by: user.id,
      });

    console.log(`Broadcast sent to ${notifications.length} users`);

    return new Response(
      JSON.stringify({ success: true, sent_count: notifications.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-broadcast function:", errorMessage);
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
