import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { login } from "@/features/auth/auth.api";

import { useAuthStore } from "./auth.store";
import { handlePostLoginRedirect } from "@/utils/auth.utils";

export function LoginForm({ className, ...props }) {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  // Local state for handling error
  const [serverError, setServerError] = useState("");

  // 1. Local state for form fields
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 2. Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Modern mutation hook without deprecated callbacks
  const mutation = useMutation({
    mutationFn: login,
  });

  // 4. Handle success with useEffect
  useEffect(() => {
    if (mutation.isSuccess && mutation.data) {
      console.log("✅ Login Success:", mutation.data);
      const user = mutation.data?.user;
      setUser(user); // Update global auth state
      handlePostLoginRedirect(user, navigate);
    }
  }, [mutation.isSuccess, mutation.data, setUser, navigate]);

  // 5. Handle errors with useEffect
  useEffect(() => {
    if (mutation.isError) {
      const err = mutation.error;
      const msg = err?.response?.data?.error || "Login failed";
      
      if (msg) {
        setServerError(msg);
      } else {
        setServerError("Login failed");
      }
    }
  }, [mutation.isError, mutation.error]);

  // 6. Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(""); // Clear previous errors

    mutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="m@example.com"
          disabled={mutation.isPending}
          required
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={mutation.isPending}
          required
        />
      </div>

      {/* Login button */}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Logging in..." : "Login"}
      </Button>

      {/* Optional Error */}
      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}