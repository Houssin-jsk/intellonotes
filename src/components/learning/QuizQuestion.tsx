"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type {
  MCQQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  QuizQuestion,
} from "@/types/quiz";

interface QuizQuestionProps {
  question: QuizQuestion;
  index: number;
  answer: number | boolean | string | undefined;
  onChange: (value: number | boolean | string) => void;
  feedback?: boolean | null; // null = not graded, true = correct, false = wrong
  correctAnswer?: string;
}

export function QuizQuestionComponent({
  question,
  index,
  answer,
  onChange,
  feedback,
  correctAnswer,
}: QuizQuestionProps) {
  const t = useTranslations("learning.quiz");
  const isGraded = feedback !== null && feedback !== undefined;

  const feedbackColor = isGraded
    ? feedback
      ? "border-green-400 bg-green-50"
      : "border-red-400 bg-red-50"
    : "";

  // Render question text, replacing {{BLANK}} with an indicator
  const questionText =
    question.type === "fill_blank"
      ? question.text.replace("{{BLANK}}", "___")
      : question.text;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4 space-y-3 transition-colors",
        isGraded ? feedbackColor : "border-gray-200"
      )}
    >
      <p className="font-medium text-gray-900 text-sm leading-relaxed">
        <span className="text-[var(--color-primary-600)] me-2">
          {index + 1}.
        </span>
        {questionText}
      </p>

      {question.type === "mcq" && (
        <MCQOptions
          question={question}
          answer={answer as number | undefined}
          onChange={(v) => onChange(v)}
          feedback={feedback}
          isGraded={isGraded}
        />
      )}

      {question.type === "true_false" && (
        <TrueFalseOptions
          answer={answer as boolean | undefined}
          onChange={(v) => onChange(v)}
          feedback={feedback}
          isGraded={isGraded}
          t={t}
        />
      )}

      {question.type === "fill_blank" && (
        <FillBlankInput
          answer={answer as string | undefined}
          onChange={(v) => onChange(v)}
          feedback={feedback}
          isGraded={isGraded}
          placeholder={t("fillBlank")}
        />
      )}

      {isGraded && !feedback && correctAnswer && (
        <p className="text-xs text-red-700 mt-1">
          ✓{" "}
          {question.type === "true_false"
            ? correctAnswer === "true"
              ? t("trueFalse.true")
              : t("trueFalse.false")
            : correctAnswer}
        </p>
      )}
    </div>
  );
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function MCQOptions({
  question,
  answer,
  onChange,
  feedback,
  isGraded,
}: {
  question: MCQQuestion;
  answer: number | undefined;
  onChange: (v: number) => void;
  feedback?: boolean | null;
  isGraded: boolean;
}) {
  return (
    <div className="space-y-2">
      {question.options.map((option, i) => {
        const isSelected = answer === i;
        const isCorrect = i === question.correct_index;
        let optStyle = "border-gray-200 text-gray-700";
        if (isGraded) {
          if (isCorrect) optStyle = "border-green-400 bg-green-50 text-green-800";
          else if (isSelected && !isCorrect)
            optStyle = "border-red-400 bg-red-50 text-red-800";
        } else if (isSelected) {
          optStyle = "border-[var(--color-primary-600)] bg-purple-50 text-[var(--color-primary-600)]";
        }

        return (
          <button
            key={i}
            type="button"
            disabled={isGraded}
            onClick={() => onChange(i)}
            className={cn(
              "w-full text-start px-3 py-2 rounded-lg border-2 text-sm transition-colors",
              optStyle,
              !isGraded && "hover:border-gray-400"
            )}
          >
            <span className="font-medium me-2">
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TrueFalseOptions({
  answer,
  onChange,
  feedback,
  isGraded,
  t,
}: {
  answer: boolean | undefined;
  onChange: (v: boolean) => void;
  feedback?: boolean | null;
  isGraded: boolean;
  t: ReturnType<typeof useTranslations<"learning.quiz">>;
}) {
  return (
    <div className="flex gap-3">
      {([true, false] as const).map((val) => {
        const isSelected = answer === val;
        let btnStyle = "border-gray-200 text-gray-700";
        if (isGraded && isSelected) {
          btnStyle = feedback
            ? "border-green-400 bg-green-50 text-green-800"
            : "border-red-400 bg-red-50 text-red-800";
        } else if (!isGraded && isSelected) {
          btnStyle =
            "border-[var(--color-primary-600)] bg-purple-50 text-[var(--color-primary-600)]";
        }

        return (
          <button
            key={String(val)}
            type="button"
            disabled={isGraded}
            onClick={() => onChange(val)}
            className={cn(
              "flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors",
              btnStyle,
              !isGraded && "hover:border-gray-400"
            )}
          >
            {val ? t("trueFalse.true") : t("trueFalse.false")}
          </button>
        );
      })}
    </div>
  );
}

function FillBlankInput({
  answer,
  onChange,
  feedback,
  isGraded,
  placeholder,
}: {
  answer: string | undefined;
  onChange: (v: string) => void;
  feedback?: boolean | null;
  isGraded: boolean;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={answer ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={isGraded}
      placeholder={placeholder}
      className={cn(
        "w-full px-3 py-2 rounded-lg border-2 text-sm outline-none transition-colors",
        isGraded
          ? feedback
            ? "border-green-400 bg-green-50"
            : "border-red-400 bg-red-50"
          : "border-gray-200 focus:border-[var(--color-primary-600)]"
      )}
    />
  );
}
