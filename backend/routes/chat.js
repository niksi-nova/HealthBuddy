import express from 'express';
import { body, param, validationResult } from 'express-validator';
import FamilyMember from '../models/FamilyMember.js';
import LabResult from '../models/LabResult.js';
import { protect } from '../middleware/auth.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */

/**
 * Parse time range from user message
 * Default: last 30 days
 */
const parseTimeRange = (message) => {
    const lower = message.toLowerCase();
    const now = new Date();

    if (lower.includes('past 1 month') || lower.includes('last 1 month')) {
        const from = new Date();
        from.setMonth(now.getMonth() - 1);
        return { from, to: now };
    }

    if (lower.includes('past 3 months') || lower.includes('last 3 months')) {
        const from = new Date();
        from.setMonth(now.getMonth() - 3);
        return { from, to: now };
    }

    if (lower.includes('past 6 months') || lower.includes('last 6 months')) {
        const from = new Date();
        from.setMonth(now.getMonth() - 6);
        return { from, to: now };
    }

    // Default: last 30 days
    const from = new Date();
    from.setDate(now.getDate() - 30);
    return { from, to: now };
};

/**
 * Detect user intent
 */
const detectIntent = (message) => {
    const text = message.toLowerCase();

    if (text.includes('abnormal') || text.includes('out of range')) {
        return 'abnormal';
    }

    if (text.includes('summarize') || text.includes('summary')) {
        return 'summary';
    }

    if (
        text.includes('do i have') ||
        text.includes('health issue') ||
        text.includes('problem') ||
        text.includes('concern')
    ) {
        return 'interpretation';
    }

    if (
        text.includes('suggest') ||
        text.includes('improve') ||
        text.includes('what should i do') ||
        text.includes('how can i')
    ) {
        return 'advice';
    }

    return 'summary'; // safe default
};

/* ----------------------------- */
/* Routes                        */
/* ----------------------------- */

/**
 * @route   POST /api/chat/:memberId
 * @desc    Chat with medical AI assistant (LAB DATA ONLY, deterministic)
 * @access  Private
 */
router.post(
    '/:memberId',
    protect,
    [
        param('memberId').isMongoId().withMessage('Invalid member ID'),
        body('message')
            .trim()
            .notEmpty().withMessage('Message is required')
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

            /* ----------------------------- */
            /* Security: member ownership    */
            /* ----------------------------- */

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

            /* ----------------------------- */
            /* Intent + Time Range           */
            /* ----------------------------- */

            const intent = detectIntent(message);
            const { from, to } = parseTimeRange(message);

            /* ----------------------------- */
            /* Fetch lab results (deterministic)
            /* ----------------------------- */

            const labResults = await LabResult.find({
                memberId,
                testDate: { $gte: from, $lte: to }
            })
                .sort({ testDate: 1 })
                .lean();

            if (labResults.length === 0) {
                return res.json({
                    success: true,
                    response: "I don't have lab results for the selected time period.",
                    confidence: 'none'
                });
            }

            /* ----------------------------- */
            /* Handle intents                */
            /* ----------------------------- */

            /* ---- SUMMARY ---- */
            if (intent === 'summary') {
                const prompt = `
Summarize the following lab results by date.
Do NOT diagnose.
Do NOT give medical advice.
Only describe what is present.

${labResults.map(r =>
                    `${r.testDate.toDateString()} - ${r.marker}: ${r.value} ${r.unit || ''}`
                ).join('\n')}
`;

                const aiResponse = await geminiService.generateMedicalResponse(prompt);

                return res.json({
                    success: true,
                    response: aiResponse.response,
                    confidence: 'high',
                    labDataCount: labResults.length
                });
            }

            /* ---- ABNORMAL VALUES ---- */
            if (intent === 'abnormal') {
                const abnormal = labResults.filter(r => r.isAbnormal);

                if (abnormal.length === 0) {
                    return res.json({
                        success: true,
                        response: "All recorded lab values are within their reference ranges.",
                        confidence: 'high'
                    });
                }

                const prompt = `
Explain the following abnormal lab values in simple terms.
Do NOT diagnose or recommend treatment.

${abnormal.map(r =>
                    `${r.marker}: ${r.value} ${r.unit || ''} (outside reference range)`
                ).join('\n')}
`;

                const aiResponse = await geminiService.generateMedicalResponse(prompt);

                return res.json({
                    success: true,
                    response: aiResponse.response,
                    confidence: 'high'
                });
            }

            /* ---- INTERPRETATION ---- */
            if (intent === 'interpretation') {
                const prompt = `
Based ONLY on these lab results, describe any notable patterns or concerns.
Do NOT diagnose.
If the data is insufficient, say so.

Patient info:
Age: ${member.age}
Gender: ${member.gender}

Lab Results:
${labResults.map(r =>
                    `${r.testDate.toDateString()} - ${r.marker}: ${r.value} ${r.unit || ''}`
                ).join('\n')}
`;

                const aiResponse = await geminiService.generateMedicalResponse(prompt);

                return res.json({
                    success: true,
                    response: aiResponse.response,
                    confidence: 'medium'
                });
            }

            /* ---- ADVICE (GENERAL ONLY) ---- */
            if (intent === 'advice') {
                const prompt = `
Provide GENERAL, NON-MEDICAL wellness suggestions
based on the following lab trends.
Do NOT prescribe or diagnose.

Patient:
Age: ${member.age}
Gender: ${member.gender}

Lab Results:
${labResults.map(r =>
                    `${r.marker}: ${r.value} ${r.unit || ''}`
                ).join('\n')}
`;

                const aiResponse = await geminiService.generateMedicalResponse(prompt);

                return res.json({
                    success: true,
                    response: aiResponse.response,
                    confidence: 'low'
                });
            }

            /* ----------------------------- */
            /* Fallback (should not happen)  */
            /* ----------------------------- */

            return res.json({
                success: true,
                response: "I'm not sure how to interpret that request.",
                confidence: 'none'
            });

        } catch (error) {
            console.error('Chat error:', error);

            if (error.message?.includes('API key')) {
                return res.status(503).json({
                    success: false,
                    message: 'AI service is not configured properly.'
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
    res.json({
        success: true,
        examples: [
            "Summarize my results",
            "Show my test results from the past 1 month",
            "Are any of my markers abnormal?",
            "Do I have any health issues?",
            "Suggest ways to improve my health",
            "Compare my recent lab results"
        ]
    });
});

export default router;
