'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/types';

// This is the secure server function that will update the user's profile.
export async function updateUserProfile(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies });

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

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.get('full_name') as string,
      mobile_number: formData.get('mobile_number') as string,
      shipping_address: shipping_address,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return redirect(`/account?message=Error: Could not update profile. ${error.message}`);
  }

  revalidatePath('/account');
  return redirect(`/account?message=Profile updated successfully!`);
    }
