import React, { useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
  digits: number;
}

export const GCC_COUNTRIES: CountryInfo[] = [
  { code: '+965', name: 'الكويت', flag: '🇰🇼', placeholder: '9876 5432', digits: 8 },
  { code: '+966', name: 'السعودية', flag: '🇸🇦', placeholder: '50 123 4567', digits: 9 },
  { code: '+971', name: 'الإمارات', flag: '🇦🇪', placeholder: '50 123 4567', digits: 9 },
  { code: '+974', name: 'قطر', flag: '🇶🇦', placeholder: '3312 3456', digits: 8 },
  { code: '+973', name: 'البحرين', flag: '🇧🇭', placeholder: '3612 3456', digits: 8 },
  { code: '+968', name: 'عُمان', flag: '🇴🇲', placeholder: '9123 4567', digits: 8 },
];

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  selectedCountry: CountryInfo;
  onCountryChange: (country: CountryInfo) => void;
  disabled?: boolean;
}

export function PhoneInputWithCountry({
  value,
  onChange,
  selectedCountry,
  onCountryChange,
  disabled = false,
}: PhoneInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center rounded-2xl border border-border/70 bg-card/80 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all overflow-hidden h-14">
        {/* Country Picker Button */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-14 px-3.5 flex items-center gap-2 bg-muted/30 hover:bg-muted/60 border-l border-border/50 text-foreground transition-colors font-medium text-sm select-none"
          >
            <span className="text-xl leading-none">{selectedCountry.flag}</span>
            <span className="font-mono font-bold text-xs" dir="ltr">{selectedCountry.code}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-card border border-border/60 rounded-2xl shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase border-b border-border/40 mb-1">
                  اختر رمز الدولة
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {GCC_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(c);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                        selectedCountry.code === c.code
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{c.flag}</span>
                        <span>{c.name}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                        {c.code}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 relative flex items-center">
          <Input
            type="tel"
            disabled={disabled}
            value={value}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d\s]/g, '');
              onChange(val);
            }}
            placeholder={selectedCountry.placeholder}
            className="h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 text-left font-mono text-base tracking-wider text-foreground placeholder:text-muted-foreground/50"
            dir="ltr"
          />
          <Phone className="absolute right-4 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
