/**
 * Blood Marker Reference Ranges
 * Standard reference ranges with gender-specific values where applicable
 * Used for determining abnormality across timeline, graphs, and chatbot
 */

/**
 * Reference ranges organized by marker name (lowercase, normalized)
 * Each entry can have: { min, max } or { male: { min, max }, female: { min, max } }
 */
const REFERENCE_RANGES = {
    // Complete Blood Count - Gender-specific
    'hemoglobin': {
        male: { min: 13.0, max: 17.0, unit: 'gm/dl' },
        female: { min: 12.0, max: 15.0, unit: 'gm/dl' }
    },
    'r.b.c. count': {
        male: { min: 4.5, max: 5.5, unit: 'million/cumm' },
        female: { min: 3.8, max: 4.8, unit: 'million/cumm' }
    },
    'rbc count': {
        male: { min: 4.5, max: 5.5, unit: 'million/cumm' },
        female: { min: 3.8, max: 4.8, unit: 'million/cumm' }
    },
    'p.c.v.': {
        male: { min: 40, max: 50, unit: '%' },
        female: { min: 36, max: 46, unit: '%' }
    },
    'pcv': {
        male: { min: 40, max: 50, unit: '%' },
        female: { min: 36, max: 46, unit: '%' }
    },
    'packed cell volume': {
        male: { min: 40, max: 50, unit: '%' },
        female: { min: 36, max: 46, unit: '%' }
    },
    'hematocrit': {
        male: { min: 40, max: 50, unit: '%' },
        female: { min: 36, max: 46, unit: '%' }
    },

    // RBC Indices - Same for both genders
    'mcv': { min: 83, max: 101, unit: 'fL' },
    'mean corpuscular volume': { min: 83, max: 101, unit: 'fL' },
    'mch': { min: 27, max: 32, unit: 'pg' },
    'mean corpuscular hemoglobin': { min: 27, max: 32, unit: 'pg' },
    'mchc': { min: 31.5, max: 34.5, unit: 'gm/dl' },
    'mean corpuscular hemoglobin concentration': { min: 31.5, max: 34.5, unit: 'gm/dl' },
    'rdw-cv': { min: 11.6, max: 14.0, unit: '%' },
    'rdw cv': { min: 11.6, max: 14.0, unit: '%' },
    'rdw': { min: 11.6, max: 14.0, unit: '%' },
    'rdw sd': { min: 39, max: 46, unit: 'fL' },
    'rdw-sd': { min: 39, max: 46, unit: 'fL' },

    // WBC Count
    'tlc': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'total leucocyte count': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'total leukocyte count': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'wbc': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'wbc count': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'white blood cell count': { min: 4000, max: 10000, unit: 'cells/cumm' },

    // Differential Leucocyte Count (DLC)
    'neutrophils': { min: 40, max: 80, unit: '%' },
    'neutrophil': { min: 40, max: 80, unit: '%' },
    'lymphocytes': { min: 20, max: 40, unit: '%' },
    'lymphocyte': { min: 20, max: 40, unit: '%' },
    'eosinophils': { min: 1, max: 6, unit: '%' },
    'eosinophil': { min: 1, max: 6, unit: '%' },
    'monocytes': { min: 2, max: 10, unit: '%' },
    'monocyte': { min: 2, max: 10, unit: '%' },
    'basophils': { min: 0, max: 2.0, unit: '%' },
    'basophil': { min: 0, max: 2.0, unit: '%' },

    // Absolute Counts
    'anc': { min: 2.0, max: 7.0, unit: '10³/μL' },
    'absolute neutrophil count': { min: 2.0, max: 7.0, unit: '10³/μL' },
    'alc': { min: 1.0, max: 3.0, unit: '10³/μL' },
    'absolute lymphocyte count': { min: 1.0, max: 3.0, unit: '10³/μL' },
    'aec': { min: 0.02, max: 0.5, unit: '10³/μL' },
    'absolute eosinophil count': { min: 0.02, max: 0.5, unit: '10³/μL' },
    'amc': { min: 0.2, max: 1.0, unit: '10³/μL' },
    'absolute monocyte count': { min: 0.2, max: 1.0, unit: '10³/μL' },
    'abc': { min: 0.02, max: 0.1, unit: '10³/μL' },
    'absolute basophil count': { min: 0.02, max: 0.1, unit: '10³/μL' },

    // Platelet
    'platelet count': { min: 1.5, max: 4.1, unit: 'Lakhs/cmm' },
    'platelet': { min: 1.5, max: 4.1, unit: 'Lakhs/cmm' },
    'plt': { min: 1.5, max: 4.1, unit: 'Lakhs/cmm' },
    'mpv': { min: 8.0, max: 13.0, unit: 'fL' },
    'mean platelet volume': { min: 8.0, max: 13.0, unit: 'fL' },

    // Blood Sugar
    'glucose': { min: 70, max: 100, unit: 'mg/dl' },
    'fbs': { min: 70, max: 100, unit: 'mg/dl' },
    'fasting blood sugar': { min: 70, max: 100, unit: 'mg/dl' },
    'fasting glucose': { min: 70, max: 100, unit: 'mg/dl' },
    'ppbs': { min: 70, max: 140, unit: 'mg/dl' },
    'post prandial blood sugar': { min: 70, max: 140, unit: 'mg/dl' },
    'rbs': { min: 70, max: 140, unit: 'mg/dl' },
    'random blood sugar': { min: 70, max: 140, unit: 'mg/dl' },
    'hba1c': { min: 4.0, max: 5.6, unit: '%' },

    // Lipid Profile
    'cholesterol': { min: 0, max: 200, unit: 'mg/dl' },
    'total cholesterol': { min: 0, max: 200, unit: 'mg/dl' },
    'hdl': { min: 40, max: 60, unit: 'mg/dl' },
    'ldl': { min: 0, max: 100, unit: 'mg/dl' },
    'vldl': { min: 5, max: 40, unit: 'mg/dl' },
    'triglycerides': { min: 0, max: 150, unit: 'mg/dl' },
    'triglyceride': { min: 0, max: 150, unit: 'mg/dl' },

    // Kidney Function
    'creatinine': {
        male: { min: 0.7, max: 1.3, unit: 'mg/dl' },
        female: { min: 0.6, max: 1.1, unit: 'mg/dl' }
    },
    'urea': { min: 15, max: 40, unit: 'mg/dl' },
    'blood urea': { min: 15, max: 40, unit: 'mg/dl' },
    'bun': { min: 7, max: 20, unit: 'mg/dl' },
    'uric acid': {
        male: { min: 3.4, max: 7.0, unit: 'mg/dl' },
        female: { min: 2.4, max: 6.0, unit: 'mg/dl' }
    },

    // Liver Function
    'bilirubin': { min: 0.1, max: 1.2, unit: 'mg/dl' },
    'total bilirubin': { min: 0.1, max: 1.2, unit: 'mg/dl' },
    'direct bilirubin': { min: 0, max: 0.3, unit: 'mg/dl' },
    'indirect bilirubin': { min: 0.1, max: 0.9, unit: 'mg/dl' },
    'sgot': { min: 0, max: 40, unit: 'U/L' },
    'sgpt': { min: 0, max: 40, unit: 'U/L' },
    'ast': { min: 0, max: 40, unit: 'U/L' },
    'alt': { min: 0, max: 40, unit: 'U/L' },
    'alp': { min: 44, max: 147, unit: 'U/L' },
    'alkaline phosphatase': { min: 44, max: 147, unit: 'U/L' },
    'ggt': { min: 0, max: 50, unit: 'U/L' },
    'protein': { min: 6.0, max: 8.3, unit: 'g/dl' },
    'total protein': { min: 6.0, max: 8.3, unit: 'g/dl' },
    'albumin': { min: 3.5, max: 5.0, unit: 'g/dl' },
    'globulin': { min: 2.0, max: 3.5, unit: 'g/dl' },

    // Electrolytes
    'sodium': { min: 136, max: 145, unit: 'mEq/L' },
    'potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
    'calcium': { min: 8.5, max: 10.5, unit: 'mg/dl' },
    'chloride': { min: 98, max: 106, unit: 'mEq/L' },

    // Thyroid
    'tsh': { min: 0.4, max: 4.0, unit: 'μIU/mL' },
    't3': { min: 80, max: 200, unit: 'ng/dl' },
    't4': { min: 5.1, max: 14.1, unit: 'μg/dl' },

    // Others
    'esr': {
        male: { min: 0, max: 15, unit: 'mm/hr' },
        female: { min: 0, max: 20, unit: 'mm/hr' }
    },
    'vitamin d': { min: 30, max: 100, unit: 'ng/mL' },
    'vitamin b12': { min: 200, max: 900, unit: 'pg/mL' },
    'iron': {
        male: { min: 60, max: 170, unit: 'μg/dL' },
        female: { min: 37, max: 145, unit: 'μg/dL' }
    },
    'ferritin': {
        male: { min: 30, max: 400, unit: 'ng/mL' },
        female: { min: 15, max: 150, unit: 'ng/mL' }
    }
};

