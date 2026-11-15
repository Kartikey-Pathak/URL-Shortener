"use client";
import React, { useState, Suspense, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    toast("Check Spam folder for the OTP.", {
      icon: "📩",
    });
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Please enter both email and OTP");
      return;
    }

    try {
      setLoading(true);
      const resp = await axios.post("/api/users/verify-otp", {
        email,
        otp: otp.trim(),
      });

      console.log("Verification Success:", resp.data);
      toast.success(resp.data.message || "Account verified successfully!");

      if (resp.data.token) {
        localStorage.setItem("token", resp.data.token);
        localStorage.setItem("user", JSON.stringify(resp.data.user));
        document.cookie = `token=${resp.data.token}; path=/; max-age=604800`;
      }

      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (error) {
      const message = error?.response?.data?.error || "Verification failed";
      toast.error(typeof message === "string" ? message : "Invalid OTP");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter email to resend OTP");
      return;
    }

    try {
      setResending(true);
      const resp = await axios.post("/api/users/resend-otp", { email });
      toast.success("New OTP sent! Check inbox or spam folder.");
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to resend OTP";
      toast.error(typeof message === "string" ? message : "Error sending OTP");
      console.error(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <section className=" w-full dark:bg-black h-fit min-h-screen flex items-center justify-center">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          className="w-full h-full object-cover scale-105"
          src="hero2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl z-10" />
      </div>

      <div className="shadow-input mx-auto w-full max-w-md rounded-none backdrop-blur-3xl p-4 md:rounded-2xl md:p-8 dark:bg-black flex flex-col justify-center">
        <Toaster />
        <h2 className="text-xl font-bold text-neutral-200 dark:text-neutral-200">
          Verify Your Email
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-200 dark:text-neutral-300">
          Enter the 6-digit OTP sent to:{" "}
          <span className="font-semibold text-blue-400">{email || "your email"}</span>
        </p>

        <form className="my-8 flex flex-col gap-4" onSubmit={handleVerify}>
          {!emailParam && (
            <LabelInputContainer>
              <Label htmlFor="email">
                <span className=" text-white">Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="test@gmail.com"
                className=" bg-black/30 rounded-xl text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </LabelInputContainer>
          )}

          <LabelInputContainer>
            <Label htmlFor="otp">
              <span className=" text-white">6-Digit OTP</span>
            </Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              placeholder="••••••"
              className=" bg-black/30 rounded-xl text-white text-center text-xl tracking-[0.4em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </LabelInputContainer>

          <button
            type="submit"
            className="group/btn relative hover:opacity-70 active:opacity-60 active:border-2 active:border-white active:dark:opacity-60 transition-all mt-4 cursor-pointer block h-10 w-full rounded-md bg-black/60 backdrop-blur-2xl font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP →"}
            <BottomGradient />
          </button>

          <div className="flex items-center justify-between text-sm text-neutral-200 dark:text-neutral-300 mt-2">
            <span>Didn't get the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="cursor-pointer hover:text-blue-400 active:text-blue-400 transition-all text-blue-500 font-medium"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          <div className="my-2 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <h3 className="text-sm text-neutral-200 dark:text-neutral-300">
            Entered wrong email?{" "}
            <Link href="/signup" className="cursor-pointer hover:text-blue-400 active:text-blue-400 transition-all text-blue-700">
              Back to Signup
            </Link>
          </h3>
        </form>
      </div>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-8">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
