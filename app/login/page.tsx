"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { login, loginError } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight">
          로그인
        </h1>
        <LoginForm onSubmit={login} error={loginError} />
      </div>
    </main>
  );
}