/**
 * Normalize marker name for lookup
 * @param {string} markerName - The marker name to normalize
 * @returns {string} Normalized marker name (lowercase, trimmed)
 */
const normalizeMarkerName = (markerName) => {
    if (!markerName) return '';
    return markerName.toLowerCase().trim().replace(/[:\(\)]/g, '').replace(/\s+/g, ' ');
};

/**
 * Get reference range for a marker
 * @param {string} markerName - The marker name
 * @param {string} gender - Gender: 'Male', 'Female', or 'Other'
 * @returns {{ min: number, max: number, unit: string } | null} Reference range or null if not found
 */
export const getReferenceRange = (markerName, gender = 'Female') => {
    const normalized = normalizeMarkerName(markerName);
    const range = REFERENCE_RANGES[normalized];

    if (!range) {
        // Try partial match
        for (const [key, value] of Object.entries(REFERENCE_RANGES)) {
            if (normalized.includes(key) || key.includes(normalized)) {
                return getGenderSpecificRange(value, gender);
            }
        }
        return null;
    }

    return getGenderSpecificRange(range, gender);
};

/**
 * Extract gender-specific range from a range definition
 * @param {object} range - Range definition (may have male/female keys or just min/max)
 * @param {string} gender - Gender: 'Male', 'Female', or 'Other'
 * @returns {{ min: number, max: number, unit: string }}
 */
