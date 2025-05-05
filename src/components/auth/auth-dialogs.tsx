"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

interface AuthDialogsProps {
  initialView?: "login" | "signup";
}

export function AuthDialogs({ initialView = "login" }: AuthDialogsProps) {
  const [view, setView] = useState<"login" | "signup" | "choice">(initialView);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset to initial view when dialog closes
      setTimeout(() => setView(initialView), 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Get Started</Button>
      </DialogTrigger>

      <DialogContent>
        {view === "choice" && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
              aria-hidden="true"
            >
              <svg
                className="stroke-zinc-800 dark:stroke-zinc-100"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">Welcome</DialogTitle>
              <DialogDescription className="sm:text-center">
                Choose an option to continue
              </DialogDescription>
            </DialogHeader>

            <div className="flex w-full flex-col gap-2">
              <Button onClick={() => setView("login")}>Sign in</Button>
              <Button variant="outline" onClick={() => setView("signup")}>
                Create an account
              </Button>
            </div>
          </div>
        )}

        {view === "login" && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
              aria-hidden="true"
            >
              <svg
                className="stroke-zinc-800 dark:stroke-zinc-100"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">Welcome back</DialogTitle>
              <DialogDescription className="sm:text-center">
                Enter your credentials to login to your account.
              </DialogDescription>
            </DialogHeader>

            {/* Login form content */}
            <LoginFormContent onClose={() => setOpen(false)} />

            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setView("signup")}
              >
                Sign up
              </Button>
            </div>
          </div>
        )}

        {view === "signup" && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
              aria-hidden="true"
            >
              <svg
                className="stroke-zinc-800 dark:stroke-zinc-100"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">Create an account</DialogTitle>
              <DialogDescription className="sm:text-center">
                Enter your information to create a new account.
              </DialogDescription>
            </DialogHeader>

            {/* Signup form content */}
            <SignupFormContent onClose={() => setOpen(false)} />

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setView("login")}
              >
                Sign in
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface FormContentProps {
  onClose: () => void;
}

function LoginFormContent({ onClose }: FormContentProps) {
  const id = useId();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      window.location.href = "/agent-layout/dashboard";
    }, 1000);
  };

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input id={`${id}-email`} placeholder="hi@yourcompany.com" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-password`}>Password</Label>
          <Input
            id={`${id}-password`}
            placeholder="Enter your password"
            type="password"
            required
          />
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox id={`${id}-remember`} />
          <Label htmlFor={`${id}-remember`} className="font-normal text-muted-foreground">
            Remember me
          </Label>
        </div>
        <a className="text-sm underline hover:no-underline" href="#">
          Forgot password?
        </a>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">Or</span>
      </div>

      <Button variant="outline" type="button" className="w-full">
        Login with Google
      </Button>
    </form>
  );
}

function SignupFormContent({ onClose }: FormContentProps) {
  const id = useId();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      window.location.href = "/agent-layout/dashboard";
    }, 1000);
  };

  return (
    <form className="w-full space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-name`}>Full Name</Label>
          <Input id={`${id}-name`} placeholder="John Doe" type="text" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input id={`${id}-email`} placeholder="hi@yourcompany.com" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-password`}>Password</Label>
          <Input
            id={`${id}-password`}
            placeholder="Create a password"
            type="password"
            required
          />
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id={`${id}-terms`} className="mt-1" />
        <Label htmlFor={`${id}-terms`} className="font-normal text-muted-foreground">
          I agree to the <a href="#" className="text-foreground underline hover:no-underline">Terms of Service</a> and <a href="#" className="text-foreground underline hover:no-underline">Privacy Policy</a>
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>

      <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        <span className="text-xs text-muted-foreground">Or</span>
      </div>

      <Button variant="outline" type="button" className="w-full">
        Sign up with Google
      </Button>
    </form>
  );
}
