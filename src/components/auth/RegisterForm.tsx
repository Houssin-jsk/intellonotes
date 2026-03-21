"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@i18n/navigation";
import { cn } from "@/lib/utils/cn";

type Role = "student" | "professor";

export function RegisterForm() {
  const t = useTranslations("auth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name) return setError(t("errors.nameRequired"));
    if (!email) return setError(t("errors.emailRequired"));
    if (!password) return setError(t("errors.passwordRequired"));
    if (password.length < 8) return setError(t("errors.passwordTooShort"));

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
          setError(t("errors.emailAlreadyRegistered"));
        } else {
          setError(t("errors.generic"));
        }
        return;
      }

      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <p className="text-green-800 font-medium">{t("checkEmailTitle")}</p>
        <p className="text-green-700 text-sm mt-2">
          {t("checkEmailMessage", { email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        id="name"
        type="text"
        label={t("name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        required
      />
      <Input
        id="email"
        type="email"
        label={t("email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <Input
        id="password"
        type="password"
        label={t("password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      {/* Role selection */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">
          {t("roleLabel")}
        </legend>
        <div className="flex gap-3">
          {(["student", "professor"] as Role[]).map((r) => (
            <label
              key={r}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors text-sm font-medium",
                role === r
                  ? "border-[var(--color-primary-600)] bg-purple-50 text-[var(--color-primary-600)]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="sr-only"
              />
              {r === "student" ? t("roleStudent") : t("roleProfessor")}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        {t("registerButton")}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t("hasAccount")}{" "}
        <Link href="/auth/login" className="text-[var(--color-primary-600)] font-medium hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </form>
  );
}
