import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8f04a] text-sm text-slate-900">
          T
        </span>
        Talentos-RH
      </Link>
      <AuthForm mode="register" />
    </main>
  );
}
