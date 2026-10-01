import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

router.post('/upload', async (req, res) => {
    try {
        const { buffer } = req.body;

        if (!buffer) {
            return res.status(400).json({
                message: "No image buffer provided"
            });
        }

        const cloud = await cloudinary.v2.uploader.upload(buffer, {
            resource_type: "auto",
            folder: "bite_rush",
            timeout: 120000,
        });

        res.json({
            url: cloud.secure_url,
        });
    } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({
            message: error?.message || "Failed to upload image to Cloudinary"
        });
    }
});

export default router;