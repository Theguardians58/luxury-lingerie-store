'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Database } from '@/lib/types'; // <-- IMPORTANT: We import the main Database type

// Define the exact shape of a profile row from our Database types
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Define the structure of our address object
interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Define the structure of the user's profile data for our form state
interface Profile {
  full_name: string;
  mobile_number: string | null; // Can be null
  shipping_address: Address | null; // Can be null
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
      // --- THIS IS THE CRUCIAL FIX ---
      // We explicitly tell TypeScript that 'data' has the shape of a 'ProfileRow'.
      const profileData = data as ProfileRow;

      setProfile({
        full_name: profileData.full_name || '',
        mobile_number: profileData.mobile_number || '',
        // Ensure shipping_address is an object, even if it's null in the DB
        shipping_address: (profileData.shipping_address as Address) || { street: '', city: '', state: '', postalCode: '', country: '' },
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
    if (profile.shipping_address && name in profile.shipping_address) {
        setProfile(prev => ({ 
            ...prev, 
            shipping_address: { ...(prev.shipping_address as Address), [name]: value } 
        }));
    } else {
        setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

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
              <p className="mt-1 text-gray-500">{user
