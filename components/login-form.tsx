"use client"

import React, { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { Eye, EyeOff } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const email = watch("email")

  React.useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search))
  }, [])

  React.useEffect(() => {
    if (!searchParams) return

    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "email-verified") {
      toast.success("Email verified successfully! You can now sign in.")
    } else if (error === "missing-token") {
      toast.error("Invalid verification link.")
    } else if (error === "verification-failed") {
      toast.error("Email verification failed. Please try again.")
    } else if (error) {
      // NextAuth OAuth error codes
      const oauthErrors: Record<string, string> = {
        OAuthSignin:        "Could not start Google sign-in. Check your OAuth credentials.",
        OAuthCallback:      "Google sign-in failed. Verify your redirect URI matches the Google Cloud Console.",
        OAuthCreateAccount: "Could not create account via Google. Email may already be registered.",
        OAuthAccountNotLinked: "This email is registered with a different sign-in method.",
        Callback:           "An error occurred during sign-in. Please try again.",
        AccessDenied:       "Access denied. You may not have permission to sign in.",
        Configuration:      "Server configuration error. Contact support.",
        Default:            "Sign-in failed. Please try again.",
      }
      toast.error(oauthErrors[error] ?? `Sign-in error: ${error}`)
    }
  }, [searchParams])

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address first")
      return
    }

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast.success("Verification email sent! Check your inbox.")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to send verification email")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes("verify")) {
          toast.error(
            <div className="flex flex-col gap-2">
              <span>Please verify your email before signing in.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                className="w-fit"
              >
                Resend verification email
              </Button>
            </div>,
            { duration: 10000 }
          )
        } else {
          toast.error("Invalid email or password")
        }
      } else if (result?.ok) {
        toast.success("Welcome back!")

        // Read the fresh session to determine where to send the user
        const session = await getSession()
        const role = session?.user?.role

        if (role === "ADMIN") {
          router.push("/admin/dashboard")
          return
        }

        // Students: check profile completion
        try {
          const profileResponse = await fetch("/api/profile")
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            router.push(profileData.profile?.isComplete ? "/dashboard" : "/profile")
          } else {
            router.push("/profile")
          }
        } catch {
          router.push("/profile")
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    // Redirect to root — middleware will send admins to /admin/dashboard
    // and students to wherever is appropriate
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-medium"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {isGoogleLoading ? "Connecting..." : "Continue with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(
                      "h-11 pr-10",
                      errors.email && "border-red-300 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "h-11 pr-20",
                      errors.password && "border-red-300 focus-visible:ring-red-500"
                    )}
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground text-balance">
        By continuing, you agree to our{" "}
        <a href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
