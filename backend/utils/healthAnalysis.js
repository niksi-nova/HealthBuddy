/**
 * Health Analysis Utilities
 * Provides functions for calculating health scores, analyzing trends,
 * and comparing medical reports
 */

/**
 * Calculate health score based on percentage of markers in normal range
 * @param {Array} labResults - Array of lab result objects
 * @returns {number} Health score (0-100)
 */
export const calculateHealthScore = (labResults) => {
    if (!labResults || labResults.length === 0) {
        return 0;
    }

    const normalCount = labResults.filter(result => !result.isAbnormal).length;
    const totalCount = labResults.length;

    return Math.round((normalCount / totalCount) * 100);
};

/**
 * Get health status based on health score
 * @param {number} healthScore - Health score (0-100)
 * @returns {string} Status: 'normal', 'warning', or 'attention'
 */
export const getReportHealthStatus = (healthScore) => {
    if (healthScore >= 90) {
        return 'normal';
    } else if (healthScore >= 70) {
        return 'warning';
    } else {
        return 'attention';
    }
};

/**
 * Get default marker to display based on age and gender
 * @param {number} age - Person's age
 * @param {string} gender - Person's gender
 * @returns {string} Default marker name
 */
export const getDefaultMarker = (age, gender) => {
    // For adults over 40, prioritize HbA1c (diabetes screening)
    if (age >= 40) {
        return 'HbA1c';
    }

    // For women of childbearing age, prioritize Hemoglobin
    if (gender === 'Female' && age >= 15 && age < 50) {
        return 'Hemoglobin';
    }

    // For older adults, prioritize TSH (thyroid function)
    if (age >= 60) {
        return 'TSH';
    }

    // Default to Hemoglobin for general population
    return 'Hemoglobin';
};

/**
 * Categorize change in marker value
 * @param {number} currentValue - Current marker value
 * @param {number} previousValue - Previous marker value
 * @param {Object} referenceRange - Reference range {min, max}
 * @returns {string} Change category
 */
export const categorizeChange = (currentValue, previousValue, referenceRange) => {
    if (!previousValue || previousValue === null) {
        return 'new';
    }

    const percentChange = Math.abs((currentValue - previousValue) / previousValue) * 100;

    // If change is less than 5%, consider it stable
    if (percentChange < 5) {
        return 'stable';
    }

    const isCurrentNormal = referenceRange && referenceRange.min !== null && referenceRange.max !== null
        ? currentValue >= referenceRange.min && currentValue <= referenceRange.max
        : true;

    const isPreviousNormal = referenceRange && referenceRange.min !== null && referenceRange.max !== null
        ? previousValue >= referenceRange.min && previousValue <= referenceRange.max
        : true;

    // If moved from abnormal to normal
    if (!isPreviousNormal && isCurrentNormal) {
        return 'improved';
    }

    // If moved from normal to abnormal
    if (isPreviousNormal && !isCurrentNormal) {
        return 'worsened';
    }

    // If both abnormal or both normal, check direction
    if (currentValue > previousValue) {
        return percentChange > 15 ? 'significantly_increased' : 'slightly_increased';
    } else {
        return percentChange > 15 ? 'significantly_decreased' : 'slightly_decreased';
    }
};

/**
 * Get human-readable change description
 * @param {string} changeCategory - Category from categorizeChange
 * @returns {string} Human-readable description
 */
export const getChangeDescription = (changeCategory) => {
    const descriptions = {
        'stable': 'stable',
        'improved': 'improved',
        'worsened': 'worsened',
        'slightly_increased': 'slightly increased',
        'significantly_increased': 'significantly increased',
        'slightly_decreased': 'slightly decreased',
        'significantly_decreased': 'significantly decreased',
        'new': 'new marker'
    };

    return descriptions[changeCategory] || 'unchanged';
};

/**
 * Compare two reports and return changes for each marker
 * @param {Array} currentResults - Current report's lab results
 * @param {Array} previousResults - Previous report's lab results
 * @returns {Object} Map of marker names to change categories
 */
export const compareReports = (currentResults, previousResults) => {
    const changes = {};

    if (!previousResults || previousResults.length === 0) {
        // First report - all markers are new
        currentResults.forEach(result => {
            changes[result.marker] = 'new';
        });
        return changes;
    }

    // Create a map of previous results for quick lookup
    const previousMap = {};
    previousResults.forEach(result => {
        previousMap[result.marker] = result;
    });

    // Compare each current marker with previous
    currentResults.forEach(current => {
        const previous = previousMap[current.marker];

        if (!previous) {
            changes[current.marker] = 'new';
        } else {
            changes[current.marker] = categorizeChange(
                current.value,
                previous.value,
                current.referenceRange
            );
        }
    });

    return changes;
};

/**
 * Get summary text for a report
 * @param {number} abnormalCount - Number of abnormal markers
 * @param {number} totalCount - Total number of markers
 * @param {string} comparisonText - Optional comparison to previous report
 * @returns {string} Summary text
 */
export const getReportSummary = (abnormalCount, totalCount, comparisonText = '') => {
    if (abnormalCount === 0) {
        return `All ${totalCount} markers in normal range${comparisonText}`;
    } else if (abnormalCount === 1) {
        return `1 marker slightly out of range${comparisonText}`;
    } else {
        return `${abnormalCount} markers out of range${comparisonText}`;
    }
};

/**
 * Get top changes to highlight (most significant changes)
 * @param {Object} changes - Map of marker names to change categories
 * @param {number} limit - Maximum number of changes to return
 * @returns {Array} Array of {marker, change} objects
 */
export const getTopChanges = (changes, limit = 5) => {
    const priority = {
        'worsened': 5,
        'significantly_increased': 4,
        'significantly_decreased': 4,
        'improved': 3,
        'slightly_increased': 2,
        'slightly_decreased': 2,
        'stable': 1,
        'new': 0
    };

    return Object.entries(changes)
        .map(([marker, change]) => ({ marker, change, priority: priority[change] || 0 }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit)
        .map(({ marker, change }) => ({ marker, change }));
};
