/**
 * Cloudinary Utility Service
 * Handles image uploads to Cloudinary
 * 
 * IMPORTANT: Requires these env variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image file to Cloudinary
 * 
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {string} folder - Cloudinary folder path (e.g., 'products', 'brands')
 * @param {string} publicId - Optional custom public ID for the image
 * @returns {Promise<{url: string, publicId: string}>} - Returns Cloudinary URL and public ID
 */
async function uploadImage(fileBuffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    // Convert buffer to stream for Cloudinary upload
    const stream = Readable.from(fileBuffer);

    // Set up upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `dreamxstore/${folder}`, // Organize images in subfolders
        public_id: publicId,
        resource_type: 'auto',
        overwrite: !!publicId // Overwrite if public_id is provided
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    // Pipe the buffer to the upload stream
    stream.pipe(uploadStream);
  });
}

/**
 * Delete image from Cloudinary by public ID
 * 
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<{success: boolean}>} - Returns deletion status
 */
async function deleteImage(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Failed to delete image: ${error.message}`));
      } else {
        resolve({ success: result.result === 'ok' });
      }
    });
  });
}

/**
 * Optimize image URL with Cloudinary transformations
 * 
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {string} options.crop - Crop mode (e.g., 'fill', 'thumb', 'scale')
 * @param {number} options.quality - Quality (1-100)
 * @returns {string} - Transformed URL
 */
function getOptimizedUrl(url, options = {}) {
  const {
    width = 300,
    height = 300,
    crop = 'fill',
    quality = 80
  } = options;

  // Parse the URL to insert transformations
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url; // Return original if not a Cloudinary URL

  const transformation = `w_${width},h_${height},c_${crop},q_${quality}`;
  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
}

module.exports = {
  uploadImage,
  deleteImage,
  getOptimizedUrl
};
