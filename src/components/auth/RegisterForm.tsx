"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@i18n/navigation";
import { registerUser } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@i18n/navigation";
import { cn } from "@/lib/utils/cn";

type Role = "student" | "professor";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name) return setError(t("errors.nameRequired"));
    if (!email) return setError(t("errors.emailRequired"));
    if (!password) return setError(t("errors.passwordRequired"));
    if (password.length < 8) return setError(t("errors.passwordTooShort"));

    setIsLoading(true);

    try {
      const result = await registerUser(name, email, password, role);

      if (result.error) {
        if (result.error === "emailAlreadyRegistered") {
          setError(t("errors.emailAlreadyRegistered"));
        } else {
          setError(t("errors.generic"));
        }
        return;
      }

      // Auto sign-in after successful registration
      await signIn("credentials", { email, password, redirect: false });
      router.refresh();
      router.push(role === "professor" ? "/" : "/dashboard");
    } finally {
      setIsLoading(false);
    }
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
                "flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all text-sm font-bold shadow-sm",
                role === r
                  ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
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
        <Link
          href="/auth/login"
          className="text-[var(--color-primary-600)] font-medium hover:underline"
        >
          {t("signInLink")}
        </Link>
      </p>
    </form>
  );
}
