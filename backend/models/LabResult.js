import mongoose from 'mongoose';

/**
 * Lab Result Schema
 * Stores individual lab marker values for time-series analysis
 * SECURITY: Deterministically extracted values only (NO LLM)
 */
const labResultSchema = new mongoose.Schema({
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
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalReport',
        required: [true, 'Report ID is required'],
        index: true
    },
    marker: {
        type: String,
        required: [true, 'Marker name is required'],
        trim: true,
        index: true
        // e.g., "Hemoglobin", "White Blood Cell Count", "Glucose"
    },
    value: {
        type: Number,
        required: [true, 'Value is required']
        // CRITICAL: Only numeric values, deterministically extracted
    },
    unit: {
        type: String,
        trim: true
        // e.g., "g/dL", "cells/μL", "mg/dL"
    },
    testDate: {
        type: Date,
        required: [true, 'Test date is required'],
        index: true
    },
    referenceRange: {
        min: {
            type: Number,
            default: null
        },
        max: {
            type: Number,
            default: null
        }
    },
    isAbnormal: {
        type: Boolean,
        default: false
        // Calculated based on reference range
    }
}, {
    timestamps: true
});

// Compound indexes for efficient time-series queries
labResultSchema.index({ memberId: 1, marker: 1, testDate: -1 });
labResultSchema.index({ memberId: 1, testDate: -1 });
labResultSchema.index({ reportId: 1 });

// Method to check if value is abnormal
labResultSchema.methods.checkAbnormal = function () {
    if (this.referenceRange && this.referenceRange.min !== null && this.referenceRange.max !== null) {
        this.isAbnormal = this.value < this.referenceRange.min || this.value > this.referenceRange.max;
    }
    return this.isAbnormal;
};

// Static method to get trend for a marker
labResultSchema.statics.getTrend = async function (memberId, marker, limit = 10) {
    return this.find({ memberId, marker })
        .sort({ testDate: -1 })
        .limit(limit)
        .select('value unit testDate isAbnormal')
        .lean();
};

// Static method to get all markers for a member
labResultSchema.statics.getMarkersList = async function (memberId) {
    return this.distinct('marker', { memberId });
};

const LabResult = mongoose.model('LabResult', labResultSchema);

export default LabResult;
