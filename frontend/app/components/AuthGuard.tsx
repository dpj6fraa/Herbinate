"use client";

import { useEffect, useState } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Wrap in async to defer state update
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        window.location.href = "/";
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p className="p-8">Checking authentication...</p>;
  }

  return <>{children}</>;
}