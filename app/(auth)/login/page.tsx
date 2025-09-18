'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Use the new client creator
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient(); // Create the client-side instance

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push('/account');
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
     await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login to Your Account</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-gray-800 text-white rounded-md">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div></div>
        <button onClick={handleGoogleLogin} className="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2">
          <Chrome size={20} />
          <span>Google</span>
        </button>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-rose-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
    }
