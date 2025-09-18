'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import CountryCodeSelector from '@/components/ui/CountryCodeSelector';
import { updateUserProfile } from './actions';

const parseMobileNumber = (fullNumber: string | null) => {
  if (!fullNumber) return { countryCode: '+91', localNumber: '' };
  const parts = fullNumber.split(' ');
  if (parts.length > 1 && parts[0].startsWith('+')) {
    return { countryCode: parts[0], localNumber: parts.slice(1).join(' ') };
  }
  return { countryCode: '+91', localNumber: fullNumber };
};

export default function AccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [user, setUser] = = useState<User | null>(null);
    const [fullName, setFullName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [localNumber, setLocalNumber] = useState('');
    const [address, setAddress] = useState({ street: '', city: '', state: '', postalCode: '', country: '' });
    const [loading, setLoading] = = useState(true);

    useEffect(() => {
        const message = searchParams.get('message');
        if (message) {
          if(message.startsWith('Error')) {
            toast.error(message);
          } else {
            toast.success(message);
          }
          router.replace('/account', { scroll: false });
        }
    }, [searchParams, router]);

    const getProfile = useCallback(async (currentUser: User) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setFullName(data.full_name || '');
          const { countryCode, localNumber } = parseMobileNumber(data.mobile_number);
          setCountryCode(countryCode);
          setLocalNumber(localNumber);
          setAddress((data.shipping_address as any) || { street: '', city: '', state: '', postalCode: '', country: '' });
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

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            await updateUserProfile(formData);
        });
    };

    if (loading) return <div className="text-center py-20">Loading your account details...</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto">
                {/* Message display is handled by toast notifications now */}
                <h1 className="text-3xl font-bold mb-2">My Account</h1>
                <p className="text-gray-600 mb-8">Manage your personal information and view your order history.</p>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                    <form action={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <p className="mt-1 text-gray-500">{user?.email}</p>
                        </div>
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="full_name" id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                        </div>
                        <div>
                            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <div className="mt-1 flex gap-2">
                                <div className="w-1/3">
                                    <input type="hidden" name="country_code" value={countryCode} />
                                    <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                                </div>
                                <div className="w-2/3">
                                    <input type="tel" name="local_number" id="local_number" value={localNumber} onChange={(e) => setLocalNumber(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                                </div>
                            </div>
                        </div>
                        <div className="border-t pt-6">
                           <h3 className="text-lg font-medium">Shipping Address</h3>
                           <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                              {/* --- THIS IS THE CORRECTED SECTION --- */}
                              <div className="sm:col-span-2">
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                                <input type="text" name="street" id="street" value={address.street} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                              </div>
                              <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" name="city" id="city" value={address.city} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                              </div>
                              <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                <input type="text" name="state" id="state" value={address.state} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                              </div>
                              <div>
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                <input type="text" name="postalCode" id="postalCode" value={address.postalCode} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                              </div>
                              <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                <input type="text" name="country" id="country" value={address.country} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500" />
                              </div>
                           </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isPending} className="bg-gray-800 text-white py-2 px-6 rounded-md hover:bg-gray-700 disabled:bg-gray-400">
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
          }
