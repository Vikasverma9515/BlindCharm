// lib/verificationService.ts
import { supabase } from '@/lib/supabase';
import { VerificationAttempt, VerificationResult } from '@/types/verification';

export class VerificationService {
  static async saveVerificationAttempt(
    userId: string, 
    result: VerificationResult,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Insert verification attempt
      const { error: insertError } = await supabase
        .from('face_verifications')
        .insert({
          user_id: userId,
          verification_successful: result.isReal && result.confidence > 0.7,
          confidence_score: result.confidence,
          detected_gender: result.gender !== 'unknown' ? result.gender : null,
          detected_age: result.age || null,
          face_descriptor: result.faceDescriptor ? JSON.stringify(result.faceDescriptor) : null,
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (insertError) {
        console.error('Error saving verification attempt:', insertError);
        return { success: false, error: insertError.message };
      }

      // Update user verification status if successful
      if (result.isReal && result.confidence > 0.7) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
            verification_confidence: result.confidence,
            detected_gender: result.gender !== 'unknown' ? result.gender : null,
            detected_age: result.age || null
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user verification status:', updateError);
          return { success: false, error: updateError.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Verification service error:', error);
      return { success: false, error: 'Failed to save verification' };
    }
  }

  static async getVerificationHistory(userId: string): Promise<VerificationAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('face_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verification history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVerificationHistory:', error);
      return [];
    }
  }

  static async isUserVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_verified')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking verification status:', error);
        return false;
      }

      return data?.is_verified || false;
    } catch (error) {
      console.error('Error in isUserVerified:', error);
      return false;
    }
  }
}