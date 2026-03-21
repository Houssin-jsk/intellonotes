"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updatePurchaseStatus } from "@/lib/db/queries";

export async function confirmPurchase(
  purchaseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  try {
    updatePurchaseStatus(purchaseId, "confirmed");
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/payments`);
  return {};
}

export async function rejectPurchase(
  purchaseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "admin") return { error: "Forbidden" };

  try {
    updatePurchaseStatus(purchaseId, "rejected");
  } catch {
    return { error: "updateFailed" };
  }

  revalidatePath(`/${locale}/admin/payments`);
  return {};
}
