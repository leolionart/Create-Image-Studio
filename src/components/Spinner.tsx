
import React from 'react';

const Spinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f4c28e]"></div>
        <p className="text-[#a08d75] font-semibold text-lg animate-pulse">Generating magic...</p>
    </div>
);

export default Spinner;
