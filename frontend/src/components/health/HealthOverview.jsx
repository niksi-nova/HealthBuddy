import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import GlassCard from '../ui/GlassCard';
import HealthTimeline from './HealthTimeline';
import MarkerTrendGraph from './MarkerTrendGraph';
import ChangeSummary from './ChangeSummary';

/**
 * HealthOverview Component
 * Main container for health overview tab showing timeline, trends, and changes
 */
const HealthOverview = ({ memberId }) => {
    const [overviewData, setOverviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHealthOverview();
    }, [memberId]);

    const fetchHealthOverview = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/medical/health-overview/${memberId}`);
            setOverviewData(data);
        } catch (err) {
            console.error('Error fetching health overview:', err);
            setError('Failed to load health overview data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-charcoal/60">Loading health overview...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-sm text-charcoal/70">{error}</p>
            </div>
        );
    }

    if (!overviewData) {
        return null;
    }

    const { timeline, defaultMarker, availableMarkers, changes } = overviewData;

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Health Timeline Section */}
            <GlassCard className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-display font-bold text-sage mb-4 md:mb-6">
                    📊 Health Timeline
                </h2>
                <p className="text-xs md:text-sm text-charcoal/70 mb-4 md:mb-6">
                    Track your health journey over time. Each dot represents a report, color-coded by overall health status.
                </p>
                <HealthTimeline timeline={timeline} />
            </GlassCard>

            {/* Marker Trend Graph Section */}
            {availableMarkers && availableMarkers.length > 0 && (
                <GlassCard className="p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-display font-bold text-sage mb-4 md:mb-6">
                        📈 Marker Trend
                    </h2>
                    <p className="text-xs md:text-sm text-charcoal/70 mb-4 md:mb-6">
                        Focus on one biomarker at a time. The shaded area shows the normal range.
                    </p>
                    <MarkerTrendGraph
                        memberId={memberId}
                        defaultMarker={defaultMarker}
                        availableMarkers={availableMarkers}
                    />
                </GlassCard>
            )}

            {/* Change Summary Section */}
            {timeline && timeline.length >= 2 && (
                <GlassCard className="p-4 md:p-6">
                    <ChangeSummary changes={changes} />
                </GlassCard>
            )}

            {/* Empty State */}
            {timeline.length === 0 && (
                <GlassCard className="p-8 md:p-12">
                    <div className="text-center text-charcoal/60">
                        <div className="text-5xl md:text-6xl mb-3 md:mb-4">📋</div>
                        <h3 className="text-base md:text-lg font-semibold mb-2">No Reports Yet</h3>
                        <p className="text-xs md:text-sm">
                            Upload your first medical report to see health insights and trends.
                        </p>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

HealthOverview.propTypes = {
    memberId: PropTypes.string.isRequired
};

export default HealthOverview;
