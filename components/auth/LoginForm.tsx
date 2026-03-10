"use client";

import { useState } from "react";
import Link from "next/link";

interface LoginFormProps {
  onSubmit: (params: { email: string; password: string }) => void;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LoginForm = ({ onSubmit, error }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--text-sub)]">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-sub)]">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-[var(--accent)] py-3 font-medium text-white transition hover:opacity-90"
      >
        로그인
      </button>

      <a
        href={`${API_URL}/auth/oauth2/google`}
        className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-3 font-medium text-[var(--text)] transition hover:bg-[var(--surface2)]"
      >
        Google로 로그인
      </a>

      <p className="text-center text-sm text-[var(--text-sub)]">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-[var(--accent)] hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
