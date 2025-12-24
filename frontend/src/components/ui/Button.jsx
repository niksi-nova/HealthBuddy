const Button = ({
    children,
    variant = 'primary',
    onClick,
    disabled = false,
    className = '',
    type = 'button'
}) => {
    const variants = {
        primary: 'bg-gold hover:bg-gold-dark text-white shadow-glow hover:shadow-glow-sage',
        secondary: 'bg-terracotta hover:bg-terracotta-dark text-white',
        ghost: 'bg-transparent border-2 border-sage text-sage hover:bg-sage hover:text-white',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        px-6 py-3 rounded-button font-medium
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
        >
            {children}
        </button>
    );
};

export default Button;
