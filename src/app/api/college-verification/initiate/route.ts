// app/api/college-verification/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { collegeVerificationService } from '@/lib/services/CollegeVerificationService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { collegeEmail } = await request.json();

    if (!collegeEmail) {
      return NextResponse.json(
        { success: false, error: 'College email is required' },
        { status: 400 }
      );
    }

    const result = await collegeVerificationService.initiateVerification(
      session.user.id,
      collegeEmail.toLowerCase().trim()
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Initiate verification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}