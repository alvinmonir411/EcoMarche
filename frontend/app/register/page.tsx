"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { authApi } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authApi.register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(", ") : res.error;
        setError(errMsg || "Registration failed. Please try again.");
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
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse bg-white rounded-[32px] shadow-2xl shadow-secondary/5 overflow-hidden border border-accent/20">
          {/* Left Side: Image/Branding */}
          <div className="md:w-1/2 bg-secondary p-12 text-white relative overflow-hidden hidden md:flex flex-col justify-between">
            <div className="absolute top-0 left-0 -ml-20 -mt-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <Link href="/" className="text-3xl font-bold tracking-tighter">FastLain</Link>
              <h2 className="text-5xl font-bold mt-20 leading-tight">Join the <br /> fashion revolution.</h2>
              <p className="mt-6 text-gray-400 text-lg leading-relaxed max-w-sm">
                Create an account today and get 10% off your first order. Be the first to know about our eco-friendly drops.
              </p>
            </div>

            <div className="relative z-10 text-sm font-medium text-gray-600">
              © 2026 FastLain. Naturally Yours.
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-1/2 p-12 lg:p-20">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-secondary mb-3">Register</h1>
              <p className="text-gray-400 font-medium">Start your sustainable style journey today</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold border border-green-100 animate-in fade-in slide-in-from-top-2">
                Account created successfully! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  name="firstName" 
                  placeholder="John" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
                <Input 
                  label="Last Name" 
                  name="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <Input 
                label="Email Address" 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              
              <div className="py-2">
                <p className="text-xs text-gray-500 leading-relaxed">
                  By clicking &quot;Create Account&quot;, you agree to our <Link href="#" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full py-5 text-lg font-bold shadow-xl shadow-primary/20"
                disabled={loading || success}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-400 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline ml-1">Log In Here</Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
