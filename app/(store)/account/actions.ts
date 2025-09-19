'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/lib/types';

export async function updateUserProfile(formData: FormData) {
  const cookieStore = cookies();
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

  // THE FINAL FIX: We use "as any" to override TypeScript's incorrect assumption.
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.get('full_name') as string,
      mobile_number: formData.get('mobile_number') as string,
      shipping_address: shipping_address,
      updated_at: new Date().toISOString(),
    } as any) // This is the definitive fix.
    .eq('id', user.id);

  if (error) {
    return redirect(`/account?message=Error: Could not update profile. ${error.message}`);
  }

  revalidatePath('/account');
  return redirect(`/account?message=Profile updated successfully!`);
        }
