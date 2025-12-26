import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { body, param, validationResult } from 'express-validator';
import MedicalReport from '../models/MedicalReport.js';
import LabResult from '../models/LabResult.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';
import chromaService from '../services/chromaService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure upload directory for medical reports
const uploadsDir = path.join(__dirname, '../uploads/medical-reports');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

/**
 * @route   POST /api/medical/upload/:memberId
 * @desc    Upload medical report PDF and extract lab markers
 * @access  Private
 * @security Member-level access control enforced
 */
router.post('/upload/:memberId',
    protect,
    upload.single('report'),
    [
        param('memberId').isMongoId().withMessage('Invalid member ID'),
        body('reportDate').isISO8601().withMessage('Invalid report date format')
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

            const { memberId } = req.params;
            const { reportDate } = req.body;

            // SECURITY: Verify member belongs to user OR is the user themselves
            let member = await FamilyMember.findOne({
                _id: memberId,
                userId: req.user._id
            });

            // If not found as family member, check if memberId is the user's own ID
            if (!member && memberId === req.user._id.toString()) {
                // Admin uploading for themselves - create a virtual member object
                member = {
                    _id: req.user._id,
                    userId: req.user._id,
                    name: req.user.name || 'Admin',
                    isAdmin: true
                };
            }

            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Member not found or unauthorized'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            // Create medical report record
            const medicalReport = await MedicalReport.create({
                userId: req.user._id,
                memberId: memberId,
                fileName: req.file.originalname,
                filePath: req.file.path,
                reportDate: new Date(reportDate),
                extractionStatus: 'processing'
            });

            // Call Python extraction service
            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(req.file.path));
                formData.append('memberId', memberId);
                formData.append('reportDate', reportDate);

                const extractionResponse = await axios.post(
                    'http://localhost:3003/extract-report',
                    formData,
                    {
                        headers: formData.getHeaders(),
                        timeout: 30000 // 30 second timeout
                    }
                );

                const { markers } = extractionResponse.data;

                // Store lab results in MongoDB
                const labResults = [];
                for (const marker of markers) {
                    const labResult = await LabResult.create({
                        userId: req.user._id,
                        memberId: memberId,
                        reportId: medicalReport._id,
                        marker: marker.name,
                        value: marker.value,
                        unit: marker.unit,
                        testDate: new Date(reportDate)
                    });
                    labResults.push(labResult);
                }

                // Update report status
                medicalReport.extractionStatus = 'completed';
                medicalReport.markerCount = markers.length;
                await medicalReport.save();

                // Store report summary in vector database (async, don't block response)
                try {
                    const summary = chromaService.generateReportSummary(
                        labResults,
                        reportDate,
                        {
                            name: member.name,
                            age: member.age,
                            gender: member.gender,
                            conditions: member.existingConditions || []
                        }
                    );

                    // Store in Chroma (fire and forget)
                    chromaService.storeReportSummary(
                        req.user._id.toString(),
                        medicalReport._id.toString(),
                        summary,
                        {
                            reportDate: reportDate,
                            memberName: member.name,
                            memberId: memberId
                        }
                    ).catch(err => {
                        console.error('Vector store error (non-blocking):', err.message);
                    });
                } catch (vectorError) {
                    // Don't fail the request if vector storage fails
                    console.error('Vector summary generation error:', vectorError.message);
                }

                res.status(201).json({
                    success: true,
                    message: 'Report uploaded and processed successfully',
                    report: {
                        id: medicalReport._id,
                        fileName: medicalReport.fileName,
                        reportDate: medicalReport.reportDate,
                        markerCount: medicalReport.markerCount
                    },
                    markers: labResults
                });

            } catch (extractionError) {
                console.error('Extraction error:', extractionError.message);

                // Update report status to failed
                medicalReport.extractionStatus = 'failed';
                medicalReport.extractionError = extractionError.message;
                await medicalReport.save();

                return res.status(500).json({
                    success: false,
                    message: 'Extraction failed',
                    error: extractionError.message,
                    reportId: medicalReport._id
                });
            }

        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/medical/reports/:memberId
 * @desc    Get all medical reports for a family member
 * @access  Private
 */
router.get('/reports/:memberId',
    protect,
    [param('memberId').isMongoId()],
    async (req, res, next) => {
        try {
            const { memberId } = req.params;

            // SECURITY: Verify member belongs to user
            const member = await FamilyMember.findOne({
                _id: memberId,
                userId: req.user._id
            });

            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const reports = await MedicalReport.find({ memberId })
                .sort({ reportDate: -1 })
                .select('-filePath') // Don't expose file path
                .lean();

            res.json({
                success: true,
                count: reports.length,
                reports
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/medical/markers/:memberId
 * @desc    Get all unique markers for a member
 * @access  Private
 */
router.get('/markers/:memberId',
    protect,
    [param('memberId').isMongoId()],
    async (req, res, next) => {
        try {
            const { memberId } = req.params;

            // SECURITY: Verify access
            const member = await FamilyMember.findOne({
                _id: memberId,
                userId: req.user._id
            });

            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const markers = await LabResult.getMarkersList(memberId);

            res.json({
                success: true,
                markers
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/medical/trends/:memberId/:marker
 * @desc    Get time-series data for a specific biomarker
 * @access  Private
 */
router.get('/trends/:memberId/:marker',
    protect,
    [
        param('memberId').isMongoId(),
        param('marker').trim().notEmpty()
    ],
    async (req, res, next) => {
        try {
            const { memberId, marker } = req.params;
            const limit = parseInt(req.query.limit) || 10;

            // SECURITY: Verify access
            const member = await FamilyMember.findOne({
                _id: memberId,
                userId: req.user._id
            });

            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Handle special case for "all" markers
            if (marker === 'all') {
                const allResults = await LabResult.find({ memberId })
                    .sort({ testDate: -1 })
                    .limit(100)
                    .lean();

                return res.json({
                    success: true,
                    results: allResults
                });
            }

            const trend = await LabResult.getTrend(memberId, marker, limit);

            res.json({
                success: true,
                marker,
                count: trend.length,
                data: trend
            });

        } catch (error) {
            next(error);
        }
    }
);

export default router;
