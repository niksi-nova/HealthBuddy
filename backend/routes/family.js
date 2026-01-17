import express from 'express';
import { body, param, validationResult } from 'express-validator';
import FamilyMember from '../models/FamilyMember.js';
import MedicalReport from '../models/MedicalReport.js';
import LabResult from '../models/LabResult.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/family/members
 * @desc    Add a new family member
 * @access  Private
 */
router.post('/members',
    protect,
    upload.single('profilePicture'), // Handle single file upload
    [
        body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
        body('relation').trim().notEmpty().withMessage('Relation is required'),
        body('age').isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
        body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
        body('existingConditions').optional()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { name, relation, age, gender, existingConditions } = req.body;

            // Parse existingConditions if it's a string (from FormData)
            let conditions = [];
            if (existingConditions) {
                try {
                    conditions = typeof existingConditions === 'string'
                        ? JSON.parse(existingConditions)
                        : existingConditions;
                } catch (e) {
                    conditions = [];
                }
            }

            const memberData = {
                userId: req.user._id,
                name,
                relation,
                age: parseInt(age),
                gender,
                existingConditions: conditions
            };

            // Add profile picture path if file was uploaded
            if (req.file) {
                memberData.profilePicture = `/uploads/${req.file.filename}`;
            }

            const member = await FamilyMember.create(memberData);

            res.status(201).json({
                success: true,
                message: 'Family member added successfully',
                member
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/family/members
 * @desc    Get all family members for current user
 * @access  Private
 */
router.get('/members', protect, async (req, res, next) => {
    try {
        const members = await FamilyMember.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        // Include admin as a node in the family tree
        const admin = {
            _id: req.user._id,
            name: req.user.name,
            age: req.user.age,
            gender: req.user.gender,
            avatarColor: req.user.avatarColor,
            relation: 'Admin',
            isAdmin: true
        };

        res.status(200).json({
            success: true,
            count: members.length,
            members,
            admin
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/family/members/:id
 * @desc    Get specific family member
 * @access  Private
 */
router.get('/members/:id',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid member ID')
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

            const member = await FamilyMember.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Family member not found'
                });
            }

            res.status(200).json({
                success: true,
                member
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   PUT /api/family/members/:id
 * @desc    Update family member
 * @access  Private
 */
router.put('/members/:id',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid member ID'),
        body('name').optional().trim().isLength({ min: 2, max: 100 }),
        body('relation').optional().trim().notEmpty(),
        body('age').optional().isInt({ min: 0, max: 120 }),
        body('gender').optional().isIn(['Male', 'Female', 'Other']),
        body('existingConditions').optional().isArray()
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

            const member = await FamilyMember.findOneAndUpdate(
                { _id: req.params.id, userId: req.user._id },
                req.body,
                { new: true, runValidators: true }
            );

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Family member not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Family member updated successfully',
                member
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/family/members/:id
 * @desc    Delete family member
 * @access  Private
 */
router.delete('/members/:id',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid member ID')
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

            const member = await FamilyMember.findOneAndDelete({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Family member not found'
                });
            }

            // Cascade delete: remove all reports and lab results for this member
            const reports = await MedicalReport.find({ memberId: req.params.id });
            for (const report of reports) {
                await LabResult.deleteMany({ reportId: report._id });
            }
            await MedicalReport.deleteMany({ memberId: req.params.id });
            await LabResult.deleteMany({ memberId: req.params.id });

            console.log(`🗑️ Deleted member ${member.name} and all associated data`);

            res.status(200).json({
                success: true,
                message: 'Family member and all associated data deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
