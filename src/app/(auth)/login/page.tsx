import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-brand-50 to-slate-50 p-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
          T
        </span>
        Talentos-RH
      </Link>
      <AuthForm mode="login" />
    </main>
  );
}
