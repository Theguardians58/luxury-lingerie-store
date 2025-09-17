import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types'; // We will create this types.ts file next

// This creates a Supabase client that can be used throughout your app.
export const supabase = createPagesBrowserClient<Database>();
