// lib/services/CollegeVerificationService.ts
import { supabase } from '@/lib/supabase';
import { zeptoMail } from '@/lib/zepto-mail';

interface CollegeInfo {
  name: string;
  domains: string[];
}

class CollegeVerificationService {
  // Common college domains (you can expand this list)
  private collegeDatabase: CollegeInfo[] = [
    { name: "Indian Institute of Technology", domains: ["iitd.ac.in", "iitb.ac.in", "iitm.ac.in", "iitk.ac.in", "iitg.ac.in"] },
    { name: "Indian Institute of Management", domains: ["iima.ac.in", "iimb.ac.in", "iimc.ac.in"] },
    { name: "Delhi University", domains: ["du.ac.in"] },
    { name: "Jawaharlal Nehru University", domains: ["jnu.ac.in"] },
    { name: "University of Mumbai", domains: ["mu.ac.in"] },
    { name: "Tata Institute of Social Sciences", domains: ["tiss.edu"] },
    { name: "Birla Institute of Technology and Science", domains: ["bits-pilani.ac.in"] },
    { name: "Indian Statistical Institute", domains: ["isical.ac.in"] },
    { name: "National Institute of Technology", domains: ["nit.ac.in"] },
    { name: "Thapar University", domains: ["thapar.edu"] }
    // Add more colleges as needed
  ];

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private isValidCollegeEmail(email: string): { isValid: boolean; collegeName?: string } {
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return { isValid: false };
    }

    // Check if it ends with .edu or .ac.in (common academic domains)
    if (domain.endsWith('.edu') || domain.endsWith('.ac.in')) {
      // Try to find specific college
      const college = this.collegeDatabase.find(c => 
        c.domains.some(d => d.toLowerCase() === domain)
      );
      
      return {
        isValid: true,
        collegeName: college?.name || this.formatCollegeName(domain)
      };
    }

    // Check specific college domains
    const college = this.collegeDatabase.find(c => 
      c.domains.some(d => d.toLowerCase() === domain)
    );

    if (college) {
      return { isValid: true, collegeName: college.name };
    }

