import { withSupabase } from '@supabase/server';

interface CreateUserPayload {
  email: string;
  password: string;
  displayName: string;
  roleId: string;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    let payload: CreateUserPayload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, password, displayName, roleId } = payload;
    if (!email || !password || !displayName || !roleId) {
      return Response.json(
        { error: "email, password, displayName, and roleId are all required" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const { data: isSuperAdmin, error: superAdminError } =
      await ctx.supabase.rpc("current_user_is_super_admin");

    if (superAdminError || !isSuperAdmin) {
      return Response.json(
        { error: "Only super admins can create users" },
        { status: 403 },
      );
    }

    const { data: created, error: createError } =
      await ctx.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      });

    if (createError || !created.user) {
      return Response.json(
        { error: createError?.message ?? "Failed to create user" },
        { status: 400 },
      );
    }

    const { error: roleError } = await ctx.supabaseAdmin
      .from("profiles")
      .update({ role_id: roleId }) //TODO: figure out why theere is a data type mismatch despite the types being explicitly stated correctly
      .eq("id", created.user.id);

    if (roleError) {
      return Response.json({ error: roleError.message }, { status: 500 });
    }

    return Response.json({ id: created.user.id }, { status: 200 });
  }),
};
