export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

class CloudinaryService {
  private cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  async uploadImage(file: File): Promise<string> {
    try {
      // 1. Get signature from our API
      const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { timestamp, signature, apiKey, cloudName } = await signResponse.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('upload_preset', 'vulai_uploads');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
      }

      const result: CloudinaryUploadResponse = await uploadResponse.json();
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  // Helper to generate optimized URLs (optional, for future use)
  getOptimizedUrl(publicId: string, options: string = 'f_auto,q_auto'): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${options}/${publicId}`;
  }
}

export const cloudinaryService = new CloudinaryService();
