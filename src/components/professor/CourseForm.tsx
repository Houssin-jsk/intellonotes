"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createCourse } from "@/lib/actions/course";
import {
  SUPPORTED_LANGUAGES,
  COURSE_LEVELS,
  PRICE_OPTIONS,
  LANGUAGE_DISPLAY_NAMES,
} from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Plus, X } from "lucide-react";

export function CourseForm() {
  const t = useTranslations("professor.courseForm");
  const locale = useLocale();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [prerequisites, setPrerequisites] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const languageOptions = SUPPORTED_LANGUAGES.map((lang) => ({
    value: lang,
    label: LANGUAGE_DISPLAY_NAMES[lang],
  }));

  const levelOptions = COURSE_LEVELS.map((lvl) => ({
    value: lvl,
    label: t(`levels.${lvl}`),
  }));

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = t("errors.titleRequired");
    } else if (title.trim().length < 3) {
      newErrors.title = t("errors.titleTooShort");
    }

    if (!description.trim()) {
      newErrors.description = t("errors.descriptionRequired");
    } else if (description.trim().length < 10) {
      newErrors.description = t("errors.descriptionTooShort");
    }

    if (!language) {
      newErrors.language = t("errors.languageRequired");
    }

    if (!level) {
      newErrors.level = t("errors.levelRequired");
    }

    if (price === null) {
      newErrors.price = t("errors.priceRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const result = await createCourse(
      {
        title: title.trim(),
        description: description.trim(),
        language,
        level,
        price: price!,
        objectives: objectives.filter((s) => s.trim()),
        prerequisites: prerequisites.filter((s) => s.trim()),
      },
      locale
    );

    if (result.error) {
      setErrors({ form: t("errors.generic") });
      setIsLoading(false);
      return;
    }

    router.refresh();
    router.push("/professor/courses");
  }

  function addObjective() {
    setObjectives([...objectives, ""]);
  }

  function removeObjective(index: number) {
    setObjectives(objectives.filter((_, i) => i !== index));
  }

  function updateObjective(index: number, value: string) {
    const updated = [...objectives];
    updated[index] = value;
    setObjectives(updated);
  }

  function addPrerequisite() {
    setPrerequisites([...prerequisites, ""]);
  }

  function removePrerequisite(index: number) {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  }

  function updatePrerequisite(index: number, value: string) {
    const updated = [...prerequisites];
    updated[index] = value;
    setPrerequisites(updated);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Input
        id="title"
        label={t("titleLabel")}
        placeholder={t("titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        maxLength={200}
        required
      />

      <Textarea
        id="description"
        label={t("descriptionLabel")}
        placeholder={t("descriptionPlaceholder")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        maxLength={2000}
        required
      />

      <Select
        id="language"
        label={t("languageLabel")}
        placeholder={t("languagePlaceholder")}
        options={languageOptions}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        error={errors.language}
        required
      />

      <Select
        id="level"
        label={t("levelLabel")}
        placeholder={t("levelPlaceholder")}
        options={levelOptions}
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        error={errors.level}
        required
      />

      {/* Price radio buttons */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {t("priceLabel")}
        </legend>
        <div className="flex flex-wrap gap-3">
          {PRICE_OPTIONS.map((p) => (
            <label
              key={p}
              className={cn(
                "flex items-center justify-center rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors text-sm font-medium min-w-[80px]",
                price === p
                  ? "border-[var(--color-primary-600)] bg-purple-50 text-[var(--color-primary-600)]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name="price"
                value={p}
                checked={price === p}
                onChange={() => setPrice(p)}
                className="sr-only"
              />
              {p} Dh
            </label>
          ))}
        </div>
        {errors.price && (
          <p className="text-xs text-red-600 mt-1.5">{errors.price}</p>
        )}
      </fieldset>

      {/* Objectives dynamic array */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {t("objectivesLabel")}
        </legend>
        <div className="flex flex-col gap-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={obj}
                onChange={(e) => updateObjective(i, e.target.value)}
                placeholder={t("objectivesPlaceholder")}
                className="flex-1"
              />
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addObjective}
            className="flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium mt-1 self-start"
          >
            <Plus size={16} />
            {t("addObjective")}
          </button>
        </div>
      </fieldset>

      {/* Prerequisites dynamic array */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {t("prerequisitesLabel")}
        </legend>
        <div className="flex flex-col gap-2">
          {prerequisites.map((prereq, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={prereq}
                onChange={(e) => updatePrerequisite(i, e.target.value)}
                placeholder={t("prerequisitesPlaceholder")}
                className="flex-1"
              />
              {prerequisites.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrerequisite(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPrerequisite}
            className="flex items-center gap-1 text-sm text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] font-medium mt-1 self-start"
          >
            <Plus size={16} />
            {t("addPrerequisite")}
          </button>
        </div>
      </fieldset>

      {errors.form && (
        <p className="text-sm text-red-600 text-center">{errors.form}</p>
      )}

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        {t("submitCreate")}
      </Button>
    </form>
  );
}
