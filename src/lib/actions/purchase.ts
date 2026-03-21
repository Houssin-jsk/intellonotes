"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { purchases } from "@/lib/db/schema";
import { getCoursePrice } from "@/lib/db/queries";
import { calculateCommission } from "@/lib/utils/commission";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createPurchase(
  courseId: string,
  price: number,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };

  if (session.user.role !== "student") return { error: "forbidden" };

  // Re-fetch price from DB — never trust client-provided price
  const courseData = getCoursePrice(courseId);
  if (!courseData) return { error: "courseNotFound" };

  // Silence unused parameter lint warning
  void price;

  const { professorCommission, platformCommission } = calculateCommission(
    courseData.price
  );

  try {
    db.insert(purchases)
      .values({
        id: uuidv4(),
        student_id: session.user.id,
        course_id: courseId,
        amount_paid: courseData.price,
        professor_commission: professorCommission,
        platform_commission: platformCommission,
        status: "pending",
      })
      .run();
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (
      err?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      err?.message?.includes("UNIQUE constraint failed")
    ) {
      return { error: "alreadyPurchased" };
    }
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/courses/${courseId}`);
  return {};
}
