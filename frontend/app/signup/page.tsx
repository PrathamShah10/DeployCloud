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
    <div className="min-h-screen bg-white flex items-center justify-center p-6" >
      <div
        className="flex bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ width: "850px", height: "550px" }}
      >
        <div className="w-full h-full p-10 flex flex-col justify-center">
          <h2 className="mb-6 text-4xl font-bold text-center text-gray-800">
            Create an account
          </h2>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                required
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg hover:bg-white hover:text-black border border-black transition duration-300"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/signin">
              <button className="text-blue-600 hover:underline">Sign In</button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
