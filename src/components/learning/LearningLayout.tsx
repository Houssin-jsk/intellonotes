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
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-80 shrink-0 border-e border-slate-200/60 bg-white/40 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="h-full overflow-y-auto p-6 scrollbar-hide">
          <ProgressSidebar axes={axisList} onSelectAxis={handleSelectAxis} />
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top bar */}
        <div className="shrink-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={`/courses/${courseId}`}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-[var(--color-primary-600)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] transition-all hover:scale-105 shrink-0"
            >
               <span className="text-xl leading-none -mt-0.5">{locale === 'ar' ? '\u2192' : '\u2190'}</span>
            </Link>
            <h1 className="font-extrabold text-slate-900 text-lg truncate tracking-tight">
              {courseTitle}
            </h1>
          </div>
          {isCompleted && (
            <span className="shrink-0 text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full shadow-sm">
              {t("completed")}
            </span>
          )}
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-10 relative z-10 pb-20">
            {/* Mobile axis strip */}
            <div className="lg:hidden mb-8">
              <ProgressSidebar
                axes={axisList}
                onSelectAxis={handleSelectAxis}
                mobile
              />
            </div>

            {/* Axis heading */}
            <div className="glass rounded-[2rem] p-8 sm:p-10 border border-white shadow-xl relative overflow-hidden">
               {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-200)] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs font-black text-[var(--color-primary-500)] uppercase tracking-widest mb-3">
                  {tCourse("axis", { number: selectedAxis })}
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  {tCourse(`axisNames.${selectedAxis}` as Parameters<typeof tCourse>[0])}
                </h2>
              </div>
            </div>

            {/* PDF viewer */}
            {pdfUrl && (
              <SectionErrorBoundary fallbackMessage={tCommon("error")} retryLabel={tCommon("retry")}>
                <div className="neumorph rounded-3xl p-2 sm:p-4 bg-white/40">
                  <PDFViewer url={pdfUrl} />
                </div>
              </SectionErrorBoundary>
            )}

            {/* Lesson content */}
            {axisLessons.length > 0 ? (
              <div className="space-y-8">
                {axisLessons.map((lesson) => (
                  <article key={lesson.id} className="glass rounded-[2rem] p-8 sm:p-10 border border-white shadow-lg space-y-6">
                    <h3 className="font-extrabold text-2xl text-slate-900">{lesson.title}</h3>
                    {lesson.content && (
                      <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                        {lesson.content}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              !pdfUrl && (
                <div className="glass rounded-3xl p-12 text-center border-white shadow-sm flex flex-col items-center justify-center min-h-[200px]">
                  <p className="text-slate-400 italic text-lg font-medium">{t("noContent")}</p>
                </div>
              )
            )}

            {/* Code playground */}
            {canRunCode && (
              <SectionErrorBoundary fallbackMessage={tCommon("error")} retryLabel={tCommon("retry")}>
                <div className="neumorph rounded-[2rem] p-3 sm:p-5">
                   <CodePlayground language={language} courseId={courseId} />
                </div>
              </SectionErrorBoundary>
            )}

            {/* Quiz */}
            <SectionErrorBoundary fallbackMessage={tCommon("error")} retryLabel={tCommon("retry")}>
              {showQuiz && (
                <div className="glass rounded-[2rem] p-8 sm:p-10 border border-white shadow-2xl">
                  <QuizEngine
                    quiz={axisQuiz}
                    axisNumber={selectedAxis}
                    onComplete={handleQuizComplete}
                  />
                </div>
              )}

              {/* Already-passed quiz banner */}
              {axisQuiz && (quizAlreadyPassed || completedInSession.has(selectedAxis)) && (
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-inner">
                      ✓
                    </div>
                    <div>
                      <p className="text-emerald-900 font-extrabold text-lg">{t("quiz.passed")}</p>
                    </div>
                  </div>
                  {quizScores[selectedAxis] && (
                    <div className="text-right">
                      <span className="block font-black text-2xl text-emerald-700">
                        {quizScores[selectedAxis].score}<span className="text-lg text-emerald-500">/{quizScores[selectedAxis].total}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </SectionErrorBoundary>

            {/* Course completion banner */}
            {isCompleted && selectedAxis === 5 && (
              <div className="rounded-[2.5rem] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="w-24 h-24 rounded-full bg-white/20 mx-auto flex items-center justify-center shadow-xl backdrop-blur-md">
                  <p className="text-5xl">🎓</p>
                </div>
                <div>
                   <p className="font-extrabold text-white text-3xl tracking-tight mb-2">
                     {t("quiz.courseComplete")}
                   </p>
                   <p className="text-white/80 font-medium text-lg">You have successfully mastered all topics.</p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-[var(--color-primary-700)] rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl btn-3d mt-4"
                >
                  {t("browseCatalog")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
