'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const countries = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CountryCodeSelector({ value, onChange }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedCountry = countries.find(c => c.code === value) || countries[0];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-between w-full h-10 pl-3 pr-2 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCountry.flag} {selectedCountry.code}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          {countries.map((country) => (
            <li
              key={country.name}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
            >
              <span>{country.flag}</span>
              <span className="ml-3">{country.name} ({country.code})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Step 3. Save the File**
1.  Click the green **"Commit changes"** button.

---

### Part 2: Update the Server Action (`actions.ts`)

Now, we need to teach our server how to handle the separate country code and local number.

**Step 1. Edit the `actions.ts` File**
1.  Navigate to `app` -> `(store)` -> `account` -> **`actions.ts`**.
2.  Click the **pencil icon** to edit the file.

**Step 2. Replace the Code**
1.  **DELETE all of the old code**.
2.  **REPLACE it with this new version.** The key change is that it now combines the country code and local number into one string before saving.

    ```typescript
    'use server';

    import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
    import { cookies } from 'next/headers';
    import { revalidatePath } from 'next/cache';
    import { redirect } from 'next/navigation';

    export async function updateUserProfile(formData: FormData) {
      const supabase = createServerActionClient({ cookies });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return redirect('/login');
      }
      
      const countryCode = formData.get('country_code') as string;
      const localNumber = formData.get('local_number') as string;
      
      // Combine the country code and local number into one string for the database
      const fullMobileNumber = `${countryCode} ${localNumber}`;

      const shipping_address = {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postalCode: formData.get('postalCode') as string,
        country: formData.get('country') as string,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.get('full_name') as string,
          mobile_number: fullMobileNumber, // Save the combined number
          shipping_address: shipping_address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return redirect(`/account?message=Error: Could not update profile.`);
      }
      
      revalidatePath('/account');
      return redirect(`/account?message=Profile updated successfully!`);
    }
    ```

**Step 3. Save the Changes**
1.  Click the green **"Commit changes"** button.

---

### Part 3: Update the Account Page (`page.tsx`)

Finally, let's add the new component to our form.

**Step 1. Edit the `page.tsx` File**
1.  Navigate to `app` -> `(store)` -> `account` -> **`page.tsx`**.
2.  Click the **pencil icon** to edit the file.

**Step 2. Replace the Code**
1.  **DELETE all of the old code**.
2.  **REPLACE it with this final version.** This code splits the mobile number into two parts and uses our new component.

    ```typescript
    'use client';

    import { useEffect, useState, useCallback, useTransition } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useRouter, useSearchParams } from 'next/navigation';
    import { User } from '@supabase/supabase-js';
    import toast from 'react-hot-toast';
    import CountryCodeSelector from '@/components/ui/CountryCodeSelector'; // Import the new component
    import { updateUserProfile } from './actions'; // We will use the action directly

    // A helper function to parse the mobile number
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

        const [user, setUser] = useState<User | null>(null);
        const [fullName, setFullName] = useState('');
        const [countryCode, setCountryCode] = useState('+91');
        const [localNumber, setLocalNumber] = useState('');
        const [address, setAddress] = useState({ street: '', city: '', state: '', postalCode: '', country: '' });
        const [loading, setLoading] = useState(true);
        
        // Display success/error messages from the server action
        useEffect(() => {
            const message = searchParams.get('message');
            if (message) {
              if(message.startsWith('Error')) {
                toast.error(message);
              } else {
                toast.success(message);
              }
              // Clean the URL
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
                                <input type="text" name="full_name" id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <div className="mt-1 flex gap-2">
                                    <div className="w-1/3">
                                        <input type="hidden" name="country_code" value={countryCode} />
                                        <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                                    </div>
                                    <div className="w-2/3">
                                        <input type="tel" name="local_number" id="local_number" value={localNumber} onChange={(e) => setLocalNumber(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t pt-6">
                               <h3 className="text-lg font-medium">Shipping Address</h3>
                               <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                  <div className="sm:col-span-2"><label htmlFor="street">Street</label><input type="text" name="street" value={address.street} onChange={handleAddressChange} /></div>
                                  <div><label htmlFor="city">City</label><input type="text" name="city" value={address.city} onChange={handleAddressChange} /></div>
                                  <div><label htmlFor="state">State</label><input type="text" name="state" value={address.state} onChange={handleAddressChange} /></div>
                                  <div><label htmlFor="postalCode">Postal Code</label><input type="text" name="postalCode" value={address.postalCode} onChange={handleAddressChange} /></div>
                                  <div><label htmlFor="country">Country</label><input type="text" name="country" value={address.country} onChange={handleAddressChange} /></div>
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
    
