"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function register() {
    const res = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setMsg(res.ok ? "registered" : "error");
  }

  async function login() {
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    if (!res.ok) {
      alert("login failed");
      return;
    }
  
    const data = await res.json();
    localStorage.setItem("token", data.token);
    window.location.href = "/profile";
    //await fetchMe();
  }
  
  async function fetchMe() {
    const token = localStorage.getItem("token");
  
    const res = await fetch("http://localhost:8080/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    console.log(data);
  }



  return (
    <main className="p-8 space-y-4">
      <input
        className="border p-2"
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2"
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="space-x-2">
        <button onClick={register} className="border px-4 py-2">
          Register
        </button>
        <button onClick={login} className="border px-4 py-2">
          Login
        </button>
      </div>

      <p>{msg}</p>
    </main>
  );
}
