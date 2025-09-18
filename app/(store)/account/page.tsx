'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Define the structure of our address object
interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Define the structure of the user's profile data
interface Profile {
  full_name: string;
  mobile_number: string;
  shipping_address: Address;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    mobile_number: '',
    shipping_address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch the user's profile data from the database
  const getProfile = useCallback(async (currentUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
.select('full_name, mobile_number, shipping_address')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Could not fetch your profile.');
    } else if (data) {
      // Set the profile state with the fetched data
      setProfile({
        full_name: data.full_name || '',
        mobile_number: data.mobile_number || '',
        // Ensure shipping_address is an object, even if it's null in the DB
        shipping_address: data.shipping_address || { street: '', city: '', state: '', postalCode: '', country: '' },
      });
    }
    setLoading(false);
  }, []);

  // useEffect runs when the page loads
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no user is logged in, redirect to the login page
        router.push('/login');
      } else {
        setUser(session.user);
        getProfile(session.user);
      }
    };
    checkUser();
  }, [router, getProfile]);

  // Handle changes in the form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in profile.shipping_address) {
      setProfile(prev => ({ ...prev, shipping_address: { ...prev.shipping_address, [name]: value } }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  // Function to update the user's profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      toast.error('Failed to update profile.', { id: toastId });
    } else {
      toast.success('Profile updated successfully!', { id: toastId });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Show a loading message while fetching data
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
                    <input type="text" name="street" id="street" value={profile.shipping_address.street} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" id="city" value={profile.shipping_address.city} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <input type="text" name="state" id="state" value={profile.shipping_address.state} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                   <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" name="postalCode" id="postalCode" value={profile.shipping_address.postalCode} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" name="country" id="country" value={profile.shipping_address.country} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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
