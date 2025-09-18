'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// A simple, "flat" state to hold all our form data. This avoids complex objects.
interface ProfileState {
  full_name: string;
  mobile_number: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileState>({
    full_name: '',
    mobile_number: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (currentUser: User) => {
    // We explicitly tell TypeScript what kind of data to expect here.
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, mobile_number, shipping_address')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      // This is the safest way to handle the data to prevent type errors.
      // We check each property and provide a default empty value.
      const address = (data.shipping_address as any) || {};
      setProfile({
        full_name: data.full_name || '',
        mobile_number: data.mobile_number || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        getProfile(session.user);
      }
    };
    checkUser();
  }, [router, getProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const toastId = toast.loading('Updating profile...');

    // We "reconstruct" the nested address object here, which is safe.
    const { full_name, mobile_number, street, city, state, postalCode, country } = profile;
    const shipping_address = { street, city, state, postalCode, country };

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name,
        mobile_number,
        shipping_address, // Send the reconstructed object
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      toast.error(`Failed to update profile: ${error.message}`, { id: toastId });
    } else {
      toast.success('Profile updated successfully!', { id: toastId });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <div className="text-center py-20">Loading your account details...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-gray-600 mb-8">Manage your personal information and view your order history.</p>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <p className="mt-1 text-gray-500">{user?.email}</p>
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="full_name" id="full_name" value={profile.full_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input type="tel" name="mobile_number" id="mobile_number" value={profile.mobile_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="border-t pt-6">
               <h3 className="text-lg font-medium">Shipping Address</h3>
               <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input type="text" name="street" id="street" value={profile.street} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" id="city" value={profile.city} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <input type="text" name="state" id="state" value={profile.state} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                   <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" name="postalCode" id="postalCode" value={profile.postalCode} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" name="country" id="country" value={profile.country} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
               </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700">Save Changes</button>
            </div>
          </form>
        </div>
        <div className="mt-8 text-center">
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Log Out</button>
        </div>
      </div>
    </div>
  );
                              }
