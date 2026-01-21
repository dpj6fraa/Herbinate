"use client";

import AuthGuard from "../components/AuthGuard";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  created_at: string;
};

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}


export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMe() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("not logged in");
        return;
      }

      const res = await fetch("http://localhost:8080/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("unauthorized");
        return;
      }

      const data = await res.json();
      setUser(data);
    }

    loadMe();
  }, []);

  if (error) {
    return (
    <AuthGuard>
      <main className="p-8">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-red-500">{error}</p>
      </main>
    </AuthGuard>
    );
  }

  if (!user) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="p-8 space-y-2">
      <h1 className="text-xl font-bold">Profile</h1>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>Joined:</strong>{" "}
        {new Date(user.created_at).toLocaleString()}
      </p>
        <button onClick={logout} className="mt-4 border px-4 py-2 text-red-600">Logout</button>
    </main>
  );
}
