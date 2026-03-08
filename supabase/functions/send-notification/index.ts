import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ADMIN_EMAIL = "nabijoy.mail@gmail.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  type: "signup" | "book_demand" | "order" | "new_listing" | "book_sold";
  title: string;
  message: string;
  reference_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, title, message, reference_id }: NotificationRequest = await req.json();

    console.log("Received notification request:", { type, title, message, reference_id });

    // Store notification in database
    const { data: notification, error: dbError } = await supabase
      .from("admin_notifications")
      .insert({
        type,
        title,
        message,
        reference_id: reference_id || null,
        is_read: false,
        email_sent: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    console.log("Notification stored in database:", notification.id);

    // Send email notification
    try {
      const emailSubject = `[Boi Rajjo] ${title}`;
      const emailHtml = `
        <h2>${title}</h2>
        <p>${message}</p>
        <p><small>Type: ${type}</small></p>
        <p><small>Time: ${new Date().toLocaleString()}</small></p>
        <hr>
        <p><small>This is an automated notification from Boi Rajjo.</small></p>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Boi Rajjo <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      const emailData = await emailResponse.json();
      console.log("Email sent successfully:", emailData);

      await supabase
        .from("admin_notifications")
        .update({ email_sent: true })
        .eq("id", notification.id);

    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    return new Response(
      JSON.stringify({ success: true, notification_id: notification.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-notification function:", errorMessage);
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
