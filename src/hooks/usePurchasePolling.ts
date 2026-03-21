"use client";

import { useEffect, useRef } from "react";

type PurchaseStatus = "pending" | "confirmed" | "rejected";

/**
 * Polls /api/purchase-status every 5 seconds while the purchase is pending.
 * Fires onStatusChange when the status changes to confirmed or rejected.
 * Stops polling automatically when status is no longer pending.
 *
 * Pass purchaseId=null to disable polling (e.g. when status isn't pending).
 */
export function usePurchasePolling(
  purchaseId: string | null,
  onStatusChange: (status: PurchaseStatus) => void
): void {
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!purchaseId) return;

    const POLL_INTERVAL_MS = 5000;

    const poll = async () => {
      try {
        const res = await fetch(`/api/purchase-status?id=${purchaseId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { status?: PurchaseStatus };
        if (data.status && data.status !== "pending") {
          onStatusChangeRef.current(data.status);
        }
      } catch {
        // Network error — silently ignore, retry on next interval
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [purchaseId]);
}
