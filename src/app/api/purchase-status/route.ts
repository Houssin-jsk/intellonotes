import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPurchaseById } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const purchase = getPurchaseById(id);
  if (!purchase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: purchase.status });
}
