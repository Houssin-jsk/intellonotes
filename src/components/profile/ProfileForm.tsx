"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileFormProps {
  initialName: string;
  initialBio: string;
  initialExpertise: string;
  showExpertise: boolean;
}

export function ProfileForm({
  initialName,
  initialBio,
  initialExpertise,
  showExpertise,
}: ProfileFormProps) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [expertise, setExpertise] = useState(initialExpertise);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || name.trim().length < 2) {
      setError(t("errors.nameRequired"));
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile(
      { name: name.trim(), bio, expertise },
      locale
    );
    setIsSubmitting(false);

    if (result.error) {
      setError(t("errors.generic"));
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="profile-name"
        label={t("nameLabel")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Textarea
        id="profile-bio"
        label={t("bioLabel")}
        placeholder={t("bioPlaceholder")}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
      />

      {showExpertise && (
        <Input
          id="profile-expertise"
          label={t("expertiseLabel")}
          placeholder={t("expertisePlaceholder")}
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{t("saveSuccess")}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        {t("save")}
      </Button>
    </form>
  );
}
