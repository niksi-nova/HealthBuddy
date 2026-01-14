import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FamilyTreeVisualization = ({ admin, members }) => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Seeded random function for consistent positioning
    const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    // Calculate positions for hierarchical age-based tree layout
    const getTreeLayout = () => {
        if (!admin) return [];

        // Tree dimensions
        const treeWidth = 1000;
        const treeHeight = 700;

        // Combine all members including admin
        const allMembers = [admin, ...members];

        // Sort by age (eldest first)
        const sortedMembers = [...allMembers].sort((a, b) => b.age - a.age);

        // Group members into age tiers (within 15 years = same tier)
        const ageTierSize = 15;
        const tiers = [];
        let currentTier = [];
        let currentTierAge = sortedMembers[0]?.age;

        sortedMembers.forEach(member => {
            if (currentTierAge - member.age <= ageTierSize) {
                currentTier.push(member);
            } else {
                tiers.push(currentTier);
                currentTier = [member];
                currentTierAge = member.age;
            }
        });
        if (currentTier.length > 0) {
            tiers.push(currentTier);
        }

        // Calculate positions
        const positions = [];
        const padding = 100;
        const availableWidth = treeWidth - (2 * padding);
        const verticalPadding = 120; // Increased to prevent clipping
        const availableHeight = treeHeight - (2 * verticalPadding);

        // Distribute tiers evenly across vertical space
        const tierSpacing = tiers.length > 1 ? availableHeight / (tiers.length - 1) : 0;

        tiers.forEach((tier, tierIndex) => {
            // Calculate Y position for this tier (eldest at top)
            const y = verticalPadding + (tierIndex * tierSpacing);

            // Distribute members horizontally within the tier
            const memberCount = tier.length;

            tier.forEach((member, memberIndex) => {
                let x;

                if (memberCount === 1) {
                    // Center single member
                    x = treeWidth / 2;
                } else {
                    // Distribute multiple members evenly
                    const horizontalSpacing = availableWidth / (memberCount + 1);
                    x = padding + (horizontalSpacing * (memberIndex + 1));
                }

                positions.push({
                    member,
                    x,
                    y,
                    isRoot: member._id === admin._id,
                    tier: tierIndex
                });
            });
        });

        return positions;
    };

    const positions = getTreeLayout();

    // Generate organic branch paths between tiers
    const generateBranch = (start, end) => {
        const midY = (start.y + end.y) / 2;
        // Create smooth curve between tiers
        return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    };

    // Mobile List View
    if (isMobile) {
        const allMembers = [admin, ...members];

        return (
            <div className="space-y-3 px-2">
                {allMembers.map((member) => (
                    <div
                        key={member._id}
                        onClick={() => navigate(`/member/${member._id}/health`)}
                        className="cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            border: member._id === admin._id ? '2px solid rgba(232, 180, 79, 0.5)' : '2px solid rgba(139, 157, 131, 0.3)',
                            boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
                            padding: '16px'
                        }}
                    >
                        <div className="flex items-center space-x-4">
                            {/* Profile Picture */}
                            {member.profilePicture ? (
                                <img
                                    src={`http://localhost:3002${member.profilePicture}`}
                                    alt={member.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-sage shadow-md flex-shrink-0"
                                />
                            ) : (
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
                                    style={{ backgroundColor: member.avatarColor || '#8B9D83' }}
                                >
                                    {member.name?.charAt(0)}
                                </div>
                            )}

                            {/* Member Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-charcoal text-base truncate">
                                    {member.name}
                                </h3>
                                <p className="text-sm text-charcoal/70">
                                    {member._id === admin._id ? 'Admin (You)' : member.relation}
                                </p>
                                <p className="text-xs text-charcoal/50">{member.age} years</p>
                            </div>

                            {/* Arrow */}
                            <svg
                                className="w-5 h-5 text-charcoal/40 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Desktop Tree View
    return (
        <div className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px', maxHeight: '700px' }}>
            {/* Responsive container */}
            <div
                className="relative mx-auto h-full"
                style={{
                    minWidth: '100%',
                    width: '1000px',
                    maxWidth: '100%'
                }}
            >
                {/* SVG for tree branches */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 1000 700"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        {/* Gradient for branches */}
                        <linearGradient id="branchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8B9D83" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#6B7D63" stopOpacity="0.8" />
                        </linearGradient>

                        {/* Filter for organic texture */}
                        <filter id="roughen">
                            <feTurbulence baseFrequency="0.05" numOctaves="2" result="turbulence" />
                            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" />
                        </filter>
                    </defs>

                    {/* Draw branches connecting tiers */}
                    {positions.map((pos, index) => {
                        // Connect to members in the next tier
                        const nextTierMembers = positions.filter(p => p.tier === pos.tier + 1);
                        return nextTierMembers.map((nextPos, nextIndex) => (
                            <path
                                key={`${index}-${nextIndex}`}
                                d={generateBranch(pos, nextPos)}
                                stroke="url(#branchGradient)"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                filter="url(#roughen)"
                                opacity="0.5"
                            />
                        ));
                    })}

                    {/* Decorative leaves */}
                    {positions.map((pos, index) => (
                        <g key={`leaf-${index}`}>
                            {/* Small decorative leaves around cards */}
                            <ellipse
                                cx={pos.x - 60}
                                cy={pos.y - 10}
                                rx="8"
                                ry="12"
                                fill="#8B9D83"
                                opacity="0.3"
                                transform={`rotate(${Math.random() * 360} ${pos.x - 60} ${pos.y - 10})`}
                            />
                            <ellipse
                                cx={pos.x + 60}
                                cy={pos.y - 10}
                                rx="8"
                                ry="12"
                                fill="#D4A59A"
                                opacity="0.3"
                                transform={`rotate(${Math.random() * 360} ${pos.x + 60} ${pos.y - 10})`}
                            />
                        </g>
                    ))}
                </svg>

                {/* Member cards positioned as leaves */}
                {positions.map((pos, index) => (
                    <div
                        key={pos.member._id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                        style={{
                            left: `${(pos.x / 1000) * 100}%`,
                            top: `${(pos.y / 700) * 100}%`,
                            animation: `float ${5 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${index * 0.2}s`
                        }}
                    >
                        {/* Leaf-shaped card */}
                        <div
                            className={`cursor-pointer transition-all hover:scale-105 ${pos.isRoot ? 'ring-4 ring-gold ring-opacity-60' : ''
                                } leaf-card`}
                            onClick={() => navigate(`/member/${pos.member._id}/health`)}
                            style={{
                                width: '160px',
                                height: '200px',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', // Leaf shape
                                border: '2px solid rgba(139, 157, 131, 0.3)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px 16px',
                                position: 'relative'
                            }}
                        >
                            {/* Add responsive styles */}
                            <style jsx>{`
                            @media (max-width: 768px) {
                                .leaf-card {
                                    transform: scale(0.85);
                                }
                            }
                        `}</style>
                            {/* Profile picture or avatar */}
                            <div className="mb-2">
                                {pos.member.profilePicture ? (
                                    <img
                                        src={`http://localhost:3002${pos.member.profilePicture}`}
                                        alt={pos.member.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-sage shadow-md"
                                    />
                                ) : (
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
                                        style={{ backgroundColor: pos.member.avatarColor || '#8B9D83' }}
                                    >
                                        {pos.member.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Member info */}
                            <div className="text-center">
                                <h3 className="font-semibold text-charcoal text-sm leading-tight mb-1">
                                    {pos.member.name}
                                </h3>
                                <p className="text-xs text-charcoal/70 mb-0.5">
                                    {pos.isRoot ? 'Admin (You)' : pos.member.relation}
                                </p>
                                <p className="text-xs text-charcoal/50">{pos.member.age} years</p>
                            </div>

                            {/* Leaf vein decoration */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '1px',
                                    height: '60%',
                                    background: 'linear-gradient(to bottom, transparent, rgba(139, 157, 131, 0.2), transparent)',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>
                ))}

                {/* Floating animation keyframes */}
                <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translate(-50%, -50%) translateY(0px);
                    }
                    50% {
                        transform: translate(-50%, -50%) translateY(-3px);
                    }
                }
            `}</style>
            </div>
        </div>
    );
};

export default FamilyTreeVisualization;
