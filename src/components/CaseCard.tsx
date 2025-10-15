
import React from 'react';
import { Case } from '../types';

interface CaseCardProps {
  caseData: Case;
  onSelect: (caseData: Case) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(caseData)}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 border border-transparent hover:border-[#f4c28e]"
    >
      <div className="relative aspect-video">
        <img
          src={caseData.outputImage}
          alt={caseData.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-3 right-3 bg-[#f4d6f6]/80 backdrop-blur-sm text-[#583f59] text-xs font-bold px-2.5 py-1 rounded-full">{caseData.category}</div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-white text-lg font-bold leading-tight">{caseData.title}</h3>
        </div>
      </div>
      <div className="p-4 bg-white">
        <p className="text-sm text-gray-500">by {caseData.author}</p>
        <div className="flex items-center mt-3 text-sm font-medium text-[#f4b26a]">
          <span>Try this case</span>
          <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
