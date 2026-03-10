"use client";

import { useState } from "react";
import Link from "next/link";

interface SignupFormProps {
  onSubmit: (params: { email: string; password: string; name: string }) => void;
  error: string | null;
}

const SignupForm = ({ onSubmit, error }: SignupFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, name });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--text-sub)]">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
      </div>
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
          minLength={8}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
        />
        <p className="mt-1 text-xs text-[var(--text-sub)]">8자 이상 입력해주세요</p>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-[var(--accent)] py-3 font-medium text-white transition hover:opacity-90"
      >
        회원가입
      </button>

      <p className="text-center text-sm text-[var(--text-sub)]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
