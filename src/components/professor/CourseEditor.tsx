"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PdfUploader } from "./PdfUploader";
import { AxisEditor } from "./AxisEditor";
import { submitForReview } from "@/lib/actions/course";
import type { QuizQuestion } from "@/types/quiz";

interface AxisData {
  axisNumber: number;
  axisName: string;
  lesson: { id: string; title: string; content: string | null } | null;
  quiz: { questions: QuizQuestion[] } | null;
}

interface CourseEditorProps {
  course: {
    id: string;
    title: string;
    status: string;
    pdf_url: string | null;
  };
  initialAxisData: AxisData[];
}

export function CourseEditor({ course, initialAxisData }: CourseEditorProps) {
  const t = useTranslations("professor.courseEditor");
  const locale = useLocale();
  const router = useRouter();

  const [expandedAxis, setExpandedAxis] = useState<number | null>(1);
  const [axisFilledMap, setAxisFilledMap] = useState<Record<number, boolean>>(
    () => {
      const map: Record<number, boolean> = {};
      for (const axis of initialAxisData) {
        const hasLesson =
          axis.lesson !== null &&
          (axis.lesson.title?.trim().length ?? 0) >= 3 &&
          (axis.lesson.content?.trim().length ?? 0) >= 10;
        const hasQuiz =
          axis.quiz !== null && (axis.quiz.questions?.length ?? 0) > 0;
        map[axis.axisNumber] = hasLesson && hasQuiz;
      }
      return map;
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allFilled = [1, 2, 3, 4, 5].every((n) => axisFilledMap[n]);

  function handleAxisSaveSuccess(axisNumber: number) {
    setAxisFilledMap((prev) => ({ ...prev, [axisNumber]: true }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);

    const result = await submitForReview(course.id, locale);

    if (result.error) {
      if (result.error === "incompleteContent") {
        setSubmitError(t("incompleteContent"));
      } else {
        setSubmitError(t("errors.generic"));
      }
      setIsSubmitting(false);
      return;
    }

    router.refresh();
    router.push("/professor/courses");
  }

  return (
    <div className="space-y-6">
      {/* PDF upload */}
      <PdfUploader
        courseId={course.id}
        currentPdfUrl={course.pdf_url}
        locale={locale}
      />

      {/* 5 axis editors */}
      <div className="space-y-4">
        {initialAxisData.map((axis) => (
          <AxisEditor
            key={axis.axisNumber}
            courseId={course.id}
            axisNumber={axis.axisNumber}
            axisName={axis.axisName}
            initialLesson={axis.lesson}
            initialQuiz={axis.quiz}
            isExpanded={expandedAxis === axis.axisNumber}
            onToggle={() =>
              setExpandedAxis(
                expandedAxis === axis.axisNumber ? null : axis.axisNumber
              )
            }
            onSaveSuccess={() => handleAxisSaveSuccess(axis.axisNumber)}
          />
        ))}
      </div>

      {/* Submit for review */}
      <div className="pt-4 border-t border-gray-200">
        {!allFilled && (
          <p className="text-sm text-amber-600 mb-3">{t("submitDisabledHint")}</p>
        )}
        {submitError && (
          <p className="text-sm text-red-600 mb-3">{submitError}</p>
        )}
        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!allFilled}
          size="lg"
          className="w-full"
        >
          {t("submitForReview")}
        </Button>
      </div>
    </div>
  );
}
