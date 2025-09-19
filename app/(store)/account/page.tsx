import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateUserProfile } from './actions';
import { Database } from '@/lib/types';

// A helper type for the address object
type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default async function AccountPage({ searchParams }: { searchParams: { message?: string }}) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch the user's profile data on the server
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // Safely access the data, providing a default if it's missing
  const address: Address = (profile?.shipping_address as any) || {
      street: '', city: '', state: '', postalCode: '', country: ''
  };

  const signOut = async () => {
    'use server';
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
        },
      }
    );
    await supabase.auth.signOut();
    return redirect('/');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        {searchParams.message && (
          <div className={`mb-4 p-4 text-center text-white rounded-md ${searchParams.message.startsWith('Error') ? 'bg-red-500' : 'bg-gray-800'}`}>
            <p>{searchParams.message}</p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-gray-600 mb-8">Manage your personal information.</p>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <form action={updateUserProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <p className="mt-1 text-gray-500">{session.user.email}</p>
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="full_name" id="full_name" defaultValue={profile?.full_name || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input type="tel" name="mobile_number" id="mobile_number" defaultValue={profile?.mobile_number || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="border-t pt-6">
               <h3 className="text-lg font-medium">Shipping Address</h3>
               <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input type="text" name="street" id="street" defaultValue={address.street} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" id="city" defaultValue={address.city} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <input type="text" name="state" id="state" defaultValue={address.state} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                   <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" name="postalCode" id="postalCode" defaultValue={address.postalCode} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" name="country" id="country" defaultValue={address.country} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
               </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700">Save Changes</button>
            </div>
          </form>
        </div>
        <form action={signOut}>
            <div className="mt-8 text-center">
              <button type="submit" className="text-sm text-red-600 hover:underline">Log Out</button>
            </div>
        </form>
      </div>
    </div>
  );
            }
