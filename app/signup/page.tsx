"use client";

import { useAuth } from "@/hooks/useAuth";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  const { signup, signupError } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight">
          회원가입
        </h1>
        <SignupForm onSubmit={signup} error={signupError} />
      </div>
    </main>
  );
}
