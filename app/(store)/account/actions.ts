'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// This is a secure server function that will update the user's profile.
export async function updateUserProfile(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  // Get the current user's session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'You must be logged in to update your profile.' };
  }

  // Get the form data
  const fullName = formData.get('full_name') as string;
  const mobileNumber = formData.get('mobile_number') as string;

  // Reconstruct the nested address object
  const shipping_address = {
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postalCode: formData.get('postalCode') as string,
    country: formData.get('country') as string,
  };

  // Update the 'profiles' table in the database
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      mobile_number: mobileNumber,
      shipping_address: shipping_address,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, message: `Failed to update profile: ${error.message}` };
  }

  // Refresh the account page to show the new data
  revalidatePath('/account');
  return { success: true, message: 'Profile updated successfully!' };
    }
