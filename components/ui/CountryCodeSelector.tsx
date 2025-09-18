'use client';

import { useState } from 'react'; // <-- Corrected: 'useState' is only imported once.
import { ChevronDown } from 'lucide-react';

const countries = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CountryCodeSelector({ value, onChange }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry = countries.find(c => c.code === value) || countries[0];

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center justify-between w-full h-10 pl-3 pr-2 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCountry.flag} {selectedCountry.code}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-auto">
          {countries.map((country) => (
            <li
              key={country.name}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
            >
              <span>{country.flag}</span>
              <span className="ml-3">{country.name} ({country.code})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
                         }
