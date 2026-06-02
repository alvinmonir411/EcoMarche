"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { authApi } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem("token", res.data.accessToken);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        
        // Dispatch custom event for Navbar to update immediately
        window.dispatchEvent(new Event('authChange'));

        // Check if user is admin
        if (res.data.user?.role === 'ADMIN') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 bg-accent/10 min-h-screen flex items-center">
      <Container>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row bg-white rounded-[32px] shadow-2xl shadow-secondary/5 overflow-hidden border border-accent/20">
          {/* Left Side: Image/Branding */}
          <div className="md:w-1/2 bg-primary p-12 text-white relative overflow-hidden hidden md:flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <Link href="/" className="text-3xl font-bold tracking-tighter">EcoMarche</Link>
              <h2 className="text-5xl font-bold mt-20 leading-tight">Welcome back <br /> to the movement.</h2>
              <p className="mt-6 text-primary-foreground/80 text-lg leading-relaxed max-w-sm">
                Log in to access your personalized dashboard, track your sustainable orders, and manage your wishlist.
              </p>
            </div>

            <div className="relative z-10 text-sm font-medium text-primary-foreground/60">
              © 2026 EcoMarche. Naturally Yours.
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-1/2 p-12 lg:p-20">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-secondary mb-3">Login</h1>
              <p className="text-gray-400 font-medium">Please enter your credentials to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-bold text-gray-700">Password</label>
                  <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot Password?</Link>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-accent/5 border border-accent/20 rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="remember" className="w-5 h-5 accent-primary rounded cursor-pointer" />
                <label htmlFor="remember" className="text-sm font-medium text-gray-500 cursor-pointer">Stay logged in for 30 days</label>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full py-5 text-lg font-bold shadow-xl shadow-primary/20"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-400 font-medium">
                New to EcoMarche?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline ml-1">Create an Account</Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
