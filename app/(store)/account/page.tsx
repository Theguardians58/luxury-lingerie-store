import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// This is the main component for the user's account page.
// It's an async component, allowing us to fetch data directly on the server.
export default async function AccountPage() {
  const cookieStore = cookies()

  // This is the corrected Supabase client initialization.
  // It now correctly passes the Supabase URL, the anon key, and the cookies object.
  // The URL and key are securely read from environment variables.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Fetch the current user's session from Supabase.
  const { data: { user } } = await supabase.auth.getUser()

  // If there is no active user session, redirect them to the login page.
  if (!user) {
    redirect('/login')
  }
  
  // A server action for handling user sign-out.
  const signOut = async () => {
    'use server'

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    await supabase.auth.signOut()
    return redirect('/')
  }

  // The JSX that renders the account page UI.
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Account</h1>
        <p className="text-gray-500 mb-6">Welcome back! Here are your details.</p>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-md">
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-md">
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="text-lg text-gray-700 font-mono text-sm break-all">{user.id}</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <form action={signOut}>
            <button 
              type="submit"
              className="w-full sm:w-auto bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
  
      
