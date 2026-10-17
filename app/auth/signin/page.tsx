'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ArrowLeft, Headset, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) router.push('/dashboard');
      else setErrors({ general: result.error || 'Authentication failed' });
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#C8E1E7] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-[#0B3C49]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FEF5E3] flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
      {/* Decorative Sunbursts scattered across background */}
      <Image src="/images/decoration.png" alt="Decoration" className="absolute" style={{ inset: '15% 5% auto 50%' }} width={50} height={50} priority />
      <Image src="/images/decoration.png" alt="Decoration" className="absolute hidden lg:block -rotate-6" style={{ inset: '20% auto auto 48%' }} width={70} height={70} priority />
      <Image src="/images/decoration.png" alt="Decoration" className="absolute" style={{ inset: '15% 5% auto auto' }} width={50} height={50} priority />
      <Image src="/images/decoration.png" alt="Decoration" className="absolute -rotate-6" style={{ inset: '20% auto auto 88%' }} width={70} height={70} priority />
      <Image src="/images/decoration.png" alt="Decoration" className="absolute rotate-12" style={{ inset: '20% auto auto 8%' }} width={70} height={70} priority />
      <Image src="/images/decoration.png" alt="Decoration" className="absolute rotate-45 z-30" style={{ inset: '75% 60% auto auto' }} width={70} height={70} priority />

      <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-10 items-center relative z-10">
        
        {/* LEFT SIDE: Content & Illustration */}
        <div className="flex flex-col items-center lg:w-1/2 text-center space-y-4">
          <Link href="/" className="w-full flex justify-left -mb-12">
            <Image src="/Heal-logo.webp" alt="HEAL Logo" width={80} height={80} className="object-contain" priority />
          </Link>
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B3C49] font-acme">Join Our Platform</h2>
            <p className="text-base lg:text-lg text-gray-600 font-medium italic font-inter">Get full access to all platform features</p>
          </div>

          <div className="relative">
            <div className="rounded-[3rem] overflow-hidden shadow-xl max-w-[350px]">
              <Image src="/images/hugging-friends.png" alt="Group hugging" width={350} height={350} className="object-cover" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[#056173] text-2xl md:text-3xl font-bold font-acme leading-tight max-w-md">
              “Access confidential, dignified mental health support anytime, anywhere.”<span className="text-[#0B3C49]">-24/7</span>
            </p>
            
            <div className="flex flex-col items-center space-y-4 pt-8">
                <div className="flex items-center w-full max-w-xs">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="px-4 text-gray-400 font-bold font-acme text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                <Link href="/anonymous" className="px-10 py-3 border-2 border-[#056173] text-[#056173] rounded-full font-bold font-acme hover:bg-[#056173] hover:text-white transition-all text-lg">
                    Join Anonymously
                </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Sign In Form Card */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-[580px] bg-[#DDE8D2] p-8 md:p-20 rounded-lg shadow-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0B3C49] font-acme mb-1">Welcome back!</h1>
              <p className="text-[#0B3C49] font-medium opacity-80">Login to access all your data</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-base lg:text-lg font-normal text-[#016A79] font-acme">Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Enter your email address" 
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#056173] outline-none text-base lg:text-lg bg-white/60" 
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1 relative">
                <label className="text-base lg:text-lg font-normal text-[#016A79] font-acme">Password</label>
                <div className="relative">
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 rounded-md border border-gray-200 focus:ring-2 focus:ring-[#056173] outline-none text-base lg:text-lg bg-white/60" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#016A79] opacity-60"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium">Authentication Error</p>
                  <p>{errors.general}</p>
                  {errors.general.includes('Invalid email or password') && (
                    <p className="mt-2 text-xs">
                      Don't have an account? <Link href="/auth/signup" className="underline font-medium">Sign up here</Link>
                    </p>
                  )}
                </div>
              )}

              {/* Login Button */}
              <button 
                type="submit" 
                className="w-full py-4 bg-[#056173] text-white rounded-2xl font-bold font-acme text-lg hover:bg-[#0B3C49] transition-all shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              {/* Continue With Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <span className="relative px-3 bg-[#DDE8D2] text-sm text-gray-500 font-medium">Continue with</span>
              </div>

              {/* Social Logins */}
              <div className="space-y-3">
                <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-white/60 border border-gray-200 rounded-md hover:bg-white transition-all text-sm lg:text-base font-bold text-gray-700">
                  Login with Google <Image src="/images/google-icon.jpg" width={18} height={18} alt="Google" />
                </button>
                <button type="button" className="w-full flex items-center justify-center gap-2 py-3 bg-white/60 border border-gray-200 rounded-md hover:bg-white transition-all text-sm lg:text-base font-bold text-gray-700">
                  Login with Facebook <Image src="/images/facebook-icon.jpg" width={28} height={28} alt="Facebook" />
                </button>
              </div>

              {/* Redirect to Register */}
              <p className="text-center text-sm font-medium text-gray-600 pt-2">
                Don't have an account? <Link href="/auth/signup" className="text-blue-500 font-bold hover:underline">Register</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
