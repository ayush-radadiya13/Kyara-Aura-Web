'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import { cn } from '@/lib/utils';

const COUNTRY_ISO = 'IN';

const inputClassName =
  'h-11 w-full min-w-0 rounded-2xl border bg-white pl-3.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-400';

/**
 * State + city searchable dropdowns.
 *
 * Country is fixed to India. `react-country-state-city` is used purely as a
 * data source (India -> states -> cities) while the UI uses a custom
 * searchable combobox so the styling matches the rest of the address form. The
 * parent form keeps storing `state`/`city` as plain name strings.
 */
export default function AddressRegionFields({
  state,
  city,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
}) {
  const [countryId, setCountryId] = useState(0);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    let active = true;

    GetCountries().then((countries) => {
      if (!active || !Array.isArray(countries)) return;
      const india = countries.find((item) => item.iso2 === COUNTRY_ISO);
      setCountryId(india ? india.id : 0);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!countryId) {
      setStates([]);
      return undefined;
    }

    let active = true;

    GetState(countryId).then((result) => {
      if (!active || !Array.isArray(result)) return;
      setStates(result);
    });

    return () => {
      active = false;
    };
  }, [countryId]);

  const selectedStateId = useMemo(() => {
    const target = String(state ?? '').trim().toLowerCase();
    if (!target) return 0;
    const match = states.find((item) => item.name?.toLowerCase() === target);
    return match ? match.id : 0;
  }, [state, states]);

  useEffect(() => {
    if (!countryId || !selectedStateId) {
      setCities([]);
      return undefined;
    }

    let active = true;

    GetCity(countryId, selectedStateId).then((result) => {
      if (!active || !Array.isArray(result)) return;
      setCities(result);
    });

    return () => {
      active = false;
    };
  }, [countryId, selectedStateId]);

  const handleStateChange = (value) => {
    onStateChange(value);
    onCityChange('');
  };

  const statesReady = states.length > 0;
  const citiesReady = Boolean(selectedStateId);

  const stateOptions = withSelectedFallback(states, state);
  const cityOptions = withSelectedFallback(cities, city);

  return (
    <>
      <RegionField id="address-state" label="State" error={stateError} required>
        <SearchableSelect
          id="address-state"
          value={state ?? ''}
          onChange={handleStateChange}
          options={stateOptions}
          disabled={!statesReady}
          error={stateError}
          placeholder={statesReady ? 'Search state' : 'Loading states…'}
        />
      </RegionField>
      <RegionField id="address-city" label="City" error={cityError} required>
        <SearchableSelect
          id="address-city"
          value={city ?? ''}
          onChange={onCityChange}
          options={cityOptions}
          disabled={!citiesReady}
          error={cityError}
          placeholder={citiesReady ? 'Search city' : 'Select a state first'}
        />
      </RegionField>
    </>
  );
}

/**
 * A combobox that opens a dropdown below the field. Clicking the field opens
 * the list; typing filters the options by name (case-insensitive).
 */
function SearchableSelect({ id, value, onChange, options, disabled, error, placeholder }) {
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((item) => item.name?.toLowerCase().includes(trimmed));
  }, [options, query]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open || disabled) return;
    // Closing while disabled resets the search text.
    setQuery('');
  }, [open, disabled]);

  const openDropdown = () => {
    if (disabled) return;
    setQuery('');
    setActiveIndex(-1);
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
  };

  const selectOption = (name) => {
    onChange(name);
    closeDropdown();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openDropdown();
        return;
      }
      setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return;
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter') {
      if (open && activeIndex >= 0 && filteredOptions[activeIndex]) {
        event.preventDefault();
        selectOption(filteredOptions[activeIndex].name);
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        closeDropdown();
      }
    }
  };

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const node = listRef.current.children[activeIndex];
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // When closed, the input shows the selected value; when open it shows the
  // live search query so the user can type to filter.
  const inputValue = open ? query : value;

  return (
    <div ref={containerRef} className="relative min-w-0">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        autoComplete="new-password"
        data-1p-ignore
        data-lpignore="true"
        data-form-type="other"
        value={inputValue}
        disabled={disabled}
        placeholder={value && !open ? value : placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
          if (!open) setOpen(true);
        }}
        onFocus={openDropdown}
        onClick={openDropdown}
        onKeyDown={handleKeyDown}
        className={cn(
          inputClassName,
          error ? 'border-red-300 focus:border-red-500' : 'border-gray-200',
          !disabled && 'cursor-pointer',
        )}
      />
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform',
          disabled ? 'text-gray-300' : 'text-gray-400',
          open && 'rotate-180',
        )}
        aria-hidden
      />
      {open && !disabled ? (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-gray-400">No matches found</li>
          ) : (
            filteredOptions.map((item, index) => {
              const isSelected = item.name?.toLowerCase() === String(value ?? '').toLowerCase();
              const isActive = index === activeIndex;
              return (
                <li
                  key={item.id ?? item.name}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(item.name);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'cursor-pointer px-3.5 py-2.5 text-sm text-gray-900',
                    isActive && 'bg-gray-100',
                    isSelected && 'font-semibold',
                  )}
                >
                  {item.name}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Keep a previously saved value selectable even if it isn't present in the
 * fetched list (protects against data mismatches when editing an address).
 * @param {Array<{ id?: number, name: string }>} options
 * @param {string} value
 */
function withSelectedFallback(options, value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return options;
  const exists = options.some((item) => item.name?.toLowerCase() === trimmed.toLowerCase());
  return exists ? options : [{ name: trimmed }, ...options];
}

function RegionField({ id, label, error, required, children }) {
  return (
    <div className="min-w-0 space-y-1">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
