'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Database } from '@/lib/types';

// Use the official "Row" type directly from our master dictionary (lib/types.ts)
type Profile = Database['public']['Tables']['profiles']['Row'];

// A helper type for the address object, used for safety
type Address = {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export default function AccountPage() {
  const router = useRouter();
  // Initialize the state with the correct structure and null values
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (currentUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*') // Select all columns from the profiles table
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Could not fetch your profile.');
    } else if (data) {
      // The data is now guaranteed to match the Profile type
      setProfile(data);
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
  
  // A safer way to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => {
        if (!prevProfile) return null;
        
        // Check if the input is for a shipping address field
        const addressKeys: (keyof Address)[] = ['street', 'city', 'state', 'postalCode', 'country'];
        if (addressKeys.includes(name as keyof Address)) {
            const currentAddress = (prevProfile.shipping_address as Address) || {};
            return {
                ...prevProfile,
                shipping_address: { ...currentAddress, [name]: value }
            };
        }
        
        return { ...prevProfile, [name]: value };
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const toastId = toast.loading('Updating profile...');
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        mobile_number: profile.mobile_number,
        shipping_address: profile.shipping_address,
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
  
  if (loading || !profile) {
    return <div className="text-center py-20">Loading your account details...</div>;
  }
  
  // Helper to safely access address properties
  const getAddress = (): Address => {
      if (profile.shipping_address && typeof profile.shipping_address === 'object' && !Array.isArray(profile.shipping_address)) {
          return profile.shipping_address as Address;
      }
      return { street: '', city: '', state: '', postalCode: '', country: '' };
  }
  const address = getAddress();

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
              <input type="text" name="full_name" id="full_name" value={profile.full_name || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input type="tel" name="mobile_number" id="mobile_number" value={profile.mobile_number || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="border-t pt-6">
               <h3 className="text-lg font-medium">Shipping Address</h3>
               <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input type="text" name="street" id="street" value={address.street || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" id="city" value={address.city || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <input type="text" name="state" id="state" value={address.state || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                   <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" name="postalCode" id="postalCode" value={address.postalCode || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" name="country" id="country" value={address.country || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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
