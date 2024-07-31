"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState<string>("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9000/signup", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.message) {
          console.log("signed up");
          router.push("/signin");
        }
      } else {
        console.error("Signup failed", response.statusText);
      }
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/signin">
            <button className="text-blue-500">Sign In</button>
          </Link>
        </p>
      </div>
    </div>
  );
}
