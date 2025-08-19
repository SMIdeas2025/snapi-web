"use client";

import { useState } from "react";

import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div
      className="min-h-screen  flex items-center justify-center p-4"
      style={{
        background: `radial-gradient(50% 50% at 50% 50%, #83CBEB 0%, #186B91 50%, #0D3A4E 100%);`,
      }}
    >
      <Card className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* Snapi Logo */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 rounded-lg mb-6">
            <Image src={"/logo_auth.png"} width={100} height={100} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Join the Future Today
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed">
            Sign in to create your account to unlock exclusive features and
            personalized experiences
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            className="flex-1 py-3 text-blue-600 border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="flex-1 py-3 text-blue-600 border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            Continue with Apple
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Email Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <Button
            className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium"
            onClick={() => router.push("/style")}
          >
            Continue with Email
          </Button>
        </div>

        {/* Legal Text */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          By continuing you agree to our{" "}
          <a href="#" className="text-blue-600 hover:underline">
            terms of service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            privacy policy
          </a>
        </p>
      </Card>
    </div>
  );
}
