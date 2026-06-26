'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GetCountries, GetState, GetCity } from 'react-country-state-city';
import { cn } from '@/lib/utils';

const COUNTRY_ISO = 'IN';

const selectClassName =
  'h-11 w-full min-w-0 cursor-pointer appearance-none rounded-2xl border bg-white pl-3.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400';

/**
 * State + city dropdowns.
 *
 * Country is fixed to India. `react-country-state-city` is used purely as a
 * data source (India -> states -> cities) while the UI uses native <select>
 * elements so the styling matches the rest of the address form. The parent
 * form keeps storing `state`/`city` as plain name strings.
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

  const handleStateChange = (event) => {
    onStateChange(event.target.value);
    onCityChange('');
  };

  const handleCityChange = (event) => {
    onCityChange(event.target.value);
  };

  const statesReady = states.length > 0;
  const citiesReady = Boolean(selectedStateId);

  const stateOptions = withSelectedFallback(states, state);
  const cityOptions = withSelectedFallback(cities, city);

  return (
    <>
      <RegionField id="address-state" label="State" error={stateError} required>
        <SelectControl
          id="address-state"
          value={state ?? ''}
          onChange={handleStateChange}
          disabled={!statesReady}
          error={stateError}
          placeholder={statesReady ? 'Select state' : 'Loading states…'}
        >
          {stateOptions.map((item) => (
            <option key={item.id ?? item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </SelectControl>
      </RegionField>
      <RegionField id="address-city" label="City" error={cityError} required>
        <SelectControl
          id="address-city"
          value={city ?? ''}
          onChange={handleCityChange}
          disabled={!citiesReady}
          error={cityError}
          placeholder={citiesReady ? 'Select city' : 'Select a state first'}
        >
          {cityOptions.map((item) => (
            <option key={item.id ?? item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </SelectControl>
      </RegionField>
    </>
  );
}

function SelectControl({ id, value, onChange, disabled, error, placeholder, children }) {
  return (
    <div className="relative min-w-0">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(selectClassName, error ? 'border-red-300 focus:border-red-500' : 'border-gray-200')}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2',
          disabled ? 'text-gray-300' : 'text-gray-400',
        )}
        aria-hidden
      />
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
