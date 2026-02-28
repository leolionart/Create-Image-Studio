
import React from 'react';

const Spinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-surface-container-highest"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin"></div>
        </div>
        <p className="text-sm text-on-surface-variant font-medium animate-pulse">Generating...</p>
    </div>
);

export default Spinner;
