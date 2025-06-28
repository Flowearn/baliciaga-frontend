import apiClient from './apiClient';

export interface UploadResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    imageUrl: string;
    imageKey: string;
  };
  error?: {
    message: string;
  };
}

/**
 * Upload a file to S3 for listings
 */
export const uploadListingPhoto = async (file: File): Promise<string> => {
  try {
    // Step 1: Get upload URL from backend
    const uploadUrlResponse = await apiClient.post('/listings/upload-url', {
      fileName: file.name,
      fileType: file.type
    });

    if (!uploadUrlResponse.data.success) {
      throw new Error(uploadUrlResponse.data.error?.message || 'Failed to get upload URL');
    }

    const { uploadUrl, imageUrl } = uploadUrlResponse.data.data;

    // Step 2: Upload file to S3 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Step 3: Return the public image URL
    return imageUrl;
  } catch (error) {
    console.error('Error uploading listing photo:', error);
    throw error;
  }
};

/**
 * Upload multiple files for listings
 */
export const uploadListingPhotos = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadListingPhoto(file));
  return Promise.all(uploadPromises);
};

/**
 * Upload avatar photo
 */
export const uploadAvatarPhoto = async (file: File): Promise<string> => {
  try {
    console.log('uploadAvatarPhoto - Starting upload process');
    console.log('uploadAvatarPhoto - File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Step 1: Get upload URL from backend
    const requestPayload = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    };
    
    console.log('uploadAvatarPhoto - Requesting upload URL with payload:', requestPayload);
    
    const uploadUrlResponse = await apiClient.post('/users/me/avatar-upload-url', requestPayload);
    
    console.log('uploadAvatarPhoto - Upload URL response:', uploadUrlResponse.data);

    if (!uploadUrlResponse.data.success) {
      throw new Error('Failed to get avatar upload URL');
    }

    const { uploadUrl, finalUrl } = uploadUrlResponse.data.data;
    
    console.log('uploadAvatarPhoto - Got upload URLs:', {
      uploadUrl: uploadUrl.substring(0, 100) + '...',
      finalUrl
    });

    // Step 2: Upload file to S3 using presigned URL
    console.log('uploadAvatarPhoto - Starting S3 upload');
    
    // --- 诊断日志：检查 uploadUrl 的真实值 ---
    console.log('[FINAL_DIAGNOSIS] About to call fetch() to upload to S3. The value of uploadUrl is:', uploadUrl);
    // -----------------------------
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    console.log('uploadAvatarPhoto - S3 upload response status:', uploadResponse.status);
    console.log('uploadAvatarPhoto - S3 upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('uploadAvatarPhoto - S3 upload failed with response:', errorText);
      throw new Error(`Avatar upload failed: ${uploadResponse.statusText}`);
    }

    console.log('uploadAvatarPhoto - Upload successful, returning finalUrl:', finalUrl);

    // Step 3: Return the public image URL
    return finalUrl;
  } catch (error) {
    console.error('Error uploading avatar photo:', error);
    throw error;
  }
}; 