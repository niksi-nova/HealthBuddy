import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import GlassCard from '../ui/GlassCard';

/**
 * FamilyHealthSummary Component
 * Displays an overview of health status for all family members
 */
const FamilyHealthSummary = ({ onClose }) => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHealthSummary();
    }, []);

    const fetchHealthSummary = async () => {
        try {
            const { data } = await api.get('/family/health-summary');
            setSummaryData(data);
        } catch (err) {
            console.error('Error fetching health summary:', err);
            setError('Failed to load health summary');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'normal':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'attention':
                return 'bg-red-500';
            default:
                return 'bg-gray-300';
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

    const getStatusText = (status) => {
        switch (status) {
            case 'normal':
                return 'Healthy';
            case 'warning':
                return 'Needs Attention';
            case 'attention':
                return 'Critical';
            default:
                return 'No Data';
        }
    };

    const handleMemberClick = (member) => {
        if (!member.isAdmin) {
            navigate(`/member/${member.memberId}`);
            if (onClose) onClose();
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop - Brighter with gradient */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-sand/80 via-sage/20 to-terracotta/20 backdrop-blur-md"
                    onClick={onClose}
                />
                <div className="relative bg-white/40 backdrop-blur-glass border border-white/50 shadow-glow rounded-card p-8 max-w-md">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sage border-t-transparent"></div>
                        <span className="ml-3 text-charcoal">Loading health summary...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop - Brighter with gradient */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-sand/80 via-sage/20 to-terracotta/20 backdrop-blur-md"
                    onClick={onClose}
                />
                <div className="relative bg-white/40 backdrop-blur-glass border border-white/50 shadow-glow rounded-card p-8 max-w-md">
                    <div className="text-center">
                        <div className="text-4xl mb-3">⚠️</div>
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop - Brighter with gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-sand/80 via-sage/20 to-terracotta/20 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative w-full max-w-4xl my-8">
                <div className="bg-white/40 backdrop-blur-glass border border-white/50 shadow-glow rounded-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-sage">
                            📊 Family Health Summary
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-charcoal/50 hover:text-charcoal transition-colors text-2xl leading-none"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Overall Score Card */}
                    <div className="mb-8">
                        <GlassCard className={`p-6 ${summaryData.overallHealthScore !== null
                            ? getStatusColor(summaryData.overallStatus) + '/10'
                            : 'bg-gray-100'}`}>
                            <div className="text-center">
                                <div className="text-5xl mb-2">
                                    {getStatusEmoji(summaryData.overallStatus)}
                                </div>
                                <div className="text-4xl font-bold text-charcoal mb-2">
                                    {summaryData.overallHealthScore !== null
                                        ? `${summaryData.overallHealthScore}%`
                                        : 'N/A'}
                                </div>
                                <div className="text-lg text-charcoal/70">
                                    Overall Family Health Score
                                </div>
                                <div className="mt-4 flex justify-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {summaryData.summary.healthy}
                                        </div>
                                        <div className="text-charcoal/60">Healthy</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {summaryData.summary.needingAttention}
                                        </div>
                                        <div className="text-charcoal/60">Need Attention</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-500">
                                            {summaryData.summary.noData}
                                        </div>
                                        <div className="text-charcoal/60">No Data</div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Members List */}
                    <h3 className="text-lg font-display font-bold text-sage mb-4">
                        Family Members ({summaryData.totalMembers})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summaryData.memberHealthData.map((member) => (
                            <div
                                key={member.memberId}
                                onClick={() => handleMemberClick(member)}
                                className={`p-4 rounded-xl border-2 transition-all ${member.isAdmin
                                    ? 'bg-white/30 border-sage/20 cursor-default'
                                    : 'bg-white/50 border-sage/20 hover:border-sage cursor-pointer hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    {member.profilePicture ? (
                                        <img
                                            src={`http://localhost:3002${member.profilePicture}`}
                                            alt={member.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-sage/30"
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: member.avatarColor || '#8B9D83' }}
                                        >
                                            {member.name?.charAt(0)}
                                        </div>
                                    )}

                                    {/* Member Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-charcoal truncate">
                                                {member.name}
                                            </h4>
                                            {member.isAdmin && (
                                                <span className="text-xs bg-sage/20 text-sage px-2 py-0.5 rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-charcoal/60">
                                            {member.relation} • {member.age} years
                                        </p>
                                    </div>

                                    {/* Health Status */}
                                    <div className="text-right">
                                        <div className="text-2xl mb-1">
                                            {getStatusEmoji(member.status)}
                                        </div>
                                        {member.healthScore !== null ? (
                                            <>
                                                <div className="text-lg font-bold text-charcoal">
                                                    {member.healthScore}%
                                                </div>
                                                <div className="text-xs text-charcoal/60">
                                                    {member.abnormalCount > 0
                                                        ? `${member.abnormalCount} abnormal`
                                                        : 'All normal'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-charcoal/50">
                                                No reports
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Last Report Date */}
                                {member.lastReportDate && (
                                    <div className="mt-3 pt-3 border-t border-sage/10 text-xs text-charcoal/50">
                                        Last report: {new Date(member.lastReportDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t border-sage/20 flex flex-wrap justify-center gap-4 text-xs text-charcoal/70">
                        <div className="flex items-center gap-1">
                            <span>🟢</span>
                            <span>Normal (≥90%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🟡</span>
                            <span>Warning (70-89%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🔴</span>
                            <span>Attention (&lt;70%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>⚪</span>
                            <span>No Data</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

FamilyHealthSummary.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default FamilyHealthSummary;
