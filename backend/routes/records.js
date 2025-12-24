import express from 'express';
import { param, body, validationResult } from 'express-validator';
import path from 'path';
import MedicalRecord from '../models/MedicalRecord.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';
import upload, { handleMulterError } from '../middleware/upload.js';
import { extractText, detectReportType } from '../services/extractionService.js';
import { processDocument } from '../services/embeddingService.js';

const router = express.Router();

/**
 * @route   POST /api/records/upload
 * @desc    Upload medical report
 * @access  Private
 */
router.post('/upload',
    protect,
    upload.single('file'),
    handleMulterError,
    [
        body('familyMemberId').isMongoId().withMessage('Invalid family member ID'),
        body('reportType').optional().trim()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a file'
                });
            }

            const { familyMemberId, reportType } = req.body;

            // Verify family member belongs to user
            const member = await FamilyMember.findOne({
                _id: familyMemberId,
                userId: req.user._id
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Family member not found'
                });
            }

            // Determine file type
            const ext = path.extname(req.file.originalname).toLowerCase();
            const fileType = ext === '.pdf' ? 'pdf' : 'image';

            // Create medical record
            const record = await MedicalRecord.create({
                familyMemberId,
                userId: req.user._id,
                fileName: req.file.originalname,
                fileType,
                filePath: req.file.path,
                reportType: reportType || 'General',
                metadata: {
                    fileSize: req.file.size,
                    mimeType: req.file.mimetype
                },
                processingStatus: 'processing'
            });

            // Process file asynchronously
            processFileAsync(record._id, req.file.path, fileType, reportType);

            res.status(201).json({
                success: true,
                message: 'File uploaded successfully. Processing in background.',
                record: {
                    _id: record._id,
                    fileName: record.fileName,
                    fileType: record.fileType,
                    uploadDate: record.uploadDate,
                    processingStatus: record.processingStatus
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * Process uploaded file asynchronously
 * Extracts text, generates embeddings, and updates record
 */
const processFileAsync = async (recordId, filePath, fileType, reportType) => {
    try {
        console.log(`📄 Processing file for record: ${recordId}`);

        // Extract text
        const { text, pageCount } = await extractText(filePath, fileType);

        if (!text || text.trim().length === 0) {
            throw new Error('No text could be extracted from file');
        }

        // Auto-detect report type if not provided
        const finalReportType = reportType || detectReportType(text);

        // Generate embeddings
        const chunks = await processDocument(text);

        // Update record
        await MedicalRecord.findByIdAndUpdate(recordId, {
            extractedText: text,
            reportType: finalReportType,
            'metadata.pageCount': pageCount,
            chunks: chunks,
            processingStatus: 'completed'
        });

        console.log(`✅ Successfully processed record: ${recordId}`);
    } catch (error) {
        console.error(`❌ Error processing record ${recordId}:`, error);

        await MedicalRecord.findByIdAndUpdate(recordId, {
            processingStatus: 'failed',
            processingError: error.message
        });
    }
};

/**
 * @route   GET /api/records/member/:memberId
 * @desc    Get all records for a family member
 * @access  Private
 */
router.get('/member/:memberId',
    protect,
    [
        param('memberId').isMongoId().withMessage('Invalid member ID')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            // Verify family member belongs to user
            const member = await FamilyMember.findOne({
                _id: req.params.memberId,
                userId: req.user._id
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Family member not found'
                });
            }

            const records = await MedicalRecord.find({
                familyMemberId: req.params.memberId
            })
                .select('-chunks -extractedText') // Exclude large fields
                .sort({ uploadDate: -1 });

            res.status(200).json({
                success: true,
                count: records.length,
                records
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/records/:recordId
 * @desc    Get specific record with full details
 * @access  Private
 */
router.get('/:recordId',
    protect,
    [
        param('recordId').isMongoId().withMessage('Invalid record ID')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const record = await MedicalRecord.findOne({
                _id: req.params.recordId,
                userId: req.user._id
            }).select('-chunks'); // Exclude embeddings

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Record not found'
                });
            }

            res.status(200).json({
                success: true,
                record
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/records/:recordId
 * @desc    Delete medical record
 * @access  Private
 */
router.delete('/:recordId',
    protect,
    [
        param('recordId').isMongoId().withMessage('Invalid record ID')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const record = await MedicalRecord.findOneAndDelete({
                _id: req.params.recordId,
                userId: req.user._id
            });

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Record not found'
                });
            }

            // TODO: Delete physical file from storage

            res.status(200).json({
                success: true,
                message: 'Record deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
