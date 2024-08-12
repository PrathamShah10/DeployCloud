"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../redux/hooks";
import { changeAuthStatus } from "../redux/reducer/auth";
const Signin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9000/signin", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        await localStorage.setItem("token", data.token);
        await dispatch(changeAuthStatus(true));
        router.push("/home");
      } else {
        console.error("Signin failed", response.statusText);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div
        className="flex bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{ width: "850px", height: "550px" }}
      >
        <div className="w-full h-full p-10 flex flex-col justify-center">
          <h2 className="mb-6 text-4xl font-bold text-center text-gray-800">
            Welcome Back
          </h2>
          <p className="mb-4 text-center text-gray-600">
            Please sign in to your account
          </p>
          <form onSubmit={handleSignin} className="space-y-6">
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
              Sign In
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
