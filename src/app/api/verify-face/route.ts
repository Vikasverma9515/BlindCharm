import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY!;
const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT!;

interface AzureFaceDetection {
  faceId: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface AzureFaceVerification {
  isIdentical: boolean;
  confidence: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;

  try {
    const formData = await request.formData();
    const profilePhoto = formData.get('profilePhoto') as File;
    const livePhoto = formData.get('livePhoto') as File;
    userId = formData.get('userId') as string;

    console.log('🔍 API: Face verification request received');
    console.log('📷 Profile photo:', profilePhoto ? `${profilePhoto.size} bytes, ${profilePhoto.type}` : 'missing');
    console.log('📸 Live photo:', livePhoto ? `${livePhoto.size} bytes, ${livePhoto.type}` : 'missing');
    console.log('👤 User ID:', userId);

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

    // Convert images to ArrayBuffer
    const profilePhotoBuffer = await profilePhoto.arrayBuffer();
    const livePhotoBuffer = await livePhoto.arrayBuffer();

    console.log('🔄 Converted to buffers:', profilePhotoBuffer.byteLength, 'and', livePhotoBuffer.byteLength, 'bytes');

    // Step 1: Detect faces in both images
    console.log('🔍 Detecting faces in profile photo...');
    const profileFaceId = await detectFace(profilePhotoBuffer, 'profile_photo');
    console.log('👤 Profile face ID:', profileFaceId ? '✅ detected' : '❌ not detected');

    console.log('🔍 Detecting faces in live photo...');
    const liveFaceId = await detectFace(livePhotoBuffer, 'live_photo');
    console.log('📸 Live face ID:', liveFaceId ? '✅ detected' : '❌ not detected');

    if (!profileFaceId || !liveFaceId) {
      const processingTime = Date.now() - startTime;
      const errorMsg = `Face detection failed: ${!profileFaceId ? 'profile photo' : ''} ${!profileFaceId && !liveFaceId ? 'and ' : ''}${!liveFaceId ? 'live photo' : ''}`;
      
      console.log('❌ ' + errorMsg);
      
      await logVerificationAttempt(
        userId, 
        false, 
        0, 
        errorMsg,
        user.profile_picture,
        processingTime
      );
      
      return NextResponse.json(
        { error: 'No face detected in one or both images' },
        { status: 400 }
      );
    }

    // Step 2: Compare faces
    console.log('🔄 Comparing faces...');
    const verification = await verifyFaces(profileFaceId, liveFaceId);
    
    const isVerified = verification.isIdentical && verification.confidence >= 0.7;
    const confidenceScore = verification.confidence * 100;
    const processingTime = Date.now() - startTime;

    console.log('📊 Verification result:', {
      isIdentical: verification.isIdentical,
      confidence: confidenceScore,
      isVerified
    });

    // Step 3: Log attempt in database
    await logVerificationAttempt(
      userId, 
      isVerified, 
      confidenceScore, 
      undefined,
      user.profile_picture,
      processingTime
    );

    // Step 4: Update user verification status if successful
    if (isVerified) {
      await supabase
        .from('users')
        .update({
          face_verified: true,
          face_verified_at: new Date().toISOString(),
          face_verification_score: confidenceScore
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: isVerified,
      confidence: confidenceScore,
      message: isVerified 
        ? 'Face verification successful!' 
        : `Verification failed. Confidence: ${confidenceScore.toFixed(1)}%`
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Face verification error:', error);
    
    if (userId) {
      try {
        await logVerificationAttempt(
          userId, 
          false, 
          0, 
          error instanceof Error ? error.message : 'Unknown error',
          undefined,
          processingTime
        );
      } catch (logError) {
        console.error('Error logging failed attempt:', logError);
      }
    }
    
    return NextResponse.json(
      { error: 'Face verification failed' },
      { status: 500 }
    );
  }
}

// Updated detectFace function with returnFaceId=true
async function detectFace(imageBuffer: ArrayBuffer, imageName: string = 'unknown'): Promise<string | null> {
  try {
    console.log(`🔍 Detecting face in ${imageName} - Buffer size: ${imageBuffer.byteLength} bytes`);
    
    const response = await fetch(
      `${AZURE_FACE_API_ENDPOINT}/face/v1.0/detect?returnFaceId=true`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBuffer
      }
    );

    console.log(`📊 Azure response for ${imageName}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Azure API error for ${imageName}:`, response.status, errorText);
      throw new Error(`Face detection failed: ${response.status} ${response.statusText}`);
    }

    const faces: AzureFaceDetection[] = await response.json();
    console.log(`👥 Faces detected in ${imageName}:`, faces.length);
    
    if (faces.length > 0) {
      console.log(`✅ Face details for ${imageName}:`, {
        faceId: faces[0].faceId,
        rectangle: faces[0].faceRectangle,
        hasValidFaceId: !!faces[0].faceId
      });
    }
    
    if (faces.length === 0) {
      console.log(`❌ No faces found in ${imageName}`);
      return null;
    }

    if (faces.length > 1) {
      console.log(`⚠️ Multiple faces detected in ${imageName}: ${faces.length}`);
      throw new Error('Multiple faces detected. Please ensure only one face is visible.');
    }

    if (!faces[0].faceId) {
      console.error(`❌ Face detected in ${imageName} but no faceId returned`);
      return null;
    }

    return faces[0].faceId;
  } catch (error) {
    console.error(`❌ Face detection error for ${imageName}:`, error);
    return null;
  }
}

// Rest of your helper functions remain the same...
async function verifyFaces(faceId1: string, faceId2: string): Promise<AzureFaceVerification> {
  try {
    const response = await fetch(
      `${AZURE_FACE_API_ENDPOINT}/face/v1.0/verify`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          faceId1,
          faceId2
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Azure Face Verification API error:', response.status, errorText);
      throw new Error(`Face verification failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
    } catch (error) {
    console.error('Face verification API call failed:', error);
    throw error;
  }
}

// Enhanced helper function to log verification attempt
async function logVerificationAttempt(
  userId: string, 
  success: boolean, 
  confidence: number, 
  errorMessage?: string,
  profilePhotoUrl?: string,
  processingTimeMs?: number
) {
  try {
    const { error } = await supabase
      .from('face_verification_attempts')
      .insert({
        user_id: userId,
        profile_photo_url: profilePhotoUrl || 'uploaded',
        live_photo_url: 'live_capture',
        confidence_score: confidence,
        success,
        error_message: errorMessage || null,
        processing_time_ms: processingTimeMs || null
      });

    if (error) {
      console.error('Supabase logging error:', error);
    } else {
      console.log('✅ Verification attempt logged successfully');
    }
  } catch (error) {
    console.error('Error logging verification attempt:', error);
    // Don't throw here - logging failure shouldn't break the main flow
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// // Initialize Supabase client with service role key
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY!;
// const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT!;

// interface AzureFaceDetection {
//   faceId: string;
//   faceRectangle: {
//     top: number;
//     left: number;
//     width: number;
//     height: number;
//   };
// }

// interface AzureFaceVerification {
//   isIdentical: boolean;
//   confidence: number;
// }

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   let userId: string | null = null;

//   try {
//     const formData = await request.formData();
//     const profilePhoto = formData.get('profilePhoto') as File;
//     const livePhoto = formData.get('livePhoto') as File;
//     userId = formData.get('userId') as string;

//     console.log('🔍 API: Face verification request received');
//     console.log('📷 Profile photo:', profilePhoto ? `${profilePhoto.size} bytes, ${profilePhoto.type}` : 'missing');
//     console.log('📸 Live photo:', livePhoto ? `${livePhoto.size} bytes, ${livePhoto.type}` : 'missing');

//     if (!profilePhoto || !livePhoto || !userId) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }
//     console.log('🔍 API: Received request');
//     console.log('📷 Profile photo:', profilePhoto ? `${profilePhoto.size} bytes, ${profilePhoto.type}` : 'missing');
//     console.log('📸 Live photo:', livePhoto ? `${livePhoto.size} bytes, ${livePhoto.type}` : 'missing');
//     console.log('👤 User ID:', userId);

//     if (!profilePhoto || !livePhoto || !userId) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Verify user exists in database
//     const { data: user, error: userError } = await supabase
//       .from('users')
//       .select('id, profile_picture')
//       .eq('id', userId)
//       .single();

//     if (userError || !user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }
// console.log('✅ User found:', user.id);

//     // Convert images to ArrayBuffer for Azure API
//     const profilePhotoBuffer = await profilePhoto.arrayBuffer();
//     const livePhotoBuffer = await livePhoto.arrayBuffer();

//     console.log('🔄 Converted to buffers:', profilePhotoBuffer.byteLength, 'and', livePhotoBuffer.byteLength, 'bytes');

//     // Step 1: Detect faces in both images
//     console.log('🔍 Detecting faces in profile photo...');
//     const profileFaceId = await detectFace(profilePhotoBuffer);
//     console.log('👤 Profile face ID:', profileFaceId ? 'detected' : 'not detected');

//     console.log('🔍 Detecting faces in live photo...');
//     const liveFaceId = await detectFace(livePhotoBuffer);
//      console.log('📸 Live face ID:', liveFaceId ? 'detected' : 'not detected');

//     if (!profileFaceId || !liveFaceId) {
//       const processingTime = Date.now() - startTime;
//       const errorMsg = `Face detection failed: ${!profileFaceId ? 'profile photo' : ''} ${!profileFaceId && !liveFaceId ? 'and ' : ''}${!liveFaceId ? 'live photo' : ''}`;
      
//       console.log('❌ ' + errorMsg);

//       // Log failed attempt in database
//       await logVerificationAttempt(
//         userId, 
//         false, 
//         0, 
//         errorMsg,
//         user.profile_picture,
//         processingTime
//       );

      
//       return NextResponse.json(
//         { error: 'No face detected in one or both images' },
//         { status: 400 }
//       );
//     }

//     // Step 2: Compare faces
//     const verification = await verifyFaces(profileFaceId, liveFaceId);
    
//     const isVerified = verification.isIdentical && verification.confidence >= 0.7; // 70% threshold
//     const confidenceScore = verification.confidence * 100; // Convert to percentage
//     const processingTime = Date.now() - startTime;

//     // Step 3: Log attempt in database
//     await logVerificationAttempt(
//       userId, 
//       isVerified, 
//       confidenceScore, 
//       undefined,
//       user.profile_picture,
//       processingTime
//     );

//     // Step 4: Update user verification status if successful
//     if (isVerified) {
//       await supabase
//         .from('users')
//         .update({
//           face_verified: true,
//           face_verified_at: new Date().toISOString(),
//           face_verification_score: confidenceScore
//         })
//         .eq('id', userId);
//     }

//     return NextResponse.json({
//       success: isVerified,
//       confidence: confidenceScore,
//       message: isVerified 
//         ? 'Face verification successful!' 
//         : `Verification failed. Confidence: ${confidenceScore.toFixed(1)}%`
//     });

//   } catch (error) {
//     const processingTime = Date.now() - startTime;
//     console.error('Face verification error:', error);
    
//     // Log the error attempt if we have a userId
//     if (userId) {
//       try {
//         await logVerificationAttempt(
//           userId, 
//           false, 
//           0, 
//           error instanceof Error ? error.message : 'Unknown error',
//           undefined,
//           processingTime
//         );
//       } catch (logError) {
//         console.error('Error logging failed attempt:', logError);
//       }
//     }
    
//     return NextResponse.json(
//       { error: 'Face verification failed' },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to detect face and get face ID with retry logic
// // async function detectFace(imageBuffer: ArrayBuffer, retries: number = 2): Promise<string | null> {
// //   for (let attempt = 0; attempt <= retries; attempt++) {
// //     try {
// //       const response = await fetch(
// //         `${AZURE_FACE_API_ENDPOINT}/face/v1.0/detect`,
// //         {
// //           method: 'POST',
// //           headers: {
// //             'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
// //             'Content-Type': 'application/octet-stream'
// //           },
// //           body: imageBuffer
// //         }
// //       );

// //       if (!response.ok) {
// //         // If it's a rate limit or server error, retry
// //         if ((response.status === 429 || response.status >= 500) && attempt < retries) {
// //           console.warn(`Azure API attempt ${attempt + 1} failed with status ${response.status}, retrying...`);
// //           await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
// //           continue;
// //         }
        
// //         const errorText = await response.text().catch(() => 'Unknown error');
// //         console.error('Azure Face API error:', response.status, errorText);
// //         throw new Error(`Face detection failed: ${response.status} ${response.statusText}`);
// //       }

// //       const faces: AzureFaceDetection[] = await response.json();
      
// //       if (faces.length === 0) {
// //         return null;
// //       }

// //       if (faces.length > 1) {
// //         throw new Error('Multiple faces detected. Please ensure only one face is visible.');
// //       }

// //       return faces[0].faceId;
// //     } catch (error) {
// //       console.error(`Face detection attempt ${attempt + 1} failed:`, error);
// //       if (attempt === retries) {
// //         return null;
// //       }
// //     }
// //   }
// //   return null;
// // }
// // In your /api/verify-face/route.ts, update the detectFace function:
// async function detectFace(imageBuffer: ArrayBuffer, imageName: string = 'unknown'): Promise<string | null> {
//   try {
//     console.log(`🔍 Detecting face in ${imageName} - Buffer size: ${imageBuffer.byteLength} bytes`);
    
//     const response = await fetch(
//       `${AZURE_FACE_API_ENDPOINT}/face/v1.0/detect?returnFaceId=true`, // ADD returnFaceId=true
//       {
//         method: 'POST',
//         headers: {
//           'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
//           'Content-Type': 'application/octet-stream'
//         },
//         body: imageBuffer
//       }
//     );

//     console.log(`📊 Azure response for ${imageName}: ${response.status} ${response.statusText}`);

//     if (!response.ok) {
//       const errorText = await response.text().catch(() => 'Unknown error');
//       console.error(`❌ Azure API error for ${imageName}:`, response.status, errorText);
//       throw new Error(`Face detection failed: ${response.status} ${response.statusText}`);
//     }

//     const faces: AzureFaceDetection[] = await response.json();
//     console.log(`👥 Faces detected in ${imageName}:`, faces.length);
    
//     if (faces.length > 0) {
//       console.log(`✅ Face details for ${imageName}:`, {
//         faceId: faces[0].faceId, // This should now have a value
//         rectangle: faces[0].faceRectangle,
//         hasValidFaceId: !!faces[0].faceId
//       });
//     }
    
//     if (faces.length === 0) {
//       console.log(`❌ No faces found in ${imageName}`);
//       return null;
//     }

//     if (faces.length > 1) {
//       console.log(`⚠️ Multiple faces detected in ${imageName}: ${faces.length}`);
//       throw new Error('Multiple faces detected. Please ensure only one face is visible.');
//     }

//     // Check if faceId is actually present
//     if (!faces[0].faceId) {
//       console.error(`❌ Face detected in ${imageName} but no faceId returned`);
//       return null;
//     }

//     return faces[0].faceId;
//   } catch (error) {
//     console.error(`❌ Face detection error for ${imageName}:`, error);
//     return null;
//   }
// }

// // Helper function to verify faces with enhanced error handling
// async function verifyFaces(faceId1: string, faceId2: string): Promise<AzureFaceVerification> {
//   try {
//     const response = await fetch(
//       `${AZURE_FACE_API_ENDPOINT}/face/v1.0/verify`,
//       {
//         method: 'POST',
//         headers: {
//           'Ocp-Apim-Subscription-Key': AZURE_FACE_API_KEY,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           faceId1,
//           faceId2
//         })
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text().catch(() => 'Unknown error');
//       console.error('Azure Face Verification API error:', response.status, errorText);
//       throw new Error(`Face verification failed: ${response.status} ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Face verification API call failed:', error);
//     throw error; // Re-throw to be handled by calling function
//   }
// }

// // Enhanced helper function to log verification attempt
// async function logVerificationAttempt(
//   userId: string, 
//   success: boolean, 
//   confidence: number, 
//   errorMessage?: string,
//   profilePhotoUrl?: string,
//   processingTimeMs?: number
// ) {
//   try {
//     const { error } = await supabase
//       .from('face_verification_attempts')
//       .insert({
//         user_id: userId,
//         profile_photo_url: profilePhotoUrl || 'uploaded',
//         live_photo_url: 'live_capture',
//         confidence_score: confidence,
//         success,
//         error_message: errorMessage || null,
//         processing_time_ms: processingTimeMs || null
//       });

//     if (error) {
//       console.error('Supabase logging error:', error);
//     }
//   } catch (error) {
//     console.error('Error logging verification attempt:', error);
//     // Don't throw here - logging failure shouldn't break the main flow
//   }
// }