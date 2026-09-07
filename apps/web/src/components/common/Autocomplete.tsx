import React, { useState, useRef, useEffect } from "react";

interface AutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export default function Autocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Sync internal input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If they didn't select an option but clicked away, reset input to last saved value
        setInputValue(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[11px] font-medium text-gray-600 dark:text-[#C8C0B4] mb-1">
        {label}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          // Only trigger onChange if the exact value matches an option, 
          // or we can just let onChange fire on blur/select.
          // For now, let's just trigger onChange on select to ensure strict validation.
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-11 px-3.5 rounded-xl border ${
          error ? "border-red-500" : "border-gray-200 dark:border-[#2C3834]"
        } bg-transparent dark:bg-[#26332F] text-xs text-gray-900 dark:text-[#F7F2E8] outline-none focus:border-[#FF5A00] ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
      
      {isOpen && filteredOptions.length > 0 && !disabled && (
        <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white dark:bg-[#26332F] border border-gray-200 dark:border-[#2C3834] rounded-xl shadow-lg">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="px-3.5 py-2.5 text-xs text-gray-800 dark:text-[#C8C0B4] hover:bg-gray-50 dark:hover:bg-[#3D3931] cursor-pointer"
              onClick={() => {
                setInputValue(option);
                onChange(option); // Notify parent only when explicitly selected
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
