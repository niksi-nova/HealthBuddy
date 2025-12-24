const GlassCard = ({ children, className = '', onClick }) => {
    return (
        <div
            className={`glass-card rounded-card p-6 ${className} ${onClick ? 'cursor-pointer hover:shadow-glow transition-all duration-300' : ''
                }`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default GlassCard;
