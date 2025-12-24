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

    // Calculate positions for tree layout
    const getTreeLayout = () => {
        if (!admin) return [];

        // Tree dimensions
        const treeWidth = 1000;
        const treeHeight = 600;

        // Position admin at the root (bottom center)
        const positions = [
            {
                member: admin,
                x: treeWidth / 2,
                y: treeHeight - 80,
                isRoot: true
            }
        ];

        // Position family members on branches with collision detection
        if (members.length > 0) {
            const leafWidth = 160;
            const leafHeight = 200;
            const minDistance = 180; // Minimum distance between leaves

            members.forEach((member, index) => {
                let x, y;
                let attempts = 0;
                let validPosition = false;

                // Use member ID for consistent seeded random
                const seed = parseInt(member._id.substring(member._id.length - 8), 16);

                while (!validPosition && attempts < 50) {
                    // Generate position based on seed + attempts
                    const randomX = seededRandom(seed + attempts * 1000);
                    const randomY = seededRandom(seed + attempts * 2000 + 500);

                    const padding = 100;
                    const availableWidth = treeWidth - (2 * padding);
                    x = padding + (randomX * availableWidth);

                    // Vertical range
                    const minY = 80;
                    const maxY = 400;
                    y = minY + (randomY * (maxY - minY));

                    // Check collision with existing positions
                    validPosition = true;
                    for (const pos of positions) {
                        const distance = Math.sqrt(
                            Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
                        );
                        if (distance < minDistance) {
                            validPosition = false;
                            break;
                        }
                    }

                    attempts++;
                }

                // If no valid position found after attempts, use fallback grid
                if (!validPosition) {
                    const gridCols = 4;
                    const col = index % gridCols;
                    const row = Math.floor(index / gridCols);
                    x = 150 + (col * 200);
                    y = 120 + (row * 150);
                }

                positions.push({
                    member,
                    x,
                    y,
                    isRoot: false
                });
            });
        }

        return positions;
    };

    const positions = getTreeLayout();

    // Generate organic branch paths from root to each member
    const generateBranch = (start, end) => {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const controlX = midX + (Math.random() - 0.5) * 50;
        const controlY = midY - 100;
        return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
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
        <div className="relative w-full overflow-x-auto" style={{ minHeight: '700px' }}>
            {/* Responsive container */}
            <div
                className="relative mx-auto"
                style={{
                    minWidth: '100%',
                    width: '1000px',
                    maxWidth: '100%',
                    height: '700px'
                }}
            >
                {/* SVG for tree branches */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 1000 600"
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

                    {/* Draw branches from root to each member */}
                    {positions.slice(1).map((pos, index) => (
                        <path
                            key={index}
                            d={generateBranch(positions[0], pos)}
                            stroke="url(#branchGradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            filter="url(#roughen)"
                            opacity="0.7"
                        />
                    ))}

                    {/* Trunk */}
                    <path
                        d={`M 500 ${positions[0].y} L 500 600`}
                        stroke="url(#branchGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        filter="url(#roughen)"
                    />

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
                            top: `${(pos.y / 600) * 100}%`,
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
