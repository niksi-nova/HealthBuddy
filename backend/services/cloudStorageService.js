import { v2 as cloudinary } from 'cloudinary';

/**
 * Ensure Cloudinary is configured
 */
const ensureConfigured = () => {
    if (cloudinary.config().cloud_name) return true;

    if (process.env.CLOUDINARY_URL) {
        const match = process.env.CLOUDINARY_URL.match(
            /cloudinary:\/\/([^:]+):([^@]+)@(.+)/
        );
        if (!match) {
            throw new Error('Invalid CLOUDINARY_URL format');
        }

        cloudinary.config({
            cloud_name: match[3],
            api_key: match[1],
            api_secret: match[2],
            secure: true,
        });

        console.log('✅ Cloudinary configured via CLOUDINARY_URL');
        return true;
    }

    if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });

        console.log('✅ Cloudinary configured via env variables');
        return true;
    }

    throw new Error('❌ Cloudinary environment variables missing');
};

/**
 * Upload PDF to Cloudinary (PRIVATE ASSET)
 */
export const uploadToCloud = async (filePath, fileName, memberId) => {
    ensureConfigured();

    const baseName = fileName.replace(/\.[^/.]+$/, ''); // 🔥 REMOVE EXTENSION

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw',
        type: 'private',
        folder: `medical-reports/${memberId}`,
        public_id: `${Date.now()}-${baseName}`, // ❌ NO .pdf
        overwrite: true,
    });

    console.log('✅ Cloudinary upload result:', {
        public_id: result.public_id,
        type: result.type,
    });

    return {
        publicId: result.public_id, // extension-less
    };
};



/**
 * Generate signed URL (browser-safe)
 */
export const getSignedUrl = (publicId, expiresIn = 600) => {
    ensureConfigured();

    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    return cloudinary.utils.private_download_url(publicId, null, {
        resource_type: 'raw',      // 🔥 THIS IS THE FIX
        expires_at: expiresAt,
        attachment: false,         // open in browser
    });
};



/**
 * Delete file
 */
export const deleteFromCloud = async (publicId) => {
    ensureConfigured();

    await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        type: 'private',
    });

    console.log('🗑️ Deleted:', publicId);
};

export const isCloudinaryConfigured = () => {
    try {
        return ensureConfigured();
    } catch {
        return false;
    }
};

export default {
    uploadToCloud,
    getSignedUrl,
    deleteFromCloud,
    isCloudinaryConfigured,
};
