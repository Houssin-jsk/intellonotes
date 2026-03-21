"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { QuizQuestionComponent } from "./QuizQuestion";
import { gradeQuiz } from "@/lib/utils/quiz-grader";
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
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {t("title", { number: axisNumber })}
      </h2>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuizQuestionComponent
            key={q.id}
            question={q}
            index={i}
            answer={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
            feedback={result ? feedbackByQuestion[q.id] ?? false : null}
            correctAnswer={correctAnswerByQuestion[q.id]}
          />
        ))}
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-xl p-4 border-2 ${
            result.passed
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <p className="font-semibold">
            {result.passed ? t("passed") : t("failed")}
          </p>
          <p className="text-sm mt-1">
            {t("score", { score: result.correct, total: result.total })}{" "}
            &mdash; {t("percentage", { percentage: result.score })}
          </p>
        </div>
      )}

      {saveError && (
        <p className="text-sm text-red-600">{saveError}</p>
      )}

      {/* Actions */}
      {!result ? (
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          isLoading={isSaving}
          className="w-full sm:w-auto"
        >
          {t("submit")}
        </Button>
      ) : result.passed ? (
        axisNumber < 5 ? (
          <p className="text-sm text-green-700 font-medium">
            ✓ {t("nextAxis")}
          </p>
        ) : (
          <p className="text-sm text-green-700 font-medium">
            🎉 {t("courseComplete")}
          </p>
        )
      ) : (
        <Button variant="secondary" onClick={handleRetry}>
          {t("retry")}
        </Button>
      )}
    </section>
  );
}