const getGenderSpecificRange = (range, gender) => {
    // If range has gender-specific values
    if (range.male && range.female) {
        // For 'Other' gender, use the wider range (more lenient)
        if (gender === 'Other') {
            return {
                min: Math.min(range.male.min, range.female.min),
                max: Math.max(range.male.max, range.female.max),
                unit: range.male.unit
            };
        }
        return gender === 'Male' ? range.male : range.female;
    }
    // Range is same for both genders
    return { min: range.min, max: range.max, unit: range.unit };
};

/**
 * Check if a value is abnormal
 * @param {string} markerName - The marker name
 * @param {number} value - The value to check
 * @param {string} gender - Gender: 'Male', 'Female', or 'Other'
 * @returns {boolean} True if abnormal, false if normal or range not found
 */
export const isAbnormal = (markerName, value, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range || range.min === null || range.max === null) {
        return false; // Can't determine without reference range
    }
    return value < range.min || value > range.max;
};

/**
 * Get status classification for a value
 * @param {string} markerName - The marker name
 * @param {number} value - The value to check
 * @param {string} gender - Gender: 'Male', 'Female', or 'Other'
 * @returns {'normal' | 'low' | 'high' | 'unknown'} Status
 */
export const getStatus = (markerName, value, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range || range.min === null || range.max === null) {
        return 'unknown';
    }
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
};

/**
 * Get severity level for abnormal values
 * @param {string} markerName - The marker name
 * @param {number} value - The value to check
 * @param {string} gender - Gender: 'Male', 'Female', or 'Other'
 * @returns {'normal' | 'slightly_low' | 'slightly_high' | 'significantly_low' | 'significantly_high' | 'unknown'} Severity
 */
export const getSeverity = (markerName, value, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range || range.min === null || range.max === null) {
        return 'unknown';
    }

    if (value >= range.min && value <= range.max) {
        return 'normal';
    }

    // Calculate percentage deviation
    if (value < range.min) {
        const percentBelow = ((range.min - value) / range.min) * 100;
        return percentBelow > 20 ? 'significantly_low' : 'slightly_low';
    } else {
        const percentAbove = ((value - range.max) / range.max) * 100;
        return percentAbove > 20 ? 'significantly_high' : 'slightly_high';
    }
};

/**
 * Format reference range as string
 * @param {string} markerName - The marker name
 * @param {string} gender - Gender: 'Male', 'Female', or 'Other'
 * @returns {string} Formatted range string like "12.0 - 15.0 gm/dl" or "N/A"
 */
export const formatReferenceRange = (markerName, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range) return 'N/A';
    return `${range.min} - ${range.max} ${range.unit || ''}`.trim();
};

export default {
    getReferenceRange,
    isAbnormal,
    getStatus,
    getSeverity,
    formatReferenceRange
};
