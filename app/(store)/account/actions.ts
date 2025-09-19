'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/types';

export async function updateUserProfile(formData: FormData) {
  const cookieStore = cookies();

  // --- THIS IS THE CRUCIAL FIX ---
  // We are now providing all 3 required arguments: URL, Key, and Options.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

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
    return redirect(`/account?message=Error: Could not update profile.`);
  }

  revalidatePath('/account');
  return redirect(`/account?message=Profile updated successfully!`);
    }
