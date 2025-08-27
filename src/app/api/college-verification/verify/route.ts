// app/api/college-verification/verify/route.ts
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

    const { collegeEmail, otp } = await request.json();

    if (!collegeEmail || !otp) {
      return NextResponse.json(
        { success: false, error: 'College email and OTP are required' },
        { status: 400 }
      );
    }

    const result = await collegeVerificationService.verifyOTP(
      session.user.id,
      collegeEmail.toLowerCase().trim(),
      otp.trim()
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}