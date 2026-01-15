import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ChangeSummary Component
 * Displays changes in biomarkers since the last report
 */
const ChangeSummary = ({ changes }) => {
    const [showDetails, setShowDetails] = useState(false);

    if (!changes || Object.keys(changes).length === 0) {
        return (
            <div className="text-center py-6 text-charcoal/60">
                <div className="text-3xl mb-2">🔄</div>
                <p className="text-sm">No previous report to compare</p>
            </div>
        );
    }

    const getChangeIcon = (change) => {
        switch (change) {
            case 'stable':
                return '🔄';
            case 'improved':
                return '✅';
            case 'slightly_increased':
            case 'significantly_increased':
                return '⚠️';
            case 'slightly_decreased':
            case 'significantly_decreased':
                return '📉';
            case 'worsened':
                return '❌';
            case 'new marker':
                return '🆕';
            default:
                return '•';
        }
    };

    const getChangeColor = (change) => {
        switch (change) {
            case 'stable':
                return 'text-charcoal/70';
            case 'improved':
                return 'text-green-600';
            case 'slightly_increased':
            case 'slightly_decreased':
                return 'text-yellow-600';
            case 'significantly_increased':
            case 'significantly_decreased':
            case 'worsened':
                return 'text-red-600';
            case 'new marker':
                return 'text-blue-600';
            default:
                return 'text-charcoal/70';
        }
    };

    const changeEntries = Object.entries(changes);

    return (
        <div>
            <div className="mb-3">
                <h3 className="text-base font-semibold text-charcoal mb-1">
                    🔄 Since your last report:
                </h3>
            </div>

            {/* Change List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {changeEntries.map(([marker, change]) => (
                    <div
                        key={marker}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/30 hover:bg-white/50 active:bg-white/60 transition-all"
                    >
                        <span className="text-xl flex-shrink-0">{getChangeIcon(change)}</span>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-charcoal block truncate">{marker}</span>
                            <span className={`text-xs ${getChangeColor(change)}`}>
                                {change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Details Toggle - larger touch target */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 px-3 py-2 text-sm text-sage hover:text-sage/80 font-medium transition-colors rounded-lg active:bg-sage/10"
            >
                {showDetails ? '▼ Hide details' : '▶ Show details'}
            </button>

            {/* Detailed Explanation */}
            {showDetails && (
                <div className="mt-3 p-4 bg-white/40 rounded-lg border border-sage/20 animate-fadeIn">
                    <h4 className="text-sm font-semibold text-charcoal mb-2">
                        Understanding Changes:
                    </h4>
                    <ul className="space-y-2 text-xs text-charcoal/70">
                        <li className="flex items-start gap-2">
                            <span className="text-base">✅</span>
                            <span><strong>Improved:</strong> Marker moved from abnormal to normal range</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-base">🔄</span>
                            <span><strong>Stable:</strong> Less than 5% change from previous value</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-base">⚠️</span>
                            <span><strong>Increased/Decreased:</strong> Notable change in value (may require attention)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-base">❌</span>
                            <span><strong>Worsened:</strong> Marker moved from normal to abnormal range</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-base">🆕</span>
                            <span><strong>New marker:</strong> First time this marker was tested</span>
                        </li>
                    </ul>
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>Note:</strong> These are automated comparisons. Always consult your healthcare provider for medical interpretation.
                    </div>
                </div>
            )}
        </div>
    );
};

ChangeSummary.propTypes = {
    changes: PropTypes.objectOf(PropTypes.string).isRequired
};

export default ChangeSummary;
