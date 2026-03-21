import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProfessorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  if (session.user.role !== "professor") {
    redirect(`/${locale}`);
  }

  return <>{children}</>;
}
