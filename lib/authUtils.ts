import { cookies } from 'next/headers';

export async function getSessionUser(): Promise<string | null> {
  const cookieStore = await cookies();
  // Use the 'authToken' cookie name consistently with the login route and middleware
  const token = cookieStore.get('authToken');
  
  // Since the current login implementation stores the username directly as a string,
  // we return the token value (the username) if it exists.
  return token?.value || null;
}