/**
 * Blood Marker Reference Ranges (Frontend)
 * Standard reference ranges with gender-specific values
 * Used for graph display and status determination
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
    'tlc': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'total leucocyte count': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'total leukocyte count': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'wbc': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'wbc count': { min: 4000, max: 10000, unit: 'cells/cumm' },
    'white blood cell count': { min: 4000, max: 10000, unit: 'cells/cumm' },
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
    'platelet count': { min: 1.5, max: 4.1, unit: 'Lakhs/cmm' },
    'platelet': { min: 1.5, max: 4.1, unit: 'Lakhs/cmm' },
    'plt': { min: 1.5, max: 4.1, unit: 'Lakhs/cmm' },
    'mpv': { min: 8.0, max: 13.0, unit: 'fL' },
    'mean platelet volume': { min: 8.0, max: 13.0, unit: 'fL' },
    'glucose': { min: 70, max: 100, unit: 'mg/dl' },
    'fbs': { min: 70, max: 100, unit: 'mg/dl' },
    'fasting blood sugar': { min: 70, max: 100, unit: 'mg/dl' },
    'hba1c': { min: 4.0, max: 5.6, unit: '%' },
    'cholesterol': { min: 0, max: 200, unit: 'mg/dl' },
    'total cholesterol': { min: 0, max: 200, unit: 'mg/dl' },
    'hdl': { min: 40, max: 60, unit: 'mg/dl' },
    'ldl': { min: 0, max: 100, unit: 'mg/dl' },
    'triglycerides': { min: 0, max: 150, unit: 'mg/dl' },
    'creatinine': {
        male: { min: 0.7, max: 1.3, unit: 'mg/dl' },
        female: { min: 0.6, max: 1.1, unit: 'mg/dl' }
    },
    'urea': { min: 15, max: 40, unit: 'mg/dl' },
    'bilirubin': { min: 0.1, max: 1.2, unit: 'mg/dl' },
    'total bilirubin': { min: 0.1, max: 1.2, unit: 'mg/dl' },
    'sgot': { min: 0, max: 40, unit: 'U/L' },
    'sgpt': { min: 0, max: 40, unit: 'U/L' },
    'ast': { min: 0, max: 40, unit: 'U/L' },
    'alt': { min: 0, max: 40, unit: 'U/L' },
    'tsh': { min: 0.4, max: 4.0, unit: 'μIU/mL' },
    't3': { min: 80, max: 200, unit: 'ng/dl' },
    't4': { min: 5.1, max: 14.1, unit: 'μg/dl' },
    'esr': {
        male: { min: 0, max: 15, unit: 'mm/hr' },
        female: { min: 0, max: 20, unit: 'mm/hr' }
    },
    'vitamin d': { min: 30, max: 100, unit: 'ng/mL' },
    'vitamin b12': { min: 200, max: 900, unit: 'pg/mL' }
};

const normalizeMarkerName = (markerName) => {
    if (!markerName) return '';
    return markerName.toLowerCase().trim().replace(/[:\(\)]/g, '').replace(/\s+/g, ' ');
};

const getGenderSpecificRange = (range, gender) => {
    if (range.male && range.female) {
        if (gender === 'Other') {
            return {
                min: Math.min(range.male.min, range.female.min),
                max: Math.max(range.male.max, range.female.max),
                unit: range.male.unit
            };
        }
        return gender === 'Male' ? range.male : range.female;
    }
    return { min: range.min, max: range.max, unit: range.unit };
};

export const getReferenceRange = (markerName, gender = 'Female') => {
    const normalized = normalizeMarkerName(markerName);
    const range = REFERENCE_RANGES[normalized];

    if (!range) {
        for (const [key, value] of Object.entries(REFERENCE_RANGES)) {
            if (normalized.includes(key) || key.includes(normalized)) {
                return getGenderSpecificRange(value, gender);
            }
        }
        return null;
    }
    return getGenderSpecificRange(range, gender);
};

export const isAbnormal = (markerName, value, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range || range.min === null || range.max === null) return false;
    return value < range.min || value > range.max;
};

export const getStatus = (markerName, value, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range || range.min === null || range.max === null) return 'unknown';
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
};

export const getSeverity = (markerName, value, gender = 'Female') => {
    const range = getReferenceRange(markerName, gender);
    if (!range || range.min === null || range.max === null) return 'unknown';
    if (value >= range.min && value <= range.max) return 'normal';

    if (value < range.min) {
        const percentBelow = ((range.min - value) / range.min) * 100;
        return percentBelow > 20 ? 'significantly_low' : 'slightly_low';
    } else {
        const percentAbove = ((value - range.max) / range.max) * 100;
        return percentAbove > 20 ? 'significantly_high' : 'slightly_high';
    }
};

export default { getReferenceRange, isAbnormal, getStatus, getSeverity };
