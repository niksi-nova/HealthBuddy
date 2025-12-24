const Input = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    label,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-charcoal mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`
          w-full px-4 py-3 rounded-input glass-input
          text-charcoal placeholder-charcoal/50
          ${error ? 'border-red-500' : ''}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
