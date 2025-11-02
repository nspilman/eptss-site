import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import { createClient } from '@eptss/data-access/utils/supabase/server';
import {
  getUserPrivacySettings,
  updateUserPrivacySettings,
} from '@eptss/data-access';

// GET /api/profile/privacy - Get user's privacy settings
export async function GET(request: NextRequest) {
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

    // Get privacy settings
    const privacySettings = await getUserPrivacySettings(userId);

    return NextResponse.json({
      success: true,
      privacySettings,
    });

  } catch (error) {
    console.error('Get privacy settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/profile/privacy - Update user's privacy settings
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

    // Handle privacy settings update
    if (body.type === 'privacy_settings') {
      const {
        showStats,
        showSignups,
        showSubmissions,
        showVotes,
        showEmail,
        publicDisplayName,
        profileBio,
      } = body;

      // Validate inputs
      if (publicDisplayName && publicDisplayName.length > 100) {
        return NextResponse.json(
          { error: 'Display name must be less than 100 characters' },
          { status: 400 }
        );
      }

      if (profileBio && profileBio.length > 1000) {
        return NextResponse.json(
          { error: 'Bio must be less than 1000 characters' },
          { status: 400 }
        );
      }

      const updatedSettings = await updateUserPrivacySettings(userId, {
        showStats,
        showSignups,
        showSubmissions,
        showVotes,
        showEmail,
        publicDisplayName: publicDisplayName?.trim() || null,
        profileBio: profileBio?.trim() || null,
      });

      return NextResponse.json({
        success: true,
        privacySettings: updatedSettings,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Update privacy settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
