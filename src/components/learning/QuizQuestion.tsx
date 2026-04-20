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
        "neumorph rounded-[2rem] p-6 sm:p-8 space-y-6 transition-all duration-300",
        isGraded ? feedbackColor : "bg-white/60"
      )}
    >
      <p className="font-extrabold text-slate-900 text-lg sm:text-xl leading-relaxed">
        <span className="text-[var(--color-primary-600)] me-3 opacity-60">
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
        <div className="mt-4 p-4 rounded-xl bg-red-100/50 border border-red-200 text-red-800 font-bold flex items-center gap-2">
          <span>✓</span>
          <span>
            {question.type === "true_false"
              ? correctAnswer === "true"
                ? t("trueFalse.true")
                : t("trueFalse.false")
              : correctAnswer}
          </span>
        </div>
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
    <div className="space-y-3">
      {question.options.map((option, i) => {
        const isSelected = answer === i;
        const isCorrect = i === question.correct_index;
        let optStyle = "glass border-slate-200/50 text-slate-700 hover:-translate-y-0.5 hover:shadow-md";
        
        if (isGraded) {
          if (isCorrect) optStyle = "bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-transparent shadow-lg scale-[1.02] -translate-y-1";
          else if (isSelected && !isCorrect)
            optStyle = "bg-gradient-to-r from-red-400 to-rose-400 text-white border-transparent shadow-md";
          else optStyle = "glass border-slate-200/30 text-slate-500 opacity-60 pointer-events-none";
        } else if (isSelected) {
          optStyle = "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white border-transparent shadow-[0_8px_20px_rgba(124,58,237,0.3)] scale-[1.02] -translate-y-1";
        }

        return (
          <button
            key={i}
            type="button"
            disabled={isGraded}
            onClick={() => onChange(i)}
            className={cn(
              "w-full text-start px-6 py-4 rounded-xl border transition-all duration-300 font-medium text-base",
              optStyle,
            )}
          >
            <span className="font-extrabold me-3 opacity-70">
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
    <div className="flex gap-4">
      {([true, false] as const).map((val) => {
        const isSelected = answer === val;
        let btnStyle = "glass border-slate-200/50 text-slate-700 hover:-translate-y-0.5 hover:shadow-md";
        
        if (isGraded && isSelected) {
          btnStyle = feedback
            ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg"
            : "bg-gradient-to-r from-red-400 to-rose-400 text-white shadow-md";
        } else if (!isGraded && isSelected) {
          btnStyle = "bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white shadow-[0_8px_20px_rgba(124,58,237,0.3)] scale-[1.02] -translate-y-1";
        } else if (isGraded && !isSelected) {
            btnStyle = "glass border-slate-200/30 text-slate-500 opacity-60 pointer-events-none";
        }

        return (
          <button
            key={String(val)}
            type="button"
            disabled={isGraded}
            onClick={() => onChange(val)}
            className={cn(
              "flex-1 py-4 rounded-xl border transition-all duration-300 font-extrabold text-base uppercase tracking-widest",
              btnStyle
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
        "w-full px-6 py-4 rounded-2xl border text-base font-bold outline-none transition-all duration-300 shadow-inner",
        isGraded
          ? feedback
            ? "border-emerald-400 bg-emerald-50 text-emerald-900"
            : "border-red-400 bg-red-50 text-red-900"
          : "border-slate-200 bg-slate-50 focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-100)]"
      )}
    />
  );
}
