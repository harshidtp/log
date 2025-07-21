"use client";

import { useRouter } from "next/navigation";
import AuthForm from "../components/AuthForm";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-end bg-gray-50 px-8">
      <div className="w-full max-w-md">
        <AuthForm onAuthSuccess={() => router.push("/dashboard")} />
    
      </div>
    </div>
  );
}
