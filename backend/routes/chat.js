import express from 'express';
import { body, param, validationResult } from 'express-validator';
import FamilyMember from '../models/FamilyMember.js';
import LabResult from '../models/LabResult.js';
import { protect } from '../middleware/auth.js';
import geminiService from '../services/geminiService.js';
import { getReferenceRange, isAbnormal as checkIsAbnormal, formatReferenceRange } from '../utils/referenceRanges.js';

const router = express.Router();

/* ----------------------------- */
/* Helpers                       */
/* ----------------------------- */

/**
 * Parse time range from user message
 * Supports: month names, relative time periods
 * Returns null to fetch ALL data if no specific time mentioned
 */
const parseTimeRange = (message) => {
    const lower = message.toLowerCase();
    const now = new Date();

    // Month names mapping - use regex word boundaries to avoid false matches
    // e.g., "summarize" should NOT match "mar" (March)
    const monthPatterns = [
        { pattern: /\b(january|jan)\b/, month: 0 },
        { pattern: /\b(february|feb)\b/, month: 1 },
        { pattern: /\b(march|mar)\b/, month: 2 },
        { pattern: /\b(april|apr)\b/, month: 3 },
        { pattern: /\bmay\b/, month: 4 },
        { pattern: /\b(june|jun)\b/, month: 5 },
        { pattern: /\b(july|jul)\b/, month: 6 },
        { pattern: /\b(august|aug)\b/, month: 7 },
        { pattern: /\b(september|sep|sept)\b/, month: 8 },
        { pattern: /\b(october|oct)\b/, month: 9 },
        { pattern: /\b(november|nov)\b/, month: 10 },
        { pattern: /\b(december|dec)\b/, month: 11 }
    ];

    // Check for specific month names using word boundaries
    for (const { pattern, month } of monthPatterns) {
        if (pattern.test(lower)) {
            // If the month is in the future relative to current month, use previous year
            let year = now.getFullYear();
            if (month > now.getMonth()) {
                year = year - 1;
            }
            const from = new Date(year, month, 1);
            const to = new Date(year, month + 1, 0, 23, 59, 59); // Last day of month
            return { from, to, specific: true };
        }
    }

    // Relative time periods
    if (lower.includes('past year') || lower.includes('last year')) {
        const from = new Date();
        from.setFullYear(now.getFullYear() - 1);
        return { from, to: now, specific: true };
    }

    if (lower.includes('this year')) {
        const from = new Date(now.getFullYear(), 0, 1);
        return { from, to: now, specific: true };
    }

    if (lower.includes('past 6 months') || lower.includes('last 6 months')) {
        const from = new Date();
        from.setMonth(now.getMonth() - 6);
        return { from, to: now, specific: true };
    }

    if (lower.includes('past 3 months') || lower.includes('last 3 months')) {
        const from = new Date();
        from.setMonth(now.getMonth() - 3);
        return { from, to: now, specific: true };
    }

    if (lower.includes('past 1 month') || lower.includes('last 1 month') || lower.includes('last month')) {
        const from = new Date();
        from.setMonth(now.getMonth() - 1);
        return { from, to: now, specific: true };
    }

    if (lower.includes('past week') || lower.includes('last week')) {
        const from = new Date();
        from.setDate(now.getDate() - 7);
        return { from, to: now, specific: true };
    }

    if (lower.includes('latest') || lower.includes('recent') || lower.includes('last report')) {
        // Get latest reports - use wide range and limit in query
        return { from: new Date(2000, 0, 1), to: now, specific: false, latest: true };
    }

    // Default: fetch ALL available data
    return { from: new Date(2000, 0, 1), to: now, specific: false };
};

/**
 * Extract health topic from message (anemia, diabetes, etc.)
 */
const extractHealthTopic = (message) => {
    const text = message.toLowerCase();

    const healthTopics = {
        'anemia': ['hemoglobin', 'hb', 'rbc', 'red blood cell', 'hematocrit', 'mcv', 'mch', 'mchc', 'iron', 'ferritin', 'pcv'],
        'diabetes': ['glucose', 'blood sugar', 'hba1c', 'fasting glucose', 'random glucose', 'sugar'],
        'thyroid': ['tsh', 't3', 't4', 'thyroid'],
        'liver': ['alt', 'ast', 'sgpt', 'sgot', 'bilirubin', 'albumin', 'liver'],
        'kidney': ['creatinine', 'urea', 'bun', 'egfr', 'uric acid', 'kidney'],
        'cholesterol': ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid'],
        'infection': ['wbc', 'white blood cell', 'neutrophil', 'lymphocyte', 'esr', 'crp'],
        'vitamin': ['vitamin d', 'vitamin b12', 'b12', 'folate', 'folic acid'],
        'platelet': ['platelet', 'plt', 'mpv']
    };

    for (const [topic, markers] of Object.entries(healthTopics)) {
        if (text.includes(topic)) {
            return { topic, relatedMarkers: markers };
        }
    }

    return null;
};

/* ----------------------------- */
/* Routes                        */
/* ----------------------------- */

