
import React from 'react';
import { Case } from '../types';
import CaseCard from './CaseCard';

interface CaseGalleryProps {
  cases: Case[];
  onSelectCase: (caseData: Case) => void;
}

const CaseGallery: React.FC<CaseGalleryProps> = ({ cases, onSelectCase }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {cases.map(caseItem => (
        <CaseCard key={caseItem.id} caseData={caseItem} onSelect={onSelectCase} />
      ))}
    </div>
  );
};

export default CaseGallery;
