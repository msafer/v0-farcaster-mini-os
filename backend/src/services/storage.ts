import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../utils/env.js';

export class StorageService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      s3ForcePathStyle: true, // needed for MinIO and other S3-compatible stores
    });
  }

  async uploadImage(buffer: Buffer, contentType: string): Promise<string> {
    const key = `images/${uuidv4()}.${this.getExtensionFromContentType(contentType)}`;
    
    const uploadParams = {
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    try {
      await this.s3.upload(uploadParams).promise();
      return this.getPublicUrl(key);
    } catch (error) {
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  async deleteImage(url: string): Promise<void> {
    const key = this.getKeyFromUrl(url);
    
    const deleteParams = {
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    };

    try {
      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  private getExtensionFromContentType(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return extensions[contentType] || 'jpg';
  }

  private getPublicUrl(key: string): string {
    return `${env.S3_PUBLIC_URL_BASE}/${key}`;
  }

  private getKeyFromUrl(url: string): string {
    return url.replace(`${env.S3_PUBLIC_URL_BASE}/`, '');
  }
}
