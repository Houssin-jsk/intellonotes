"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries";
import { calculateCommission } from "@/lib/utils/commission";
import { revalidatePath } from "next/cache";

export async function createPurchase(
  courseId: string,
  price: number,
  locale: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "unauthenticated" };
  }

  const role = await getUserRole(supabase, user.id);
  if (role !== "student") {
    return { error: "forbidden" };
  }

  const { professorCommission, platformCommission } = calculateCommission(price);

  const { error } = (await supabase.from("purchases").insert({
    student_id: user.id,
    course_id: courseId,
    amount_paid: price,
    professor_commission: professorCommission,
    platform_commission: platformCommission,
    status: "pending",
  } as never)) as { error: { code: string; message: string } | null };

  if (error) {
    // Unique constraint: already has a pending/confirmed purchase
    if (error.code === "23505") {
      return { error: "alreadyPurchased" };
    }
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/courses/${courseId}`);
  return {};
}
