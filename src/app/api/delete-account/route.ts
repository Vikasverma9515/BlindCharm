import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// For admin delete
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // get current user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // optional: delete from your "users" table
    await supabase.from("users").delete().eq("id", user.id)

    // delete from auth.users (requires service role)
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
      {
        method: "DELETE",
        headers: {
          apiKey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )

    if (!resp.ok) {
      const err = await resp.json()
      return NextResponse.json({ error: err }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
