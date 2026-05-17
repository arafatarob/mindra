import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findLocalUserByUsername } from '@/lib/localAuth';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { username, password } = (body || {}) as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    // Use the centralized helper which points to the correct 'local_users' collection
    // and includes proper regex escaping for security.
    const user = await findLocalUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Ensure password exists in the database document
    if (!user.password) {
      return NextResponse.json({ error: 'User account is malformed. Please contact support.' }, { status: 500 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { 
        name: user.name || '', 
        username: user.username, 
        role: user.role || 'user', 
        plan: user.plan || 'Free', 
        profileImage: user.profileImage || '' 
      },
    });
    response.cookies.set('authToken', username, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error. Please try again.' 
      }, 
      { status: 500 }
    );
  }
}
