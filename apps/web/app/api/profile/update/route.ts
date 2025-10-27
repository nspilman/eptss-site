import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@eptss/data-access/utils/supabase/server';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await getAuthUser();
    const body = await request.json();
    const { username } = body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 2) {
      return NextResponse.json(
        { error: 'Username must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (trimmedUsername.length > 50) {
      return NextResponse.json(
        { error: 'Username must be less than 50 characters' },
        { status: 400 }
      );
    }

    // Update user in database
    const { data, error } = await supabase
      .from('users')
      //@ts-ignore
      .update({ username: trimmedUsername })
      .eq('userid', userId)
      .select()
      .single();

    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
      
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: data 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
