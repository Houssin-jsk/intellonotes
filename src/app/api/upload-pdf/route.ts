import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { courses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "professor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const courseId = formData.get("courseId") as string | null;

  if (!file || !courseId) {
    return NextResponse.json({ error: "Missing file or courseId" }, { status: 400 });
  }

  // Validate file
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "invalidType" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "tooLarge" }, { status: 413 });
  }

  // Verify ownership and editable status
  const course = db
    .select({ id: courses.id, status: courses.status })
    .from(courses)
    .where(
      and(eq(courses.id, courseId), eq(courses.professor_id, session.user.id))
    )
    .get();

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (course.status !== "draft" && course.status !== "rejected") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Write file
  const fileName = `${courseId}.pdf`;
  const dir = path.join(process.cwd(), "storage", "course-pdfs");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Update DB
  db.update(courses)
    .set({ pdf_url: fileName, updated_at: new Date().toISOString() })
    .where(eq(courses.id, courseId))
    .run();

  return NextResponse.json({ pdfUrl: fileName });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "professor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const courseId = body?.courseId as string | undefined;
  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  // Verify ownership and editable status
  const course = db
    .select({ id: courses.id, status: courses.status, pdf_url: courses.pdf_url })
    .from(courses)
    .where(
      and(eq(courses.id, courseId), eq(courses.professor_id, session.user.id))
    )
    .get();

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (course.status !== "draft" && course.status !== "rejected") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete file if exists
  if (course.pdf_url) {
    const filePath = path.join(
      process.cwd(),
      "storage",
      "course-pdfs",
      course.pdf_url
    );
    try {
      await unlink(filePath);
    } catch {
      // File may not exist, that's OK
    }
  }

  // Clear DB
  db.update(courses)
    .set({ pdf_url: null, updated_at: new Date().toISOString() })
    .where(eq(courses.id, courseId))
    .run();

  return NextResponse.json({ ok: true });
}
