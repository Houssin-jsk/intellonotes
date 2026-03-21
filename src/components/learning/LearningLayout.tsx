"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Link } from "@i18n/navigation";
import { useLocale } from "next-intl";
import { ProgressSidebar } from "./ProgressSidebar";
import { QuizEngine } from "./QuizEngine";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import { saveQuizResult } from "@/lib/actions/progress";
import { EXECUTABLE_LANGUAGES } from "@/lib/constants";
import type { CourseLanguage } from "@/types";
import type { QuizQuestion } from "@/types/quiz";
import type { GradingResult } from "@/lib/utils/quiz-grader";
import { Spinner } from "@/components/ui/Spinner";

// Heavy components — dynamically imported with ssr: false
const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
      <Spinner size="lg" className="text-gray-400" />
    </div>
  ),
});

const CodePlayground = dynamic(() => import("./CodePlayground"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center">
      <Spinner size="lg" className="text-gray-400" />
    </div>
  ),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type LessonData = {
  id: string;
  axis_number: number;
  title: string;
  content: string | null;
  display_order: number;
};

export type QuizData = {
  id: string;
  axis_number: number;
  questions: QuizQuestion[];
  passing_score: number;
};

type QuizScore = { score: number; total: number; passed: boolean };

export interface LearningLayoutProps {
  courseId: string;
  courseTitle: string;
  language: CourseLanguage;
  lessons: LessonData[];
  quizzesByAxis: Record<number, QuizData>;
  initialCurrentAxis: number;
  initialQuizScores: Record<string, QuizScore>;
  initialIsCompleted: boolean;
  pdfUrl: string | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LearningLayout({
  courseId,
  courseTitle,
  language,
  lessons,
  quizzesByAxis,
  initialCurrentAxis,
  initialQuizScores,
  initialIsCompleted,
  pdfUrl,
}: LearningLayoutProps) {
  const t = useTranslations("learning");
  const tCourse = useTranslations("course");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Local state — updated optimistically after quiz completion
  const [currentAxis, setCurrentAxis] = useState(initialCurrentAxis);
  const [selectedAxis, setSelectedAxis] = useState(initialCurrentAxis);
  const [quizScores, setQuizScores] = useState(initialQuizScores);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  // Track which axes have had their quiz PASSED in this session
  const [completedInSession, setCompletedInSession] = useState<Set<number>>(new Set());
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Scroll to top whenever the selected axis changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedAxis]);

  const axisLessons = lessons.filter((l) => l.axis_number === selectedAxis);
  const axisQuiz = quizzesByAxis[selectedAxis] ?? null;
  const quizAlreadyPassed = !!quizScores[selectedAxis]?.passed;
  const showQuiz = axisQuiz && !quizAlreadyPassed && !completedInSession.has(selectedAxis);
  const canRunCode = EXECUTABLE_LANGUAGES.includes(
    language as (typeof EXECUTABLE_LANGUAGES)[number]
  );

  // Axis status list for the sidebar
  const axisList = Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return {
      axisNumber: n,
      lessonCount: lessons.filter((l) => l.axis_number === n).length,
      isCompleted: !!quizScores[n]?.passed,
      isCurrent: n === selectedAxis,
      isUnlocked: n <= currentAxis,
    };
  });

  const handleSelectAxis = useCallback((axis: number) => {
    setSelectedAxis(axis);
  }, []);

  const handleQuizComplete = useCallback(
    async (result: GradingResult, passed: boolean) => {
      // Optimistic local update first
      setQuizScores((prev) => ({
        ...prev,
        [selectedAxis]: {
          score: result.correct,
          total: result.total,
          passed,
        },
      }));

      if (passed) {
        // Only mark completed in session on pass — failed quizzes must remain retryable
        setCompletedInSession((prev) => new Set(prev).add(selectedAxis));
        const nextAxis = Math.min(5, selectedAxis + 1);
        setCurrentAxis((prev) => Math.max(prev, nextAxis));
        if (selectedAxis === 5) setIsCompleted(true);
        // Auto-advance to next axis after a short delay; cancel any previous timer
        if (selectedAxis < 5) {
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = setTimeout(() => setSelectedAxis(nextAxis), 1200);
        }
      }

      // Persist to DB (fire and forget — optimistic update already applied)
      await saveQuizResult(
        courseId,
        selectedAxis,
        result.correct,
        result.total,
        passed,
        locale
      );
    },
    [courseId, selectedAxis, locale]
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-72 shrink-0 border-e border-gray-200">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
          <ProgressSidebar axes={axisList} onSelectAxis={handleSelectAxis} />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-16 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-gray-500 hover:text-gray-700 shrink-0"
          >
            {locale === 'ar' ? '\u2192' : '\u2190'}
          </Link>
          <h1 className="font-semibold text-gray-900 text-sm truncate">
            {courseTitle}
          </h1>
          {isCompleted && (
            <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {t("completed")}
            </span>
          )}
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-8">
          {/* Mobile axis strip */}
          <div className="lg:hidden">
            <ProgressSidebar
              axes={axisList}
              onSelectAxis={handleSelectAxis}
              mobile
            />
          </div>

          {/* Axis heading */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-primary-600)] uppercase tracking-wide mb-1">
              {tCourse("axis", { number: selectedAxis })}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {tCourse(`axisNames.${selectedAxis}` as Parameters<typeof tCourse>[0])}
            </h2>
          </div>

          {/* PDF viewer */}
          {pdfUrl && (
            <SectionErrorBoundary fallbackMessage={tCommon("error")} retryLabel={tCommon("retry")}>
              <PDFViewer url={pdfUrl} />
            </SectionErrorBoundary>
          )}

          {/* Lesson content */}
          {axisLessons.length > 0 ? (
            <div className="space-y-6">
              {axisLessons.map((lesson) => (
                <article key={lesson.id} className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                  {lesson.content && (
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {lesson.content}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            !pdfUrl && (
              <p className="text-gray-400 italic text-sm">{t("noContent")}</p>
            )
          )}

          {/* Code playground */}
          {canRunCode && (
            <SectionErrorBoundary fallbackMessage={tCommon("error")} retryLabel={tCommon("retry")}>
              <CodePlayground language={language} courseId={courseId} />
            </SectionErrorBoundary>
          )}

          {/* Quiz */}
          <SectionErrorBoundary fallbackMessage={tCommon("error")} retryLabel={tCommon("retry")}>
            {showQuiz && (
              <QuizEngine
                quiz={axisQuiz}
                axisNumber={selectedAxis}
                onComplete={handleQuizComplete}
              />
            )}

            {/* Already-passed quiz banner */}
            {axisQuiz && (quizAlreadyPassed || completedInSession.has(selectedAxis)) && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 font-medium">
                ✓ {t("quiz.passed")}
                {quizScores[selectedAxis] && (
                  <span className="ms-2 font-normal text-green-700">
                    ({quizScores[selectedAxis].score}/{quizScores[selectedAxis].total})
                  </span>
                )}
              </div>
            )}
          </SectionErrorBoundary>

          {/* Course completion banner */}
          {isCompleted && selectedAxis === 5 && (
            <div className="rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 text-center space-y-2">
              <p className="text-2xl">🎓</p>
              <p className="font-bold text-gray-900 text-lg">
                {t("quiz.courseComplete")}
              </p>
              <Link
                href="/"
                className="inline-block mt-2 text-sm text-[var(--color-primary-600)] hover:underline"
              >
                {t("browseCatalog")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
