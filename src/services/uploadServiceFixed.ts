import { fetchAuthSession } from 'aws-amplify/auth';

export interface UploadResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    finalUrl: string;
  };
  error?: {
    message: string;
  };
}

/**
 * 使用原生 fetch 上传头像，绕过 axios 的问题
 */
export const uploadAvatarPhotoFixed = async (file: File): Promise<string> => {
  try {
    console.log('uploadAvatarPhotoFixed - Starting upload process');
    
    // 获取认证 token
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    if (!idToken) {
      throw new Error('No authentication token found');
    }
    
    // Step 1: 使用原生 fetch 获取上传 URL
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/users/me/avatar-upload-url`;
    console.log('Requesting upload URL from:', apiUrl);
    
    const uploadUrlResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      })
    });
    
    console.log('Upload URL response status:', uploadUrlResponse.status);
    
    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text();
      console.error('Failed to get upload URL:', errorText);
      throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
    }
    
    const uploadUrlData: UploadResponse = await uploadUrlResponse.json();
    console.log('Upload URL response data:', uploadUrlData);
    
    if (!uploadUrlData.success || !uploadUrlData.data) {
      throw new Error('Invalid response from upload URL endpoint');
    }
    
    const { uploadUrl, finalUrl } = uploadUrlData.data;
    
    // Step 2: 上传文件到 S3
    console.log('Uploading to S3...');
    const s3Response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    console.log('S3 upload response status:', s3Response.status);
    
    if (!s3Response.ok) {
      const errorText = await s3Response.text();
      console.error('S3 upload failed:', errorText);
      throw new Error(`S3 upload failed: ${s3Response.statusText}`);
    }
    
    console.log('Upload successful! Final URL:', finalUrl);
    return finalUrl;
    
  } catch (error) {
    console.error('Error in uploadAvatarPhotoFixed:', error);
    throw error;
  }
};