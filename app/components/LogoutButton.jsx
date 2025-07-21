"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();

  function handleLogout() {
    localStorage.clear();
    router.push("/");  // or "/auth" or your actual login page URL

  }

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-500 text-white px-4 py-2 rounded ${className}`}
    >
      Logout
    </button>
  );
}
