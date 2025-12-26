import express from 'express';
import { body, param, validationResult } from 'express-validator';
import FamilyMember from '../models/FamilyMember.js';
import LabResult from '../models/LabResult.js';
import { protect } from '../middleware/auth.js';
import geminiService from '../services/geminiService.js';
import chromaService from '../services/chromaService.js';

const router = express.Router();

/**
 * @route   POST /api/chat/:memberId
 * @desc    Chat with medical AI assistant about member's health data
 * @access  Private
 * @security Member-level access control, strict safety guardrails
 */
router.post('/:memberId',
    protect,
    [
        param('memberId').isMongoId().withMessage('Invalid member ID'),
        body('message').trim().notEmpty().withMessage('Message is required')
            .isLength({ max: 500 }).withMessage('Message too long (max 500 characters)')
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
            const { message } = req.body;

            // SECURITY: Verify member belongs to user OR is the user themselves
            let member = await FamilyMember.findOne({
                _id: memberId,
                userId: req.user._id
            });

            // Allow admin to query their own data
            if (!member && memberId === req.user._id.toString()) {
                member = {
                    _id: req.user._id,
                    userId: req.user._id,
                    name: req.user.name || 'Admin',
                    age: req.user.age || 30,
                    gender: req.user.gender || 'Not specified',
                    existingConditions: []
                };
            }

            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get recent lab results (last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const labResults = await LabResult.find({
                memberId: memberId,
                testDate: { $gte: sixMonthsAgo }
            })
                .sort({ testDate: -1 })
                .limit(50)
                .lean();

            // Query vector store for relevant report summaries
            const reportSummaries = await chromaService.queryReports(
                req.user._id.toString(),
                message,
                3 // Get top 3 relevant reports
            );

            // Build context for Gemini
            const context = {
                labResults: labResults.map(r => ({
                    marker: r.marker,
                    value: r.value,
                    unit: r.unit,
                    testDate: r.testDate,
                    isAbnormal: r.isAbnormal
                })),
                reportSummaries: reportSummaries.map(s => s.text),
                memberInfo: {
                    name: member.name,
                    age: member.age,
                    gender: member.gender,
                    conditions: member.existingConditions || []
                }
            };

            // Generate response using Gemini with safety guardrails
            const aiResponse = await geminiService.generateMedicalResponse(message, context);

            // Log for audit
            console.log(`[CHAT AUDIT] User: ${req.user._id}, Member: ${memberId}, Question: ${message.substring(0, 50)}...`);

            res.json({
                success: true,
                response: aiResponse.response,
                sources: reportSummaries.map(s => ({
                    date: s.reportDate,
                    member: s.memberName
                })),
                labDataCount: labResults.length,
                model: aiResponse.model
            });

        } catch (error) {
            console.error('Chat error:', error);

            // Handle Gemini API errors gracefully
            if (error.message.includes('API key')) {
                return res.status(503).json({
                    success: false,
                    message: 'AI service is not configured. Please add OPENAI_API_KEY to your .env file.'
                });
            }

            next(error);
        }
    }
);

/**
 * @route   GET /api/chat/example-questions
 * @desc    Get example questions users can ask
 * @access  Public
 */
router.get('/example-questions', (req, res) => {
    const examples = [
        "What does my hemoglobin level mean?",
        "Are any of my test results abnormal?",
        "What is cholesterol and why does it matter?",
        "How can I improve my blood sugar levels?",
        "What foods should I eat for better iron levels?",
        "Explain my complete blood count results",
        "What lifestyle changes can help my health?",
        "Should I be concerned about any of my results?"
    ];

    res.json({
        success: true,
        examples
    });
});

export default router;
