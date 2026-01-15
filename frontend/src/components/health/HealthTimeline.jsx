import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/api';

/**
 * HealthTimeline Component
 * Displays a horizontal timeline of health reports with color-coded status dots
 */
const HealthTimeline = ({ timeline, onReportClick }) => {
    const [expandedReport, setExpandedReport] = useState(null);
    const [viewingReport, setViewingReport] = useState(null);

    if (!timeline || timeline.length === 0) {
        return (
            <div className="text-center py-8 text-charcoal/60">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">No reports available yet</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'normal':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'attention':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getStatusEmoji = (status) => {
        switch (status) {
            case 'normal':
                return '🟢';
            case 'warning':
                return '🟡';
            case 'attention':
                return '🔴';
            default:
                return '⚪';
        }
    };

    const handleDotClick = (reportId) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
        if (onReportClick) {
            onReportClick(reportId);
        }
    };

    const handleViewReport = async (reportId) => {
        setViewingReport(reportId);
        try {
            const { data } = await api.get(`/medical/report/${reportId}/view`);
            if (data.success && data.viewUrl) {
                // Open PDF in a new tab
                window.open(data.viewUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('Error fetching report URL:', error);
            alert(error.response?.data?.message || 'Failed to load report. Please try again.');
        } finally {
            setViewingReport(null);
        }
    };

    return (
        <div className="relative">
            {/* Mobile: Vertical scrollable layout */}
            <div className="md:hidden">
                {/* Vertical Timeline Line */}
                <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-sage/20" />

                {/* Vertical Timeline */}
                <div className="relative space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {[...timeline].reverse().map((report) => (
                        <div
                            key={report.reportId}
                            className="flex items-start gap-3 pl-0"
                        >
                            {/* Dot */}
                            <button
                                onClick={() => handleDotClick(report.reportId)}
                                className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
                                    transition-all duration-300 cursor-pointer
                                    ${getStatusColor(report.status)} 
                                    ${expandedReport === report.reportId ? 'scale-110 shadow-lg' : 'active:scale-95'}
                                    border-3 border-white`}
                                aria-label={`Report from ${new Date(report.reportDate).toLocaleDateString()}`}
                            >
                                <span className="text-lg">{getStatusEmoji(report.status)}</span>
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-charcoal">
                                    {new Date(report.reportDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <div className="text-xs text-charcoal/60">
                                    Score: {report.healthScore}% • {report.markerCount} markers
                                </div>

                                {/* Expanded Details */}
                                {expandedReport === report.reportId && (
                                    <div className="mt-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-sage/20 animate-fadeIn">
                                        <div className="text-xs text-charcoal/80 leading-relaxed mb-3">
                                            {report.summary}
                                        </div>
                                        <button
                                            onClick={() => handleViewReport(report.reportId)}
                                            disabled={viewingReport === report.reportId}
                                            className="w-full px-3 py-2.5 bg-sage text-white text-xs font-medium rounded-lg 
                                                active:bg-sage/80 transition-all duration-200 disabled:opacity-50 
                                                disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {viewingReport === report.reportId ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>📄 View Original Report</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tablet/Desktop: Horizontal scrollable layout */}
            <div className="hidden md:block">
                {/* Timeline Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-sage/20" />

                {/* Horizontal Scroll Container */}
                <div className="overflow-x-auto pb-2 -mx-2 px-2">
                    <div className="relative flex justify-between items-start min-w-[600px]">
                        {[...timeline].reverse().map((report) => (
                            <div
                                key={report.reportId}
                                className="flex flex-col items-center"
                                style={{ flex: 1 }}
                            >
                                {/* Dot */}
                                <button
                                    onClick={() => handleDotClick(report.reportId)}
                                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center 
                                        transition-all duration-300 cursor-pointer
                                        ${getStatusColor(report.status)} 
                                        ${expandedReport === report.reportId ? 'scale-125 shadow-lg' : 'hover:scale-110'}
                                        border-4 border-white`}
                                    aria-label={`Report from ${new Date(report.reportDate).toLocaleDateString()}`}
                                >
                                    <span className="text-2xl">{getStatusEmoji(report.status)}</span>
                                </button>

                                {/* Date Label */}
                                <div className="mt-2 text-xs text-charcoal/70 font-medium text-center">
                                    {new Date(report.reportDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>

                                {/* Expanded Details */}
                                {expandedReport === report.reportId && (
                                    <div className="mt-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-sage/20 
                                        animate-fadeIn min-w-[200px] text-center">
                                        <div className="text-sm font-semibold text-charcoal mb-1">
                                            Health Score: {report.healthScore}%
                                        </div>
                                        <div className="text-xs text-charcoal/70 mb-2">
                                            {report.markerCount} markers tested
                                        </div>
                                        <div className="text-xs text-charcoal/80 leading-relaxed mb-3">
                                            {report.summary}
                                        </div>

                                        {/* View Report Button */}
                                        <button
                                            onClick={() => handleViewReport(report.reportId)}
                                            disabled={viewingReport === report.reportId}
                                            className="w-full px-3 py-2 bg-sage text-white text-xs font-medium rounded-lg 
                                                hover:bg-sage/90 transition-all duration-200 disabled:opacity-50 
                                                disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {viewingReport === report.reportId ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    📄 View Original Report
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend - responsive wrapping */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-6 text-xs text-charcoal/70">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-base md:text-lg">🟢</span>
                    <span>Normal (≥90%)</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-base md:text-lg">🟡</span>
                    <span>Minor issues (70-89%)</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-base md:text-lg">🔴</span>
                    <span>Attention (&lt;70%)</span>
                </div>
            </div>
        </div>
    );
};

HealthTimeline.propTypes = {
    timeline: PropTypes.arrayOf(
        PropTypes.shape({
            reportId: PropTypes.string.isRequired,
            reportDate: PropTypes.string.isRequired,
            healthScore: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
            markerCount: PropTypes.number.isRequired,
            abnormalCount: PropTypes.number.isRequired,
            summary: PropTypes.string.isRequired
        })
    ).isRequired,
    onReportClick: PropTypes.func
};

export default HealthTimeline;
