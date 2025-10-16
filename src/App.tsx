
import React, { useState, useMemo } from 'react';
import { Case } from './types';
import { CASES } from './constants';
import CaseGallery from './components/CaseGallery';
import CaseViewModal from './components/CaseViewModal';
import { SearchIcon } from './components/icons';

const inspirationImages = [
  '/banner/banner-1.svg',
  '/banner/banner-2.svg',
  '/banner/banner-3.svg',
  '/banner/banner-4.svg',
  '/banner/banner-5.svg',
  '/banner/banner-6.svg'
];

const App: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = useMemo(() => ['All', ...Array.from(new Set(CASES.map(c => c.category)))], []);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredCases = useMemo(() => {
    let cases = CASES;
    if (activeCategory !== 'All') {
      cases = cases.filter(c => c.category === activeCategory);
    }
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        cases = cases.filter(c => 
            c.title.toLowerCase().includes(lowercasedQuery) ||
            c.author.toLowerCase().includes(lowercasedQuery) ||
            c.category.toLowerCase().includes(lowercasedQuery)
        );
    }
    return cases;
  }, [activeCategory, searchQuery]);

  const handleSelectCase = (caseData: Case) => {
    setSelectedCase(caseData);
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8]">
      <header className="relative shadow-md overflow-hidden">
        <div className="grid grid-cols-3 sm:grid-cols-6 h-64">
            {inspirationImages.map((src, i) => (
                <img key={i} src={src} alt={`Inspiration image ${i+1}`} className="w-full h-full object-cover"/>
            ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight text-shadow">
                    Creative Image Studio 🍌
                </h1>
                <p className="text-white/80 mt-2 max-w-2xl mx-auto text-shadow-sm">
                    Explore 110+ use cases powered by Gemini. Select a category, pick a case, and bring your ideas to life.
                </p>
            </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <div className="px-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Explore Cases</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                                activeCategory === category 
                                ? 'bg-[#f4c28e] text-white shadow' 
                                : 'bg-white text-gray-700 hover:bg-[#f4d1dc]/50'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-auto sm:max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#f4c28e] focus:border-[#f4c28e] transition-colors"
                        aria-label="Search cases"
                    />
                </div>
            </div>
        </div>
        <CaseGallery cases={filteredCases} onSelectCase={handleSelectCase} />
      </main>

      {selectedCase && (
        <CaseViewModal caseData={selectedCase} onClose={handleCloseModal} />
      )}
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Built with React, Tailwind CSS, and the Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
