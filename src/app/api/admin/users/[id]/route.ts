import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appUser } = await supabase.from("app_users").select("*").eq("id", user.id).single();
  if (!appUser || appUser.role !== "owner") return null;
  return appUser;
}

// بيتأكد إن العملية (تعطيل/تنزيل درجة/حذف) مش هتسيب النظام من غير
// أي أونر نشط، عشان محدش يقفل نفسه وكل الأونرز بره لوحة التحكم بالغلط
async function wouldRemoveLastOwner(
  admin: ReturnType<typeof createAdminClient>,
  targetId: string
): Promise<boolean> {
  const { data: target } = await admin.from("app_users").select("role").eq("id", targetId).single();
  if (target?.role !== "owner") return false;

  const { count } = await admin
    .from("app_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner")
    .eq("active", true)
    .neq("id", targetId);

  return !count || count < 1;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const admin = createAdminClient();

  const willDeactivate = body.active === false;
  const willDemote = body.role === "worker";

  if (willDeactivate || willDemote) {
    if (await wouldRemoveLastOwner(admin, id)) {
      return NextResponse.json(
        { error: "لازم يفضل أونر واحد نشط على الأقل في النظام" },
        { status: 400 }
      );
    }
  }

  if (body.password) {
    const { error } = await admin.auth.admin.updateUserById(id, { password: body.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (typeof body.active === "boolean" || body.role) {
    const update: Record<string, unknown> = {};
    if (typeof body.active === "boolean") update.active = body.active;
    if (body.role) update.role = body.role;
    await admin.from("app_users").update(update).eq("id", id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const admin = createAdminClient();

  if (await wouldRemoveLastOwner(admin, id)) {
    return NextResponse.json(
      { error: "لازم يفضل أونر واحد على الأقل في النظام، متقدرش تحذف ده" },
      { status: 400 }
    );
  }

  await admin.auth.admin.deleteUser(id);
  await admin.from("app_users").delete().eq("id", id);

  return NextResponse.json({ success: true });
}