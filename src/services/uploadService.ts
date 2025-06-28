import apiClient from './apiClient';
import { debugNetworkIssue } from '@/utils/debugNetwork';

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
    console.log('uploadAvatarPhoto - Environment check:', {
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID
    });
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
    
    // 调试：使用原生 XMLHttpRequest 测试
    console.log('[DEBUG] Testing with native XMLHttpRequest...');
    try {
      const testResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL}/users/me/avatar-upload-url`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', apiClient.defaults.headers.common['Authorization'] || '');
        // xhr.withCredentials = true; // 暂时禁用以测试CORS问题
        
        xhr.onload = () => {
          console.log('[DEBUG] XHR Status:', xhr.status);
          console.log('[DEBUG] XHR Response:', xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`XHR failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          console.error('[DEBUG] XHR Network Error');
          reject(new Error('XHR Network Error'));
        };
        
        xhr.send(JSON.stringify(requestPayload));
      });
      console.log('[DEBUG] XHR Test Response:', testResponse);
    } catch (xhrError) {
      console.error('[DEBUG] XHR Test Error:', xhrError);
      // Run full network diagnostics
      await debugNetworkIssue();
    }
    
    const uploadUrlResponse = await apiClient.post('/users/me/avatar-upload-url', requestPayload);
    
    // --- 请在这里添加下面的日志 ---
    console.log('[FINAL_DIAGNOSIS_1] Full API Response from our backend:', uploadUrlResponse);
    console.log('[FINAL_DIAGNOSIS_2] Content of response.data.data:', uploadUrlResponse.data?.data);
    // -----------------------------
    
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