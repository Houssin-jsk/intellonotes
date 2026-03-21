"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { X, Plus } from "lucide-react";
import type { QuizQuestion, MCQQuestion, TrueFalseQuestion, FillBlankQuestion } from "@/types/quiz";

interface QuizQuestionBuilderProps {
  question: QuizQuestion;
  index: number;
  onChange: (updated: QuizQuestion) => void;
  onRemove: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizQuestionBuilder({
  question,
  index,
  onChange,
  onRemove,
}: QuizQuestionBuilderProps) {
  const t = useTranslations("professor.courseEditor");

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          #{index + 1} — {t(`questionTypes.${question.type}`)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {question.type === "mcq" && (
        <MCQEditor
          question={question}
          onChange={onChange}
        />
      )}

      {question.type === "true_false" && (
        <TrueFalseEditor
          question={question}
          onChange={onChange}
        />
      )}

      {question.type === "fill_blank" && (
        <FillBlankEditor
          question={question}
          onChange={onChange}
        />
      )}

      {/* Explanation (common to all types) */}
      <Input
        value={question.explanation ?? ""}
        onChange={(e) => onChange({ ...question, explanation: e.target.value })}
        label={t("explanation")}
        placeholder={t("explanationPlaceholder")}
      />
    </div>
  );
}

function MCQEditor({
  question,
  onChange,
}: {
  question: MCQQuestion;
  onChange: (q: QuizQuestion) => void;
}) {
  const t = useTranslations("professor.courseEditor");

  function updateOption(idx: number, value: string) {
    const options = [...question.options];
    options[idx] = value;
    onChange({ ...question, options });
  }

  function addOption() {
    if (question.options.length >= 6) return;
    onChange({ ...question, options: [...question.options, ""] });
  }

  function removeOption(idx: number) {
    if (question.options.length <= 2) return;
    const options = question.options.filter((_, i) => i !== idx);
    const correctIndex =
      question.correct_index === idx
        ? 0
        : question.correct_index > idx
          ? question.correct_index - 1
          : question.correct_index;
    onChange({ ...question, options, correct_index: correctIndex });
  }

  return (
    <>
      <Input
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        label={t("questionText")}
        placeholder={t("questionTextPlaceholder")}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{t("mcqCorrectAnswer")}</p>
        {question.options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name={`mcq-correct-${question.id}`}
              checked={question.correct_index === idx}
              onChange={() => onChange({ ...question, correct_index: idx })}
              className="accent-[var(--color-primary-600)]"
            />
            <Input
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={t("mcqOption", { letter: OPTION_LETTERS[idx] ?? String(idx + 1) })}
              className="flex-1"
            />
            {question.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        {question.options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium mt-1"
          >
            <Plus size={14} />
            {t("mcqAddOption")}
          </button>
        )}
      </div>
    </>
  );
}

function TrueFalseEditor({
  question,
  onChange,
}: {
  question: TrueFalseQuestion;
  onChange: (q: QuizQuestion) => void;
}) {
  const t = useTranslations("professor.courseEditor");

  return (
    <>
      <Input
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        label={t("questionText")}
        placeholder={t("questionTextPlaceholder")}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{t("trueFalseCorrect")}</p>
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <label
              key={String(val)}
              className={cn(
                "flex-1 flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-colors text-sm font-medium",
                question.correct_answer === val
                  ? "border-[var(--color-primary-600)] bg-purple-50 text-[var(--color-primary-600)]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name={`tf-correct-${question.id}`}
                checked={question.correct_answer === val}
                onChange={() => onChange({ ...question, correct_answer: val })}
                className="sr-only"
              />
              {val ? t("trueFalseTrue") : t("trueFalseFalse")}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

function FillBlankEditor({
  question,
  onChange,
}: {
  question: FillBlankQuestion;
  onChange: (q: QuizQuestion) => void;
}) {
  const t = useTranslations("professor.courseEditor");

  function updateAnswer(idx: number, value: string) {
    const answers = [...question.correct_answers];
    answers[idx] = value;
    onChange({ ...question, correct_answers: answers });
  }

  function addAnswer() {
    onChange({ ...question, correct_answers: [...question.correct_answers, ""] });
  }

  function removeAnswer(idx: number) {
    if (question.correct_answers.length <= 1) return;
    onChange({
      ...question,
      correct_answers: question.correct_answers.filter((_, i) => i !== idx),
    });
  }

  return (
    <>
      <div>
        <Textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          label={t("questionText")}
          placeholder={t("questionTextPlaceholder")}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">{t("fillBlankHint")}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{t("fillBlankAnswer")}</p>
        {question.correct_answers.map((ans, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={ans}
              onChange={(e) => updateAnswer(idx, e.target.value)}
              className="flex-1"
            />
            {question.correct_answers.length > 1 && (
              <button
                type="button"
                onClick={() => removeAnswer(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAnswer}
          className="flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium mt-1"
        >
          <Plus size={14} />
          {t("fillBlankAddAnswer")}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={question.case_sensitive}
          onChange={(e) =>
            onChange({ ...question, case_sensitive: e.target.checked })
          }
          className="accent-[var(--color-primary-600)]"
        />
        {t("fillBlankCaseSensitive")}
      </label>
    </>
  );
}
