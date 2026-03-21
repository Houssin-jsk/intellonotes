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
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge className={LANGUAGE_COLORS[course.language]}>
            {LANGUAGE_DISPLAY_NAMES[course.language]}
          </Badge>
          <Badge className={STATUS_COLORS[course.status]}>
            {t(`status.${course.status}`)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
          {course.title}
        </h3>

        {/* Price + date */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-900">{course.price} Dh</span>
          <span className="text-gray-400 text-xs">
            {t("updated", { date: formattedDate })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {canEdit && (
            <Link href={`/professor/courses/${course.id}`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                {t("actions.edit")}
              </Button>
            </Link>
          )}
          {canSubmit && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
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
              onClick={() => setShowDeleteModal(true)}
            >
              {t("actions.delete")}
            </Button>
          )}
          {course.status === "pending" && (
            <p className="text-sm text-amber-600 font-medium w-full text-center">
              {t("actions.underReview")}
            </p>
          )}
          {course.status === "approved" && (
            <p className="text-sm text-green-600 font-medium w-full text-center">
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
