'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/types';

export async function updateUserProfile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>({ cookies: { get: (name) => cookieStore.get(name)?.value } });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const shipping_address = {
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postalCode: formData.get('postalCode') as string,
    country: formData.get('country') as string,
  };

  // THE FINAL FIX: We call our custom database function instead of using .update()
  const { error } = await supabase
    .rpc('update_user_profile', {
      full_name_in: formData.get('full_name') as string,
      mobile_number_in: formData.get('mobile_number') as string,
      shipping_address_in: shipping_address
    });

  if (error) {
    console.error('RPC Error:', error);
    return redirect(`/account?message=Error: Could not update profile.`);
  }

  revalidatePath('/account');
  return redirect(`/account?message=Profile updated successfully!`);
    }
