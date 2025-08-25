import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RekognitionClient, CompareFacesCommand, DetectFacesCommand } from '@aws-sdk/client-rekognition';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;

  try {
    const formData = await request.formData();
    const profilePhoto = formData.get('profilePhoto') as File;
    const livePhoto = formData.get('livePhoto') as File;
    userId = formData.get('userId') as string;

    console.log('🔍 AWS Face verification started');
    console.log('📷 Profile photo:', profilePhoto ? `${profilePhoto.size} bytes, ${profilePhoto.type}` : 'missing');
    console.log('📸 Live photo:', livePhoto ? `${livePhoto.size} bytes, ${livePhoto.type}` : 'missing');

    if (!profilePhoto || !livePhoto || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user exists in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, profile_picture')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.log('❌ User not found:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.id);

    // Convert images to Uint8Array for AWS
    const profilePhotoBuffer = new Uint8Array(await profilePhoto.arrayBuffer());
    const livePhotoBuffer = new Uint8Array(await livePhoto.arrayBuffer());

    console.log('🔄 Buffers created:', profilePhotoBuffer.length, 'and', livePhotoBuffer.length, 'bytes');

    // Step 1: Detect faces in both images first (optional but good for debugging)
    console.log('🔍 Detecting faces in both images...');
    const [profileFaces, liveFaces] = await Promise.all([
      detectFaces(profilePhotoBuffer, 'profile'),
      detectFaces(livePhotoBuffer, 'live')
    ]);

    if (!profileFaces || !liveFaces) {
      const processingTime = Date.now() - startTime;
      const errorMsg = `No face detected in ${!profileFaces ? 'profile photo' : ''} ${!profileFaces && !liveFaces ? 'and ' : ''}${!liveFaces ? 'live photo' : ''}`;
      
      console.log('❌ ' + errorMsg);
      await logVerificationAttempt(userId, false, 0, errorMsg, processingTime);
      
      return NextResponse.json(
        { error: 'No face detected in one or both images. Please ensure your face is clearly visible and well-lit.' },
        { status: 400 }
      );
    }

    console.log('✅ Faces detected in both images');

    // Step 2: Compare faces using AWS Rekognition
    console.log('🔄 Comparing faces with AWS Rekognition...');
    
    const compareCommand = new CompareFacesCommand({
      SourceImage: { Bytes: profilePhotoBuffer },
      TargetImage: { Bytes: livePhotoBuffer },
      SimilarityThreshold: 60, // Lower threshold for initial detection
    });

    const compareResult = await rekognitionClient.send(compareCommand);
    
    console.log('📊 AWS Rekognition comparison result:', {
      faceMatches: compareResult.FaceMatches?.length || 0,
      unmatched: compareResult.UnmatchedFaces?.length || 0,
      sourceImageFace: !!compareResult.SourceImageFace,
      sourceImageOrientationCorrection: compareResult.SourceImageOrientationCorrection,
      targetImageOrientationCorrection: compareResult.TargetImageOrientationCorrection
    });

    // Process results
    const faceMatches = compareResult.FaceMatches || [];
    const hasMatch = faceMatches.length > 0;
    const confidence = hasMatch ? faceMatches[0].Similarity || 0 : 0;
    const isVerified = hasMatch && confidence >= 75; // 75% threshold for verification

    const processingTime = Date.now() - startTime;

    console.log('📋 Final verification results:', {
      hasMatch,
      confidence: confidence.toFixed(2) + '%',
      isVerified,
      processingTimeMs: processingTime,
      threshold: '75%'
    });

    // Log attempt in database
    await logVerificationAttempt(userId, isVerified, confidence, undefined, processingTime);

    // Update user verification status if successful
    if (isVerified) {
      console.log('✅ Updating user verification status...');
      await supabase
        .from('users')
        .update({
          face_verified: true,
          face_verified_at: new Date().toISOString(),
          face_verification_score: confidence
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: isVerified,
      confidence: confidence,
      message: isVerified 
        ? 'Face verification successful! Your profile is now verified.' 
        : `Verification failed. Face match confidence: ${confidence.toFixed(1)}%. Please try again with better lighting and ensure your face is clearly visible.`
    });

  } catch (error) {
    console.error('❌ AWS Face verification error:', error);
    
    let errorMessage = 'Face verification failed';
    if (error instanceof Error) {
      if (error.name === 'InvalidImageFormatException') {
        errorMessage = 'Invalid image format. Please use JPEG or PNG images.';
      } else if (error.name === 'ImageTooLargeException') {
        errorMessage = 'Image is too large. Please use images smaller than 5MB.';
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = 'Invalid image. Please ensure the image contains a clear face.';
      } else {
        errorMessage = error.message;
      }
    }
    
    if (userId) {
      const processingTime = Date.now() - startTime;
      await logVerificationAttempt(userId, false, 0, errorMessage, processingTime);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to detect faces in an image
async function detectFaces(imageBuffer: Uint8Array, imageName: string) {
  try {
    console.log(`🔍 Detecting faces in ${imageName} image (${imageBuffer.length} bytes)...`);
    
    const detectCommand = new DetectFacesCommand({
      Image: { Bytes: imageBuffer },
      Attributes: ['DEFAULT'] // Get basic face attributes
    });

    const detectResult = await rekognitionClient.send(detectCommand);
    const faces = detectResult.FaceDetails || [];
    const faceCount = faces.length;

    console.log(`👤 Face detection results for ${imageName}:`, {
      facesFound: faceCount,
      imageOrientation: detectResult.OrientationCorrection || 'none'
    });

    if (faceCount === 0) {
      console.log(`❌ No faces found in ${imageName} image`);
      return null;
    }

    if (faceCount > 1) {
      console.log(`⚠️ Multiple faces detected in ${imageName}: ${faceCount} faces found`);
      // Don't fail for multiple faces, just log warning
    }

    // Log details of the primary face
    if (faces[0]) {
      const face = faces[0];
      console.log(`✅ Primary face in ${imageName}:`, {
        confidence: face.Confidence?.toFixed(2) + '%',
        boundingBox: face.BoundingBox,
        ageRange: face.AgeRange ? `${face.AgeRange.Low}-${face.AgeRange.High}` : 'unknown',
        gender: face.Gender?.Value || 'unknown'
      });
    }

    return faces;
  } catch (error) {
    console.error(`❌ Face detection error for ${imageName}:`, error);
    return null;
  }
}

// Helper function to log verification attempt
async function logVerificationAttempt(
  userId: string, 
  success: boolean, 
  confidence: number, 
  errorMessage?: string,
  processingTimeMs?: number
) {
  try {
    const { error } = await supabase
      .from('face_verification_attempts')
      .insert({
        user_id: userId,
        profile_photo_url: 'aws_rekognition_profile',
        live_photo_url: 'aws_rekognition_live',
        confidence_score: confidence,
        success,
        error_message: errorMessage || null,
        processing_time_ms: processingTimeMs || null
      });

    if (error) {
      console.error('❌ Database logging error:', error);
    } else {
      console.log('✅ Verification attempt logged to database');
    }
  } catch (error) {
    console.error('❌ Error logging verification attempt:', error);
    // Don't throw here - logging failure shouldn't break the main flow
  }
}