    return { isValid: false };
  }

  private formatCollegeName(domain: string): string {
    // Convert domain to readable college name
    return domain
      .replace('.edu', '')
      .replace('.ac.in', '')
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async initiateVerification(userId: string, collegeEmail: string) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(collegeEmail)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Check if it's a valid college email
      const { isValid, collegeName } = this.isValidCollegeEmail(collegeEmail);
      if (!isValid) {
        return { 
          success: false, 
          error: 'Please use your official college email address (ending with .edu, .ac.in, or recognized institution domain)' 
        };
      }

      // Check if this email is already verified by another user
      const { data: existingVerification } = await supabase
        .from('users')
        .select('id')
        .eq('college_email', collegeEmail)
        .eq('college_verified', true)
        .neq('id', userId)
        .single();

      if (existingVerification) {
        return { 
          success: false, 
          error: 'This college email is already verified by another user' 
        };
      }

      // Generate OTP and expiry
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification attempt
      const { error: dbError } = await supabase
        .from('college_verification_attempts')
        .insert({
          user_id: userId,
          college_email: collegeEmail,
          college_name: collegeName,
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
        });

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, error: 'Failed to initiate verification' };
      }

      // Send OTP email
      const emailResult = await zeptoMail.sendEmail({
        to: collegeEmail,
        subject: `🎓 BlindCharm College Verification - Your OTP: ${otp}`,
        htmlContent: zeptoMail.generateOTPEmailTemplate(otp, collegeName),
      });

      if (!emailResult.success) {
        console.error('Email send error:', emailResult.error);
        return { success: false, error: 'Failed to send verification email' };
      }

      return { 
        success: true, 
        message: `Verification code sent to ${collegeEmail}`,
        collegeName 
      };

    } catch (error) {
      console.error('Verification initiation error:', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  }

//   async verifyOTP(userId: string, collegeEmail: string, enteredOTP: string) {
//     try {
//       // Get the latest verification attempt
//       const { data: attempt, error: fetchError } = await supabase
//         .from('college_verification_attempts')
//         .select('*')
//         .eq('user_id', userId)
//         .eq('college_email', collegeEmail)
//         .eq('verified', false)
//         .order('created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (fetchError || !attempt) {
//         return { success: false, error: 'No pending verification found. Please request a new code.' };
//       }

//       // Check if OTP has expired
//       if (new Date() > new Date(attempt.otp_expires_at)) {
//         return { success: false, error: 'Verification code has expired. Please request a new one.' };
//       }

//       // Check if OTP matches
//       if (attempt.otp_code !== enteredOTP) {
//         // Update attempts count
//         await supabase
//           .from('college_verification_attempts')
//           .update({ attempts_count: (attempt.attempts_count || 0) + 1 })
//           .eq('id', attempt.id);

//         return { success: false, error: 'Invalid verification code. Please try again.' };
//       }

//       // Mark verification as successful
//       const now = new Date().toISOString();
      
//       // Update verification attempt
//       await supabase
//         .from('college_verification_attempts')
//         .update({ 
//           verified: true, 
//           verified_at: now 
//         })
//         .eq('id', attempt.id);

//       // Update user record
//       const { error: userUpdateError } = await supabase
//         .from('users')
//         .update({
//           college_email: collegeEmail,
//           college_name: attempt.college_name,
//           college_verified: true,
//           college_verified_at: now
//         })
//         .eq('id', userId);

//       if (userUpdateError) {
//         console.error('User update error:', userUpdateError);
//         return { success: false, error: 'Failed to update verification status' };
//       }

//       return { 
//         success: true, 
//         message: `🎉 College verified successfully! Welcome to BlindCharm, ${attempt.college_name} student!`,
//         collegeName: attempt.college_name
//       };

//     } catch (error) {
//       console.error('OTP verification error:', error);
//       return { success: false, error: 'Something went wrong. Please try again.' };
//     }
//   }

async verifyOTP(userId: string, collegeEmail: string, enteredOTP: string) {
  try {
    // Get the latest verification attempt
    const { data: attempt, error: fetchError } = await supabase
      .from('college_verification_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('college_email', collegeEmail)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !attempt) {
      return { success: false, error: 'No pending verification found. Please request a new code.' };
    }

    // Fix: Convert timestamps to proper Date objects and compare properly
    const now = new Date();
    const expiresAt = new Date(attempt.otp_expires_at);
    
    console.log('🕐 Current time (UTC):', now.toISOString());
    console.log('🕐 OTP expires at (UTC):', expiresAt.toISOString());
    console.log('🕐 Time difference (minutes):', (expiresAt.getTime() - now.getTime()) / (1000 * 60));

    // Check if OTP has expired
    if (now > expiresAt) {
      console.log('❌ OTP has expired');
      return { success: false, error: 'Verification code has expired. Please request a new one.' };
    }

    // Check if OTP matches
    if (attempt.otp_code !== enteredOTP) {
      // Update attempts count
      await supabase
        .from('college_verification_attempts')
        .update({ attempts_count: (attempt.attempts_count || 0) + 1 })
        .eq('id', attempt.id);

      return { success: false, error: 'Invalid verification code. Please try again.' };
    }

    // Mark verification as successful
    const nowISO = now.toISOString();
    
    // Update verification attempt
    await supabase
      .from('college_verification_attempts')
      .update({ 
        verified: true, 
        verified_at: nowISO 
      })
      .eq('id', attempt.id);

    // Update user record
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        college_email: collegeEmail,
        college_name: attempt.college_name,
        college_verified: true,
        college_verified_at: nowISO
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('User update error:', userUpdateError);
      return { success: false, error: 'Failed to update verification status' };
    }

    return { 
      success: true, 
      message: `🎉 College verified successfully! Welcome to BlindCharm, ${attempt.college_name} student!`,
      collegeName: attempt.college_name
    };

  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

  async getVerificationStatus(userId: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('college_email, college_name, college_verified, college_verified_at')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: 'Failed to fetch verification status' };
      }

      return {
        success: true,
        data: {
          collegeEmail: user.college_email,
          collegeName: user.college_name,
          isVerified: user.college_verified || false,
          verifiedAt: user.college_verified_at
        }
      };
    } catch (error) {
      console.error('Get verification status error:', error);
      return { success: false, error: 'Failed to fetch verification status' };
    }
  }
}

export const collegeVerificationService = new CollegeVerificationService();