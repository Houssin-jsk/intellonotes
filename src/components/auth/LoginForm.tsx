"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@i18n/navigation";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) return setError(t("errors.emailRequired"));
    if (!password) return setError(t("errors.passwordRequired"));

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setError(t("errors.invalidCredentials"));
        return;
      }

      // Redirect based on role — fetch fresh session after sign-in
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      router.refresh();

      if (role === "admin") {
        router.push("/admin/payments");
      } else if (role === "professor") {
        router.push("/professor/courses");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
        autoComplete="current-password"
        required
      />

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        {t("loginButton")}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t("noAccount")}{" "}
        <Link
          href="/auth/register"
          className="text-[var(--color-primary-600)] font-medium hover:underline"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </form>
  );
}
