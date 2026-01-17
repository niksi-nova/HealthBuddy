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
import cloudStorage from '../services/cloudStorageService.js';
import {
    calculateHealthScore,
    getReportHealthStatus,
    getDefaultMarker,
    compareReports,
    getReportSummary,
    getTopChanges,
    getChangeDescription
} from '../utils/healthAnalysis.js';

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
                extractionStatus: 'processing',
                originalFileName: req.file.originalname
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

                // Upload to Cloudinary if configured
                if (cloudStorage.isCloudinaryConfigured()) {
                    try {
                        const { publicId } = await cloudStorage.uploadToCloud(
                            req.file.path,
                            req.file.originalname,
                            memberId
                        );

                        medicalReport.cloudPublicId = publicId;

                        console.log('📤 Report uploaded to Cloudinary:', publicId);

                        // delete local file
                        fs.unlink(req.file.path, () => { });

                        console.log('📤 Report uploaded to Cloudinary:', publicId);

                        // Optionally delete local file after cloud upload
                        fs.unlink(req.file.path, (err) => {
                            if (err) console.error('Error deleting local file:', err);
                            else console.log('🗑️ Local file deleted after cloud upload');
                        });
                    } catch (cloudError) {
                        console.error('Cloud upload warning (non-blocking):', cloudError.message);
                        // Don't fail - keep local file as backup
                    }
                }

                // Update report status
                medicalReport.extractionStatus = 'completed';
                medicalReport.markerCount = markers.length;
                await medicalReport.save();

                res.status(201).json({
                    success: true,
                    message: 'Report uploaded and processed successfully',
                    report: {
                        id: medicalReport._id,
                        fileName: medicalReport.fileName,
                        reportDate: medicalReport.reportDate,
                        markerCount: medicalReport.markerCount,
                        cloudUrl: medicalReport.cloudUrl || null
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
 * @route   GET /api/medical/report/:reportId/view
 * @desc    Get the cloud URL to view a specific report
 * @access  Private
 */
router.get('/report/:reportId/view',
    protect,
    [param('reportId').isMongoId()],
    async (req, res, next) => {
        try {
            const report = await MedicalReport.findById(req.params.reportId);

            if (!report) {
                return res.status(404).json({ success: false, message: 'Report not found' });
            }

            if (report.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            if (!report.cloudPublicId) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not available in cloud storage'
                });
            }

            const signedUrl = cloudStorage.getSignedUrl(
                report.cloudPublicId,
                600
            );

            res.json({
                success: true,
                viewUrl: signedUrl,
                fileName: report.originalFileName || report.fileName,
                reportDate: report.reportDate
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

/**
 * @route   GET /api/medical/health-overview/:memberId
 * @desc    Get health overview data including timeline and trends
 * @access  Private
 */
router.get('/health-overview/:memberId',
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

            // Get all reports for this member
            const reports = await MedicalReport.find({ memberId })
                .sort({ reportDate: -1 })
                .lean();

            if (reports.length === 0) {
                return res.json({
                    success: true,
                    timeline: [],
                    defaultMarker: getDefaultMarker(member.age, member.gender),
                    availableMarkers: [],
                    changes: {}
                });
            }

            // Build timeline data
            const timeline = [];
            let previousResults = null;

            // Process reports in chronological order for comparison
            const sortedReports = [...reports].reverse();

            for (const report of sortedReports) {
                // Get lab results for this report
                const labResults = await LabResult.find({ reportId: report._id }).lean();

                if (labResults.length > 0) {
                    const healthScore = calculateHealthScore(labResults);
                    const status = getReportHealthStatus(healthScore);
                    const abnormalCount = labResults.filter(r => r.isAbnormal).length;

                    let comparisonText = '';
                    if (previousResults && previousResults.length > 0) {
                        const prevScore = calculateHealthScore(previousResults);
                        if (healthScore > prevScore) {
                            comparisonText = ' (improved from last report)';
                        } else if (healthScore < prevScore) {
                            comparisonText = ' (declined from last report)';
                        } else {
                            comparisonText = ' (stable compared to last report)';
                        }
                    }

                    timeline.push({
                        reportId: report._id,
                        reportDate: report.reportDate,
                        healthScore,
                        status,
                        markerCount: labResults.length,
                        abnormalCount,
                        summary: getReportSummary(abnormalCount, labResults.length, comparisonText)
                    });

                    previousResults = labResults;
                }
            }

            // Reverse timeline to show most recent first
            timeline.reverse();

            // Get all unique markers
            const availableMarkers = await LabResult.getMarkersList(memberId);

            // Calculate changes between most recent two reports
            let changes = {};
            if (timeline.length >= 2) {
                const latestReportId = timeline[0].reportId;
                const previousReportId = timeline[1].reportId;

                const latestResults = await LabResult.find({ reportId: latestReportId }).lean();
                const previousResults = await LabResult.find({ reportId: previousReportId }).lean();

                const rawChanges = compareReports(latestResults, previousResults);
                const topChanges = getTopChanges(rawChanges, 5);

                // Convert to object with descriptions
                topChanges.forEach(({ marker, change }) => {
                    changes[marker] = getChangeDescription(change);
                });
            }

            // Get default marker based on member's age and gender
            const defaultMarker = getDefaultMarker(member.age, member.gender);

            res.json({
                success: true,
                timeline,
                defaultMarker,
                availableMarkers,
                changes
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/medical/report/:reportId
 * @desc    Delete a medical report and its associated lab results
 * @access  Private
 */
router.delete('/report/:reportId',
    protect,
    [param('reportId').isMongoId().withMessage('Invalid report ID')],
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

            const { reportId } = req.params;

            // Find the report
            const report = await MedicalReport.findById(reportId);

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            // SECURITY: Verify the report belongs to the user
            if (report.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Delete associated lab results
            await LabResult.deleteMany({ reportId: report._id });

            // Delete from cloud storage if exists
            if (report.cloudPublicId && cloudStorage.isCloudinaryConfigured()) {
                try {
                    await cloudStorage.deleteFromCloud(report.cloudPublicId);
                    console.log('🗑️ Deleted from cloud storage:', report.cloudPublicId);
                } catch (cloudError) {
                    console.error('Warning: Failed to delete from cloud:', cloudError.message);
                }
            }

            // Delete local file if exists
            if (report.filePath && fs.existsSync(report.filePath)) {
                fs.unlinkSync(report.filePath);
            }

            // Delete the report
            await MedicalReport.findByIdAndDelete(reportId);

            res.json({
                success: true,
                message: 'Report and associated lab results deleted successfully'
            });

        } catch (error) {
            next(error);
        }
    }
);

export default router;
