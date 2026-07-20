import { createClient } from '@supabase/supabase-js';

interface CreateUserPayload {
  email: string;
  password: string;
  displayName: string;
  roleId: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: CreateUserPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { email, password, displayName, roleId } = payload;
  if (!email || !password || !displayName || !roleId) {
    return jsonResponse(
      { error: "email, password, displayName, and roleId are all required" },
      400,
    );
  }
  if (password.length < 8) {
    return jsonResponse({ error: "Password must be at least 8 characters." }, 400);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user: callerUser },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !callerUser) {
    return jsonResponse({ error: "Invalid session" }, 401);
  }

  const { data: isSuperAdmin, error: superAdminError } = await callerClient.rpc(
    "current_user_is_super_admin",
  );

  if (superAdminError || !isSuperAdmin) {
    return jsonResponse({ error: "Only super admins can create users" }, 403);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (createError || !created.user) {
    return jsonResponse(
      { error: createError?.message ?? "Failed to create user" },
      400,
    );
  }

  const { error: roleError } = await adminClient
    .from("profiles")
    .update({ role_id: roleId })
    .eq("id", created.user.id);

  if (roleError) {
    return jsonResponse({ error: roleError.message }, 500);
  }

  return jsonResponse({ id: created.user.id }, 200);
});