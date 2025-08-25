import sharp from 'sharp';
import { config } from '../utils/env.js';
import { AppError } from '../types/index.js';

export class ImageService {
  async processAndValidateImage(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new AppError(400, 'Invalid image format');
      }

      // Check if resizing is needed
      const needsResize = 
        metadata.width > config.maxImageDimension || 
        metadata.height > config.maxImageDimension;

      let processedImage = image;

      if (needsResize) {
        // Resize maintaining aspect ratio
        processedImage = image.resize(config.maxImageDimension, config.maxImageDimension, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to JPEG for consistent compression
      const processedBuffer = await processedImage
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      // Check final size
      const finalSizeMB = processedBuffer.length / (1024 * 1024);
      if (finalSizeMB > config.maxImageSizeMB) {
        // Try with lower quality
        const compressedBuffer = await sharp(buffer)
          .resize(config.maxImageDimension, config.maxImageDimension, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 60, progressive: true })
          .toBuffer();

        const compressedSizeMB = compressedBuffer.length / (1024 * 1024);
        if (compressedSizeMB > config.maxImageSizeMB) {
          throw new AppError(400, `Image too large after compression (${compressedSizeMB.toFixed(2)}MB). Maximum allowed: ${config.maxImageSizeMB}MB`);
        }

        return { buffer: compressedBuffer, contentType: 'image/jpeg' };
      }

      return { buffer: processedBuffer, contentType: 'image/jpeg' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(400, 'Invalid image format or corrupted image');
    }
  }

  validateImageFormat(buffer: Buffer): boolean {
    // Check magic numbers for common image formats
    const signatures = [
      [0xFF, 0xD8, 0xFF], // JPEG
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0x47, 0x49, 0x46], // GIF
      [0x52, 0x49, 0x46, 0x46], // WebP (RIFF)
    ];

    return signatures.some(signature => 
      signature.every((byte, index) => buffer[index] === byte)
    );
  }
}
