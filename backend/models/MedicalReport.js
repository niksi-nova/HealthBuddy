import mongoose from 'mongoose';

/**
 * Medical Report Schema
 * Stores metadata about uploaded medical reports
 * SECURITY: Member-scoped, audit trail included
 */
const medicalReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember',
        required: [true, 'Member ID is required'],
        index: true
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    reportDate: {
        type: Date,
        required: [true, 'Report date is required'],
        index: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    extractionStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    markerCount: {
        type: Number,
        default: 0
    },
    extractionError: {
        type: String,
        default: null
    },
    // Cloud storage fields
    cloudUrl: {
        type: String,
        default: null
    },
    cloudPublicId: {
        type: String,
        default: null
    },
    originalFileName: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
medicalReportSchema.index({ memberId: 1, reportDate: -1 });
medicalReportSchema.index({ userId: 1, createdAt: -1 });

// Virtual for lab results
medicalReportSchema.virtual('labResults', {
    ref: 'LabResult',
    localField: '_id',
    foreignField: 'reportId'
});

// Ensure virtuals are included in JSON
medicalReportSchema.set('toJSON', { virtuals: true });
medicalReportSchema.set('toObject', { virtuals: true });

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);

export default MedicalReport;
