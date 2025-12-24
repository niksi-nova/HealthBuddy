const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - Brighter with gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-sand/80 via-sage/20 to-terracotta/20 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content - Brighter glass effect */}
            <div className="relative bg-white/40 backdrop-blur-glass border border-white/50 shadow-glow rounded-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-sage">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-charcoal/50 hover:text-charcoal transition-colors text-2xl leading-none"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
