import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { courses, purchases } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const pdfRelativePath = pathSegments.join("/");

  // Find the course that owns this PDF
  const course = db
    .select({ id: courses.id, professor_id: courses.professor_id })
    .from(courses)
    .where(eq(courses.pdf_url, pdfRelativePath))
    .get();

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  // Admins can always access PDFs
  if (role !== "admin") {
    // Professors can access their own course PDFs
    if (role === "professor" && course.professor_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Students need a confirmed purchase
    if (role === "student") {
      const purchase = db
        .select({ status: purchases.status })
        .from(purchases)
        .where(
          and(
            eq(purchases.student_id, userId),
            eq(purchases.course_id, course.id),
            eq(purchases.status, "confirmed")
          )
        )
        .get();

      if (!purchase) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  // Resolve file path relative to project root
  const filePath = path.join(process.cwd(), "storage", "course-pdfs", pdfRelativePath);

  try {
    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
