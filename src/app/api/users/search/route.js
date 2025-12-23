import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getRole } from "@/server/user/user.server";

export async function GET(request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin permission
    const roleData = await getRole(session.user.id);
    if (!roleData || roleData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get search query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by name or email
    const users = await db("user")
      .select("id", "name", "email", "username")
      .where((builder) => {
        builder
          .where("name", "like", `%${query}%`)
          .orWhere("email", "like", `%${query}%`)
          .orWhere("username", "like", `%${query}%`);
      })
      .limit(10);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
