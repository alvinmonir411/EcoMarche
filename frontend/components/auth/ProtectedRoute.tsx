"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token) {
      router.push("/login");
    } else if (role && user?.role !== role) {
      router.push("/");
    } else {
      setAuthorized(true);
    }
  }, [router, role]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/5">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
