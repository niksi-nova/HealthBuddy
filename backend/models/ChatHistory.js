import mongoose from 'mongoose';

/**
 * Chat History Schema
 * Stores conversation history between user and AI chatbot for each family member
 */
const chatHistorySchema = new mongoose.Schema({
    familyMemberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
        required: [true, 'Family member ID is required'],
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    messages: [{
        role: {
            type: String,
            enum: {
                values: ['user', 'assistant'],
                message: 'Role must be user or assistant'
            },
            required: true
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            maxlength: [5000, 'Message content too long']
        },
        sources: [{
            recordId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'MedicalRecord'
            },
            fileName: String,
            uploadDate: Date,
            relevanceScore: Number
        }],
        timestamp: {
            type: Date,
            default: Date.now
        },
        confidence: {
            type: String,
            enum: ['high', 'medium', 'low', 'none'],
            default: 'medium'
        }
    }]
}, {
    timestamps: true
});

// Compound index for efficient queries
chatHistorySchema.index({ familyMemberId: 1, userId: 1 });

// Method to add a message
chatHistorySchema.methods.addMessage = function (role, content, sources = [], confidence = 'medium') {
    this.messages.push({
        role,
        content,
        sources,
        timestamp: new Date(),
        confidence
    });
};

// Method to get recent messages (for context)
chatHistorySchema.methods.getRecentMessages = function (limit = 10) {
    return this.messages.slice(-limit);
};

// Method to clear chat history
chatHistorySchema.methods.clearHistory = function () {
    this.messages = [];
};

// Static method to find or create chat history
chatHistorySchema.statics.findOrCreate = async function (familyMemberId, userId) {
    let chatHistory = await this.findOne({ familyMemberId, userId });

    if (!chatHistory) {
        chatHistory = await this.create({ familyMemberId, userId, messages: [] });
    }

    return chatHistory;
};

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
