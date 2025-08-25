"use client";

import { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignUp, useSignIn, SignUpButton } from "@clerk/nextjs";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useDispatch, useSelector } from "react-redux";
import { loginAuth, signupAuth } from "./store/actions/Auth";
export default function SignUpPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { signupData, signupLoading, signupError } = useSelector(
    (state) => state.SIGNUP
  );
  const { getToken, userId } = useAuth();
  const { signOut } = useClerk();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [currentView, setCurrentView] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstname, setFirstname] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loginPendingVerification, setLoginPendingVerification] =
    useState(false);
  const [error, setError] = useState("");

  const doClerkLogin = async () => {
    await signOut();
    if (!isLoaded) return;
    setError("");

    try {
      // 1) Begin sign-in
      await signIn.create({ identifier: email });

      // 2) Ask Clerk to send OTP
      const emailFactor = signIn.supportedFirstFactors.find(
        (f) => f.strategy === "email_code"
      );

      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        setLoginPendingVerification(true);
      } else {
        setError("Email OTP is not enabled.");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Failed to send OTP.");
      if (err.errors?.[0]?.message === `Couldn't find your account.`) {
        setCurrentView("signup");
      }
    }
  };
  //Login OTP Verify

  const handleVerifyLogin = async () => {
    if (!isLoaded) return;
    setError("");

    try {
      const res = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otp,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        const token = await getToken();
        console.log("token", token);
        let payload = JSON.stringify({
          email: email,
          token: token,
        });
        dispatch(loginAuth(payload, router));
        // router.push("/style"); // redirect after login
      } else if (res.status === "needs_second_factor") {
        setError("This account requires a second factor.");
      } else {
        setError("Verification incomplete.");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Login failed.");
    }
  };

  const handleEmailStart = async () => {
    await signOut();
    if (!isLoaded) return;
    setError("");

    try {
      // 1) Update signup instance with required fields
      await signUp.create({
        firstName: firstname, // from state
        lastName: lastname, // from state
        unsafeMetadata: {
          phoneNumber: phoneNumber, // stored but not validated by Clerk
        },
        legalAccepted: true,
        emailAddress: email,
      });

      // 2) Trigger OTP to email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true); // now show OTP input
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.errors?.[0]?.message || "Failed to send verification code.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!isLoaded) return;
    setError("");

    try {
      const res = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        let payload = JSON.stringify({
          name: firstname + " " + lastname,
          email: email,
          role: "USER",
        });
        dispatch(signupAuth(payload));
        router.push("/style"); // redirect after signup
      } else if (res.status === "missing_requirements") {
        setError("Please complete all required fields.");
      } else {
        setError("Verification incomplete.");
      }
    } catch (err) {
      console.error("Signup verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(50% 50% at 50% 50%, #83CBEB 0%, #186B91 50%, #0D3A4E 100%)",
      }}
    >
      <Card className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 rounded-lg mb-6">
            <Image src={"/logo_auth.png"} width={100} height={100} alt="logo" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {pendingVerification
              ? "Verify Your Email"
              : "Join the Future Today"}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {pendingVerification
              ? `Enter the 6-digit code we sent to ${email}`
              : "Sign in to create your account to unlock exclusive features and personalized experiences"}
          </p>
        </div>

        {/* Social Logins */}
        {!pendingVerification && (
          <div className="flex gap-3 mb-6">
            <SignUpButton
              mode="modal"
              redirectUrl="/style"
              strategy="oauth_google"
            >
              <Button
                variant="outline"
                className="flex-1 py-3 text-blue-600 border-gray-200 hover:bg-gray-50 bg-transparent"
              >
                Continue with Google
              </Button>
            </SignUpButton>

            <SignUpButton
              mode="modal"
              redirectUrl="/style"
              strategy="oauth_apple"
            >
              <Button
                variant="outline"
                className="flex-1 py-3 text-blue-600 border-gray-200 hover:bg-gray-50 bg-transparent"
              >
                Continue with Apple
              </Button>
            </SignUpButton>
          </div>
        )}

        {/* Divider */}
        {!pendingVerification && (
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        )}

        {/* Email Input or OTP Input and current view is login*/}

        {currentView === "login" ? (
          <div className="space-y-4 mb-6">
            {!loginPendingVerification ? (
              <>
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
                  onClick={doClerkLogin}
                  disabled={!email}
                >
                  Login with email
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-center tracking-widest"
                  />
                </div>

                <Button
                  className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium"
                  onClick={handleVerifyLogin}
                >
                  Verify & Continue
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {!pendingVerification ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* Firstname */}
                  <div>
                    <label
                      htmlFor="firstname"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Firstname
                    </label>
                    <input
                      id="firstname"
                      type="text"
                      placeholder="Enter first name"
                      onChange={(e) => setFirstname(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>

                  {/* Lastname */}
                  <div>
                    <label
                      htmlFor="lastname"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Lastname
                    </label>
                    <input
                      id="lastname"
                      type="text"
                      placeholder="Enter last name"
                      onChange={(e) => setLastname(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="number"
                    placeholder="+1 XXXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
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
                  onClick={handleEmailStart}
                  disabled={!email}
                >
                  Create Account
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-center tracking-widest"
                  />
                </div>

                <Button
                  className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium"
                  onClick={handleVerifyOtp}
                >
                  Verify & Continue
                </Button>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

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