/**
 * @route   POST /api/chat/:memberId
 * @desc    Chat with medical AI assistant
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
            /* Parse time range and topic    */
            /* ----------------------------- */

            const timeRange = parseTimeRange(message);
            const { from, to } = timeRange;
            const healthTopic = extractHealthTopic(message);

            /* ----------------------------- */
            /* Fetch lab results             */
            /* ----------------------------- */

            let query = {
                memberId,
                testDate: { $gte: from, $lte: to }
            };

            let labResults = await LabResult.find(query)
                .sort({ testDate: -1 })
                .lean();

            // Debug log
            console.log(`[Chat] Query for memberId: ${memberId}, from: ${from.toISOString()}, to: ${to.toISOString()}`);
            console.log(`[Chat] Found ${labResults.length} lab results`);

            // If a specific health topic was mentioned, prioritize those markers
            let relevantMarkers = [];
            if (healthTopic) {
                relevantMarkers = labResults.filter(r => {
                    const markerLower = r.marker.toLowerCase();
                    return healthTopic.relatedMarkers.some(m => markerLower.includes(m));
                });
            }

            if (labResults.length === 0) {
                // Try fetching without date filter to check if any data exists
                const anyResults = await LabResult.countDocuments({ memberId });

                if (anyResults > 0) {
                    return res.json({
                        success: true,
                        response: `I found ${anyResults} lab results for this profile, but none in the time period you specified. Try asking about "all my reports" or "latest reports" to see all available data.`,
                        confidence: 'none'
                    });
                }

                return res.json({
                    success: true,
                    response: `No lab results have been uploaded for this profile yet. Please upload some medical reports first.`,
                    confidence: 'none'
                });
            }

            /* ----------------------------- */
            /* Build context for AI          */
            /* ----------------------------- */

            // Get member gender for reference ranges
            const memberGender = member.gender || 'Female';

            // Format lab results for context with proper reference ranges
            const formatLabResults = (results) => {
                return results.map(r => {
                    const date = new Date(r.testDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                    // Get standard reference range based on gender
                    const refRangeStr = formatReferenceRange(r.marker, memberGender);
                    const abnormal = checkIsAbnormal(r.marker, r.value, memberGender);
                    const abnormalFlag = abnormal ? ' ⚠️ OUT OF RANGE' : ' ✓ Normal';
                    return `${date} - ${r.marker}: ${r.value} ${r.unit || ''} (Normal: ${refRangeStr})${abnormalFlag}`;
                }).join('\n');
            };

            // Build the prompt with STRICT safety guardrails
            let prompt = `
CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:

1. NEVER DIAGNOSE. You are NOT a doctor. You CANNOT and MUST NOT say:
   - "You have [disease]" or "You don't have [disease]"
   - "This indicates [disease]" or "No indication of [disease]"
   - "You are suffering from..." or "You are healthy"
   
2. INSTEAD, you MUST ALWAYS say things like:
   - "Your [marker] is within the normal range, which is generally a positive sign. However, only a doctor can diagnose conditions like [disease] after a complete evaluation."
   - "Based on these values, there appears to be a low probability of [condition], but please consult a healthcare provider for proper diagnosis."
   - "These markers look normal/abnormal. For any concerns about [condition], please consult your doctor."

3. For questions like "do I have anemia/diabetes/etc":
   - Look at the RELEVANT markers (Hemoglobin, RBC for anemia; glucose for diabetes, etc.)
   - State whether those markers are normal, high, or low
   - NEVER diagnose - always say "a doctor must evaluate this" or similar

4. Be CONCISE - 2-4 sentences max unless listing multiple markers

---

User Question: "${message}"

Patient Information:
- Age: ${member.age}
- Gender: ${member.gender}
${member.existingConditions?.length > 0 ? `- Existing Conditions: ${member.existingConditions.join(', ')}` : ''}

`;

            // Add relevant markers if a specific topic was asked
            if (healthTopic && relevantMarkers.length > 0) {
                prompt += `
RELEVANT Lab Results for "${healthTopic.topic}":
${formatLabResults(relevantMarkers)}

`;
            }

            // Add all lab results (limit to most recent 50 to avoid token limits)
            const recentResults = labResults.slice(0, 50);
            prompt += `
All Available Lab Results (${recentResults.length} most recent):
${formatLabResults(recentResults)}

---

Now answer the user's question. Remember: NEVER diagnose. Always recommend consulting a doctor for diagnosis.
`;

            // Generate AI response
            const aiResponse = await geminiService.generateMedicalResponse(prompt, {
                labResults: healthTopic && relevantMarkers.length > 0 ? relevantMarkers : recentResults,
                memberInfo: {
                    age: member.age,
                    gender: member.gender,
                    conditions: member.existingConditions
                }
            });

            return res.json({
                success: true,
                response: aiResponse.response,
                confidence: 'high',
                labDataCount: labResults.length
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
            "Do I have anemia?",
            "Summarize my reports from December",
            "Are any of my values out of range?",
            "How is my cholesterol?",
            "What does my thyroid test show?",
            "Show my latest blood reports",
            "What factors varied a lot recently?",
            "Compare my hemoglobin levels over time"
        ]
    });
});

export default router;
