"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { QuizQuestionComponent } from "./QuizQuestion";
import { gradeQuiz } from "@/lib/utils/quiz-grader";
import { cn } from "@/lib/utils/cn";
import type { QuizQuestion } from "@/types/quiz";
import type { GradingResult, StudentAnswer } from "@/lib/utils/quiz-grader";

interface QuizData {
  id: string;
  axis_number: number;
  questions: QuizQuestion[];
  passing_score: number;
}

interface QuizEngineProps {
  quiz: QuizData;
  axisNumber: number;
  /** Callback when student finishes the quiz (pass OR fail). */
  onComplete: (result: GradingResult, passed: boolean) => Promise<void>;
}

export function QuizEngine({ quiz, axisNumber, onComplete }: QuizEngineProps) {
  const t = useTranslations("learning.quiz");

  // answers keyed by question id
  const [answers, setAnswers] = useState<
    Record<string, number | boolean | string>
  >({});
  const [result, setResult] = useState<GradingResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const questions = quiz.questions;
  // Axes 1-4 always pass (passing_score = 0); axis 5 uses the DB value
  const effectivePassingScore = axisNumber === 5 ? quiz.passing_score : 0;

  function setAnswer(questionId: string, value: number | boolean | string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationError(null);
  }

  async function handleSubmit() {
    // Require all questions answered
    const unanswered = questions.filter(
      (q) => answers[q.id] === undefined || answers[q.id] === ""
    );
    if (unanswered.length > 0) {
      setValidationError(t("allAnswersRequired"));
      return;
    }

    const studentAnswers: StudentAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id],
    }));

    const graded = gradeQuiz(questions, studentAnswers, effectivePassingScore);
    setResult(graded);

    const passed = graded.passed;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onComplete(graded, passed);
    } catch {
      setSaveError(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setSaveError(null);
    setValidationError(null);
  }

  const feedbackByQuestion = result
    ? Object.fromEntries(result.details.map((d) => [d.questionId, d.correct]))
    : {};
  const correctAnswerByQuestion = result
    ? Object.fromEntries(
        result.details.map((d) => [d.questionId, d.correctAnswer])
      )
    : {};

  return (
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-extrabold text-slate-900 border-b border-white pb-4 mb-6 relative">
        {t("title", { number: axisNumber })}
        <div className="absolute -bottom-[1px] left-0 w-24 h-[2px] bg-[var(--color-primary-500)]" />
      </h2>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-3 relative group">
            <p className="text-xs font-bold text-[var(--color-primary-500)] uppercase tracking-widest absolute -top-3 left-6 bg-[#f8fafc] px-3 py-1 rounded-full border border-white z-10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Q {i + 1} / {questions.length}
            </p>
            <QuizQuestionComponent
              question={q}
              index={i}
              answer={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
              feedback={result ? feedbackByQuestion[q.id] ?? false : null}
              correctAnswer={correctAnswerByQuestion[q.id]}
            />
          </div>
        ))}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-bold shadow-sm">
          {validationError}
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div
          className={cn(
            "rounded-3xl p-8 border shadow-lg relative overflow-hidden transition-all duration-300",
            result.passed
              ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
              : "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200"
          )}
        >
          <div className={cn(
            "absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-50 pointer-events-none",
            result.passed ? "bg-emerald-400" : "bg-rose-400"
          )} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
                <p className={cn(
                  "font-extrabold text-2xl mb-1",
                  result.passed ? "text-emerald-800" : "text-rose-800"
                )}>
                  {result.passed ? t("passed") : t("failed")}
                </p>
                <p className={cn(
                  "font-medium",
                  result.passed ? "text-emerald-600" : "text-rose-600"
                )}>
                  {t("score", { score: result.correct, total: result.total })}{" "}
                  &mdash; {t("percentage", { percentage: result.score })}
                </p>
             </div>
             {result.passed ? (
               <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  🎉
               </div>
             ) : (
                <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center text-3xl shadow-inner shrink-0 rotate-180">
                  💬
               </div>
             )}
          </div>
        </div>
      )}

      {saveError && (
        <p className="text-sm text-red-600 font-bold">{saveError}</p>
      )}

      {/* Actions */}
      <div className="pt-4 flex justify-end">
        {!result ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            isLoading={isSaving}
            className="w-full sm:w-auto px-12 shadow-xl hover:-translate-y-1 hover:shadow-2xl btn-3d"
          >
            {t("submit")}
          </Button>
        ) : result.passed ? (
          axisNumber < 5 ? (
            <p className="text-sm bg-emerald-100 text-emerald-700 font-bold px-6 py-3 rounded-xl shadow-sm border border-emerald-200">
              ✓ {t("nextAxis")}
            </p>
          ) : (
            <p className="text-sm bg-emerald-100 text-emerald-700 font-bold px-6 py-3 rounded-xl shadow-sm border border-emerald-200">
              🎉 {t("courseComplete")}
            </p>
          )
        ) : (
          <Button variant="secondary" onClick={handleRetry} className="w-full sm:w-auto px-12 shadow-md hover:-translate-y-0.5">
            {t("retry")}
          </Button>
        )}
      </div>
    </section>
  );
}
