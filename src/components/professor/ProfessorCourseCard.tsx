"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import { submitForReview, deleteDraftCourse } from "@/lib/actions/course";
import type { CourseLanguage, CourseLevel, CourseStatus } from "@/lib/db/queries";

interface ProfessorCourseCardProps {
  course: {
    id: string;
    title: string;
    language: CourseLanguage;
    level: CourseLevel;
    price: number;
    status: CourseStatus;
    rejection_reason: string | null;
    updated_at: string;
  };
}

const STATUS_COLORS: Record<CourseStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-700",
};

export function ProfessorCourseCard({ course }: ProfessorCourseCardProps) {
  const t = useTranslations("professor.courses");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(course.updated_at));

  const canEdit = course.status === "draft" || course.status === "rejected";
  const canSubmit = course.status === "draft" || course.status === "rejected";
  const canDelete = course.status === "draft";

  async function handleSubmitForReview() {
    setIsSubmitting(true);
    await submitForReview(course.id, locale);
    setIsSubmitting(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    await deleteDraftCourse(course.id, locale);
    setIsDeleting(false);
    setShowDeleteModal(false);
  }

  return (
    <>
      <div className="glass rounded-[2rem] border border-white/60 p-6 flex flex-col gap-5 hover:shadow-xl transition-all duration-300 group">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge className={`shadow-sm ${LANGUAGE_COLORS[course.language]}`}>
            {LANGUAGE_DISPLAY_NAMES[course.language]}
          </Badge>
          <Badge className={`shadow-sm ${STATUS_COLORS[course.status]}`}>
            {t(`status.${course.status}`)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-[var(--color-primary-600)] transition-colors">
          {course.title}
        </h3>

        {/* Rejection reason */}
        {course.status === "rejected" && course.rejection_reason && (
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl px-4 py-3 shadow-inner">
            <p className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-1">{t("rejectionReason")}</p>
            <p className="text-sm font-medium text-rose-600">{course.rejection_reason}</p>
          </div>
        )}

        {/* Price + date */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 border border-slate-200/60 bg-white/50 px-3 py-1 rounded-lg shadow-sm">{course.price} Dh</span>
          <span className="text-slate-400 text-xs font-medium">
            {t("updated", { date: formattedDate })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-slate-200/50">
          {canEdit && (
            <Link href={`/professor/courses/${course.id}`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full font-bold shadow-sm hover:translate-y-[-1px]">
                {t("actions.edit")}
              </Button>
            </Link>
          )}
          {canSubmit && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 font-bold shadow-md hover:-translate-y-[1px] btn-3d"
              isLoading={isSubmitting}
              onClick={handleSubmitForReview}
            >
              {course.status === "rejected"
                ? t("actions.resubmit")
                : t("actions.submitForReview")}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              className="font-bold shadow-sm"
              onClick={() => setShowDeleteModal(true)}
            >
              {t("actions.delete")}
            </Button>
          )}
          {course.status === "pending" && (
            <p className="text-sm text-amber-600 font-bold bg-amber-50 rounded-lg py-2 w-full text-center border border-amber-200/50">
              {t("actions.underReview")}
            </p>
          )}
          {course.status === "approved" && (
            <p className="text-sm text-emerald-600 font-bold bg-emerald-50 rounded-lg py-2 w-full text-center border border-emerald-200/50">
              {t("actions.published")}
            </p>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("actions.delete")}
        closeLabel={tCommon("close")}
      >
        <p className="text-sm text-gray-600 mb-6">{t("deleteConfirm")}</p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            {t("deleteConfirmAction")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
