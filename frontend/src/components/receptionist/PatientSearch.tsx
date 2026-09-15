import React, { useState } from 'react';
import { Patient } from '../../types';
import { patientApi } from '../../api/patientApi';
import { Search, User, Phone, MapPin, Check } from 'lucide-react';

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const data = await patientApi.search(query.trim());
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Fast Patient Master Index Lookup</h3>
          <p className="text-xs text-slate-500 font-medium">Search by permanent Patient Code (PAT-XXXX), Name, or Phone number</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter PAT-100024, Arthur, or phone number..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-soft disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search Patient'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-3.5 divide-y divide-slate-100 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50">
          {results.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className="p-3 hover:bg-white transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-mono text-[10px] border border-teal-200 font-bold">
                    {p.patientCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {p.phone}
                  </span>
                  {p.gender && <span>• {p.gender}</span>}
                </p>
              </div>
              <button className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-xs font-bold border border-teal-200 hover:border-teal-600 transition-all">
                Select
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
