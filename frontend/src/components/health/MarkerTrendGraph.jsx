import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../utils/api';

/**
 * MarkerTrendGraph Component
 * Displays a line chart for a single biomarker with normal range shading
 */
const MarkerTrendGraph = ({ memberId, defaultMarker, availableMarkers }) => {
    const [selectedMarker, setSelectedMarker] = useState(defaultMarker);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    useEffect(() => {
        if (selectedMarker) {
            fetchTrendData(selectedMarker);
        }
    }, [selectedMarker, memberId]);

    const fetchTrendData = async (marker) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/medical/trends/${memberId}/${encodeURIComponent(marker)}`);
            // Reverse to show oldest to newest (left to right)
            setTrendData(data.data.reverse());
        } catch (error) {
            console.error('Error fetching trend data:', error);
            setTrendData([]);
        } finally {
            setLoading(false);
        }
    };

    if (!availableMarkers || availableMarkers.length === 0) {
        return (
            <div className="text-center py-8 text-charcoal/60">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-sm">No marker data available</p>
            </div>
        );
    }

    const renderGraph = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-charcoal/60">Loading trend data...</div>
                </div>
            );
        }

        if (trendData.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-charcoal/60">
                    <div className="text-center">
                        <div className="text-3xl mb-2">📊</div>
                        <p className="text-sm">No data available for {selectedMarker}</p>
                    </div>
                </div>
            );
        }

        // Calculate graph dimensions and scales - optimized for mobile
        const width = 800;
        const height = 280;
        const padding = { top: 20, right: 30, bottom: 40, left: 60 }; // Increased padding
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        // Get min and max values
        const values = trendData.map(d => Number(d.value)); // Ensure numbers
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Check if we have reference range
        const hasReferenceRange = trendData.some(d =>
            d.referenceRange &&
            d.referenceRange.min !== null &&
            d.referenceRange.max !== null
        );

        // --- FIX: Robust Y-Axis Range Calculation ---
        let yMin, yMax;
        let dataMin = minValue;
        let dataMax = maxValue;

        if (hasReferenceRange) {
            const refMin = trendData[0].referenceRange?.min ?? minValue;
            const refMax = trendData[0].referenceRange?.max ?? maxValue;
            dataMin = Math.min(minValue, refMin);
            dataMax = Math.max(maxValue, refMax);
        }

        // Calculate range padding (margin)
        const rangeSpan = dataMax - dataMin;
        // If flat line (rangeSpan 0), add arbitrary buffer. Otherwise add 10% padding.
        const margin = rangeSpan === 0 ? (Math.abs(dataMin) * 0.1 || 10) : rangeSpan * 0.1;

        yMin = dataMin - margin;
        yMax = dataMax + margin;

        // --- FIX: Handle Single Data Point (Prevent Divide by Zero) ---
        const xScale = (index) => {
            if (trendData.length === 1) return padding.left + (graphWidth / 2); // Center if only 1 point
            return padding.left + (index / (trendData.length - 1)) * graphWidth;
        };

        const yScale = (value) => {
            // Handle case where yMax equals yMin (rare, but possible if margin logic fails)
            if (yMax === yMin) return padding.top + (graphHeight / 2);
            return padding.top + graphHeight - ((value - yMin) / (yMax - yMin)) * graphHeight;
        }

        // Generate path for line chart
        const linePath = trendData.length > 1
            ? trendData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ')
            : ''; // No line if only one point

        // Generate reference range shading
        let referenceRangePath = '';
        if (hasReferenceRange) {
            const refMin = trendData[0].referenceRange?.min;
            const refMax = trendData[0].referenceRange?.max;
            if (refMin !== null && refMax !== null) {
                referenceRangePath = `
                    M ${padding.left} ${yScale(refMin)}
                    L ${padding.left + graphWidth} ${yScale(refMin)}
                    L ${padding.left + graphWidth} ${yScale(refMax)}
                    L ${padding.left} ${yScale(refMax)}
                    Z
                `;
            }
        }

        const getStatusLabel = (point) => {
            if (!point.referenceRange || point.referenceRange.min === null || point.referenceRange.max === null) {
                return 'No reference range';
            }

            const { value } = point;
            const { min, max } = point.referenceRange;

            if (value >= min && value <= max) {
                return 'Normal';
            } else if (value < min) {
                const percentBelow = ((min - value) / min) * 100;
                return percentBelow > 20 ? 'Significantly Low' : 'Slightly Low';
            } else {
                const percentAbove = ((value - max) / max) * 100;
                return percentAbove > 20 ? 'Significantly High' : 'Slightly High';
            }
        };

        return (
            <div className="relative">
                {/* Graph container with horizontal scroll on very small screens */}
                <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-auto min-w-[320px]"
                        style={{ maxHeight: '280px' }}
                    >
                        {/* Reference range shading */}
                        {referenceRangePath && (
                            <path
                                d={referenceRangePath}
                                fill="#8B9D83"
                                fillOpacity="0.15"
                            />
                        )}

                        {/* Y-axis */}
                        <line
                            x1={padding.left}
                            y1={padding.top}
                            x2={padding.left}
                            y2={height - padding.bottom}
                            stroke="#4A5568"
                            strokeWidth="1"
                        />

                        {/* X-axis */}
                        <line
                            x1={padding.left}
                            y1={height - padding.bottom}
                            x2={width - padding.right}
                            y2={height - padding.bottom}
                            stroke="#4A5568"
                            strokeWidth="1"
                        />

                        {/* Line chart */}
                        {trendData.length > 1 && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#8B9D83"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Data points */}
                        {trendData.map((point, index) => (
                            <g key={index}>
                                <circle
                                    cx={xScale(index)}
                                    cy={yScale(point.value)}
                                    r={hoveredPoint === index ? 8 : 6}
                                    fill={point.isAbnormal ? '#E53E3E' : '#8B9D83'}
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer transition-all duration-200"
                                    onMouseEnter={() => setHoveredPoint(index)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            </g>
                        ))}

                        {/* X-axis labels (dates) */}
                        {trendData.map((point, index) => {
                            const showLabel = trendData.length <= 5 || index % Math.ceil(trendData.length / 4) === 0 || index === trendData.length - 1;
                            if (!showLabel) return null;

                            // FIX: Prevent text clipping for first/last labels
                            let textAnchor = "middle";
                            if (index === 0 && trendData.length > 1) textAnchor = "start";
                            if (index === trendData.length - 1 && trendData.length > 1) textAnchor = "end";

                            return (
                                <text
                                    key={index}
                                    x={xScale(index)}
                                    y={height - padding.bottom + 18}
                                    textAnchor={textAnchor}
                                    fontSize="10"
                                    fill="#4A5568"
                                >
                                    {new Date(point.testDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </text>
                            );
                        })}

                        {/* Y-axis labels */}
                        <text
                            x={padding.left - 8}
                            y={yScale(yMax)}
                            textAnchor="end"
                            fontSize="10"
                            fill="#4A5568"
                            dominantBaseline="middle"
                        >
                            {yMax.toFixed(1)}
                        </text>
                        <text
                            x={padding.left - 8}
                            y={yScale(yMin)}
                            textAnchor="end"
                            fontSize="10"
                            fill="#4A5568"
                            dominantBaseline="middle"
                        >
                            {yMin.toFixed(1)}
                        </text>
                    </svg>
                </div>

                {/* Tooltip */}
                {hoveredPoint !== null && (
                    <div className="absolute top-0 left-2 right-2 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 
                        bg-white/95 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 rounded-lg shadow-lg border border-sage/20
                        animate-fadeIn z-10 pointer-events-none">
                        <div className="text-sm font-semibold text-charcoal mb-1">
                            {trendData[hoveredPoint].value} {trendData[hoveredPoint].unit}
                        </div>
                        <div className="text-xs text-charcoal/70 mb-1">
                            {new Date(trendData[hoveredPoint].testDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                        <div className={`text-xs font-medium ${trendData[hoveredPoint].isAbnormal ? 'text-red-600' : 'text-green-600'
                            }`}>
                            {getStatusLabel(trendData[hoveredPoint])}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            {/* Marker Selector */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label htmlFor="marker-select" className="text-sm font-medium text-charcoal">
                    View trend for:
                </label>
                <select
                    id="marker-select"
                    value={selectedMarker}
                    onChange={(e) => setSelectedMarker(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2.5 sm:py-2 rounded-lg bg-white/40 border border-sage/30 
                        focus:border-sage focus:ring-2 focus:ring-sage/30 
                        transition-all duration-300 text-sm text-charcoal"
                >
                    {availableMarkers.map((marker) => (
                        <option key={marker} value={marker}>
                            {marker}
                        </option>
                    ))}
                </select>
            </div>

            {/* Graph */}
            {renderGraph()}
        </div>
    );
};

MarkerTrendGraph.propTypes = {
    memberId: PropTypes.string.isRequired,
    defaultMarker: PropTypes.string.isRequired,
    availableMarkers: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default MarkerTrendGraph;