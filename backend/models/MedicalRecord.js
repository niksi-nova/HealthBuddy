import mongoose from 'mongoose';

/**
 * Medical Record Schema
 * Stores uploaded medical reports with extracted text and embeddings for AI analysis
 */
const medicalRecordSchema = new mongoose.Schema({
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
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    fileType: {
        type: String,
        enum: {
            values: ['pdf', 'image'],
            message: 'File type must be pdf or image'
        },
        required: [true, 'File type is required']
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    extractedText: {
        type: String,
        default: '',
        maxlength: [100000, 'Extracted text too large'] // ~100KB limit
    },
    reportType: {
        type: String,
        trim: true,
        default: 'General',
        examples: ['Blood Test', 'X-Ray', 'MRI', 'Prescription', 'Consultation', 'General']
    },
    uploadDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    metadata: {
        fileSize: {
            type: Number,
            min: 0
        },
        pageCount: {
            type: Number,
            min: 0,
            default: 1
        },
        mimeType: String
    },
    // Vector embeddings for MongoDB Atlas Vector Search
    chunks: [{
        text: {
            type: String,
            required: true
        },
        embedding: {
            type: [Number],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length === 768; // Gemini embedding dimension
                },
                message: 'Embedding must be 768-dimensional'
            }
        },
        chunkIndex: {
            type: Number,
            required: true
        }
    }],
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingError: {
        type: String
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
medicalRecordSchema.index({ familyMemberId: 1, uploadDate: -1 });
medicalRecordSchema.index({ userId: 1, uploadDate: -1 });
medicalRecordSchema.index({ reportType: 1 });

// Vector search index (created in MongoDB Atlas UI or via script)
// Index name: 'vector_index'
// Path: 'chunks.embedding'
// Dimensions: 768
// Similarity: cosine

// Method to add chunk with embedding
medicalRecordSchema.methods.addChunk = function (text, embedding, index) {
    this.chunks.push({
        text,
        embedding,
        chunkIndex: index
    });
};

// Static method to perform vector search
medicalRecordSchema.statics.vectorSearch = async function (queryEmbedding, familyMemberId, limit = 5) {
    try {
        const pipeline = [
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'chunks.embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: limit,
                    filter: {
                        familyMemberId: familyMemberId
                    }
                }
            },
            {
                $project: {
                    fileName: 1,
                    reportType: 1,
                    uploadDate: 1,
                    chunks: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ];

        return await this.aggregate(pipeline);
    } catch (error) {
        console.error('Vector search error:', error);
        throw error;
    }
};

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
