import express from 'express';
import { body, param, validationResult } from 'express-validator';
import ChatHistory from '../models/ChatHistory.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';
import { queryWithRAG } from '../services/aiService.js';

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI chatbot
 * @access  Private
 */
router.post('/message',
    protect,
    [
        body('familyMemberId').isMongoId().withMessage('Invalid family member ID'),
        body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
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

            const { familyMemberId, message } = req.body;

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

            // Get or create chat history
            let chatHistory = await ChatHistory.findOrCreate(familyMemberId, req.user._id);

            // Add user message
            chatHistory.addMessage('user', message);
            await chatHistory.save();

            // Query AI with RAG
            const { answer, sources, confidence } = await queryWithRAG(message, familyMemberId);

            // Add AI response
            chatHistory.addMessage('assistant', answer, sources, confidence);
            await chatHistory.save();

            res.status(200).json({
                success: true,
                reply: answer,
                sources,
                confidence,
                timestamp: new Date()
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/chat/history/:memberId
 * @desc    Get chat history for a family member
 * @access  Private
 */
router.get('/history/:memberId',
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

            const chatHistory = await ChatHistory.findOne({
                familyMemberId: req.params.memberId,
                userId: req.user._id
            });

            res.status(200).json({
                success: true,
                messages: chatHistory ? chatHistory.messages : [],
                count: chatHistory ? chatHistory.messages.length : 0
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/chat/history/:memberId
 * @desc    Clear chat history for a family member
 * @access  Private
 */
router.delete('/history/:memberId',
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

            const chatHistory = await ChatHistory.findOne({
                familyMemberId: req.params.memberId,
                userId: req.user._id
            });

            if (chatHistory) {
                chatHistory.clearHistory();
                await chatHistory.save();
            }

            res.status(200).json({
                success: true,
                message: 'Chat history cleared successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
