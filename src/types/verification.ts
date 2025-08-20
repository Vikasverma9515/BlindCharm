// types/verification.ts
export interface VerificationResult {
  isReal: boolean;
  gender: 'male' | 'female' | 'unknown';
  confidence: number;
  age?: number;
  faceDescriptor?: number[];
}

export interface VerificationAttempt {
  id: string;
  user_id: string;
  verification_successful: boolean;
  confidence_score: number;
  detected_gender: string | null;
  detected_age: number | null;
  face_descriptor: string | null;
  created_at: string;
}

export interface FaceDetectionData {
  detection: any;
  landmarks: any;
  descriptor: number[];
  age: number;
  gender: string;
  genderProbability: number;
}