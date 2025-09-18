'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Use the new client creator
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient(); // Create the client-side instance

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This sends the full name to the trigger that creates the user's profile
        data: {
          full_name: fullName,
        },
        // The new library requires the callback URL to be set here for email confirmations
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Success! Please check your email for a confirmation link to complete your registration.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create a New Account</h2>

        {message ? (
          <div className="text-center">
            <p className="text-green-600 bg-green-50 p-4 rounded-md">{message}</p>
            <Link href="/login" className="mt-4 inline-block font-medium text-rose-500 hover:underline">
                Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label htmlFor="password"  className="text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </form>
        )}

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-rose-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
