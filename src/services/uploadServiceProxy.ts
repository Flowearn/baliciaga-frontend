import apiClient from './apiClient';

/**
 * 使用 axios 客户端上传头像（已配置了正确的拦截器）
 * 这个版本回到使用 apiClient，但是做了一些调整
 */
export const uploadAvatarPhotoViaProxy = async (file: File): Promise<string> => {
  try {
    console.log('[UploadProxy] Starting upload process');
    console.log('[UploadProxy] File:', { name: file.name, type: file.type, size: file.size });
    
    // 创建一个新的 promise 来处理整个上传流程
    return new Promise(async (resolve, reject) => {
      try {
        // Step 1: 获取上传 URL - 使用 apiClient 确保认证正确
        console.log('[UploadProxy] Requesting upload URL...');
        
        const uploadUrlResponse = await apiClient.post('/users/me/avatar-upload-url', {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }, {
          // 确保不使用 withCredentials
          withCredentials: false,
          // 增加超时时间
          timeout: 30000
        });
        
        console.log('[UploadProxy] Upload URL response:', uploadUrlResponse.data);
        
        if (!uploadUrlResponse.data.success || !uploadUrlResponse.data.data) {
          throw new Error('Invalid response from server');
        }
        
        const { uploadUrl, finalUrl } = uploadUrlResponse.data.data;
        console.log('[UploadProxy] Got upload URL, proceeding to S3 upload');
        
        // Step 2: 上传到 S3 - 使用原生 fetch 因为 S3 不需要我们的认证
        console.log('[UploadProxy] Uploading to S3...');
        const s3Response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
        
        console.log('[UploadProxy] S3 response status:', s3Response.status);
        
        if (!s3Response.ok) {
          const errorText = await s3Response.text();
          console.error('[UploadProxy] S3 error:', errorText);
          throw new Error(`S3 upload failed: ${s3Response.statusText}`);
        }
        
        console.log('[UploadProxy] Upload successful! URL:', finalUrl);
        resolve(finalUrl);
        
      } catch (error) {
        console.error('[UploadProxy] Error in upload process:', error);
        reject(error);
      }
    });
    
  } catch (error) {
    console.error('[UploadProxy] Top level error:', error);
    throw error;
  }
};