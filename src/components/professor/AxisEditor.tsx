"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AxisStatusBadge } from "./AxisStatusBadge";
import { QuizQuestionBuilder } from "./QuizQuestionBuilder";
import { saveAxisContent } from "@/lib/actions/course-content";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { QuizQuestion } from "@/types/quiz";

interface AxisEditorProps {
  courseId: string;
  axisNumber: number;
  axisName: string;
  initialLesson: { id: string; title: string; content: string | null } | null;
  initialQuiz: { questions: QuizQuestion[] } | null;
  isExpanded: boolean;
  onToggle: () => void;
  onSaveSuccess: () => void;
}

type QuestionType = "mcq" | "true_false" | "fill_blank";

function createEmptyQuestion(type: QuestionType): QuizQuestion {
  const id = crypto.randomUUID();
  switch (type) {
    case "mcq":
      return { id, type: "mcq", text: "", options: ["", ""], correct_index: 0 };
    case "true_false":
      return { id, type: "true_false", text: "", correct_answer: true };
    case "fill_blank":
      return {
        id,
        type: "fill_blank",
        text: "",
        correct_answers: [""],
        case_sensitive: false,
      };
  }
}

export function AxisEditor({
  courseId,
  axisNumber,
  axisName,
  initialLesson,
  initialQuiz,
  isExpanded,
  onToggle,
  onSaveSuccess,
}: AxisEditorProps) {
  const t = useTranslations("professor.courseEditor");
  const locale = useLocale();

  const [lessonTitle, setLessonTitle] = useState(initialLesson?.title ?? "");
  const [lessonContent, setLessonContent] = useState(initialLesson?.content ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    (initialQuiz?.questions as QuizQuestion[]) ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const isFilled =
    lessonTitle.trim().length >= 3 &&
    lessonContent.trim().length >= 10 &&
    questions.length > 0;

  function updateQuestion(index: number, updated: QuizQuestion) {
    const next = [...questions];
    next[index] = updated;
    setQuestions(next);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function addQuestion(type: QuestionType) {
    setQuestions([...questions, createEmptyQuestion(type)]);
    setShowTypeMenu(false);
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);

    if (!lessonTitle.trim() || lessonTitle.trim().length < 3) {
      setError(t("errors.lessonTitleTooShort"));
      return;
    }
    if (!lessonContent.trim() || lessonContent.trim().length < 10) {
      setError(t("errors.lessonContentTooShort"));
      return;
    }
    if (questions.length === 0) {
      setError(t("errors.quizRequired"));
      return;
    }

    setIsSaving(true);

    const result = await saveAxisContent(
      {
        courseId,
        axisNumber,
        lessonTitle: lessonTitle.trim(),
        lessonContent: lessonContent.trim(),
        questions,
      },
      locale
    );

    setIsSaving(false);

    if (result.error) {
      setError(t("errors.generic"));
      return;
    }

    setSuccess(true);
    onSaveSuccess();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            {axisName}
          </span>
          <AxisStatusBadge status={isFilled ? "filled" : "empty"} />
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-5 space-y-6">
          {/* Lesson fields */}
          <Input
            id={`lesson-title-${axisNumber}`}
            label={t("lessonTitle")}
            placeholder={t("lessonTitlePlaceholder")}
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
          />

          <Textarea
            id={`lesson-content-${axisNumber}`}
            label={t("lessonContent")}
            placeholder={t("lessonContentPlaceholder")}
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            rows={8}
          />

          {/* Quiz section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {t("quizSection")} — {t("questionCount", { count: questions.length })}
              </h4>
            </div>

            {questions.map((q, i) => (
              <QuizQuestionBuilder
                key={q.id}
                question={q}
                index={i}
                onChange={(updated) => updateQuestion(i, updated)}
                onRemove={() => removeQuestion(i)}
              />
            ))}

            {/* Add question with type selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium"
              >
                <Plus size={16} />
                {t("addQuestion")}
              </button>

              {showTypeMenu && (
                <div className="absolute top-8 start-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
                  {(["mcq", "true_false", "fill_blank"] as QuestionType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addQuestion(type)}
                        className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t(`questionTypes.${type}`)}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error / success */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">
              {t("saveSuccess", { number: axisNumber })}
            </p>
          )}

          {/* Save button */}
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="w-full"
          >
            {t("saveAxis", { number: axisNumber })}
          </Button>
        </div>
      )}
    </div>
  );
}
