import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import api from '../api/axiosInstance';

function useDebounce(callback, delay) {
  const [timeoutId, setTimeoutId] = useState(null);
  const debouncedCallback = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      callback(...args);
    }, delay);
    setTimeoutId(id);
  }, [callback, delay, timeoutId]);
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  return debouncedCallback;
}

function PostOfficeSelect({ deliveryAddress, setDeliveryAddress, setError, setSelectedOffice }) {
  const [officeSearchText, setOfficeSearchText] = useState('');
  const [officeOptions, setOfficeOptions] = useState([]);
  const [officeLoading, setOfficeLoading] = useState(false);
  const officeCache = new Map();

  // Fetch post offices based on search text
  const fetchOffices = async (searchText) => {
    if (searchText.length < 3) {
      setOfficeOptions([]);
      setOfficeLoading(false);
      return;
    }
    if (officeCache.has(searchText)) {
      setOfficeOptions(officeCache.get(searchText));
      setOfficeLoading(false);
      return;
    }
    setOfficeLoading(true);
    try {
      const response = await api.get('/dostavka/officesOut', {});
      const offices = response.data.Table || [];
      const options = offices.map(office => ({
        value: `${office.Address5NamePrefix || ''} ${office.Address5Name || ''}, ${office.Address4NamePrefix || ''} ${office.Address4Name || ''}, ${office.Address3Name || ''}`.trim(),
        label: `${office.Address5NamePrefix || ''} ${office.Address5Name || ''}, ${office.Address4NamePrefix || ''} ${office.Address4Name || ''}, ${office.Address3Name || ''}`.trim(),
        warehouseId: office.WarehouseId // Ensure warehouseId is included
      }));
      setOfficeOptions(options);
      officeCache.set(searchText, options);
    } catch (error) {
      console.error('Error fetching offices:', error.response?.data || error.message);
      if (typeof setError === 'function') {
        setError('Ошибка при поиске отделений: ' + (error.response?.data?.error || error.message));
      } else {
        console.warn('setError is not a function, error not set in UI');
      }
    }
    setOfficeLoading(false);
  };

  const debouncedFetchOffices = useDebounce(fetchOffices, 500);

  const handleOfficeSearchChange = (inputValue) => {
    if (/^[a-zA-Zа-яА-Я0-9\s,-]*$/.test(inputValue)) {
      setOfficeSearchText(inputValue);
      debouncedFetchOffices(inputValue);
    }
  };

  const handleOfficeSelect = (selectedOption) => {
    setDeliveryAddress(selectedOption ? selectedOption.label : '');
    setSelectedOffice(selectedOption ? { warehouseId: selectedOption.warehouseId, address: selectedOption.label } : null);
    setOfficeSearchText(selectedOption ? selectedOption.label : '');
  };

  const handleClear = () => {
    setOfficeSearchText('');
    setDeliveryAddress('');
    setSelectedOffice(null);
    setOfficeOptions([]);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[#9ca3af] mb-2" htmlFor="deliveryAddress">
        Отделение европочты *
      </label>
      <Select
        id="deliveryAddress"
        isLoading={officeLoading}
        options={officeOptions}
        onInputChange={handleOfficeSearchChange}
        onChange={handleOfficeSelect}
        value={deliveryAddress ? { value: deliveryAddress, label: deliveryAddress } : null}
        inputValue={officeSearchText}
        placeholder="Введите город, улицу или индекс..."
        noOptionsMessage={() => officeLoading ? 'Поиск...' : 'Введите минимум 3 символа'}
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: 'rgba(107,114,128,0.15)',
            borderColor: state.isFocused ? '#00f0ff' : 'rgba(255,255,255,0.1)',
            borderWidth: '1px',
            borderRadius: '0.75rem',
            color: '#e5e7eb',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 240, 255, 0.1)' : 'none',
            minHeight: '48px',
            width: '100%',
            cursor: 'text',
            '&:hover': { 
              borderColor: state.isFocused ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)',
            },
            transition: 'all 0.3s ease',
          }),
          input: (base) => ({
            ...base,
            color: '#e5e7eb',
            width: '100%',
          }),
          placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
          }),
          singleValue: (base) => ({
            ...base,
            color: '#e5e7eb',
          }),
          indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }),
          dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? '#00f0ff' : '#9ca3af',
            '&:hover': {
              color: '#00f0ff',
            },
            transition: 'color 0.3s ease',
          }),
          loadingIndicator: (base) => ({
            ...base,
            color: '#00f0ff',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'rgba(31,41,55,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.75rem',
            marginTop: '4px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            overflow: 'hidden',
          }),
          menuList: (base) => ({
            ...base,
            padding: '4px',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
              ? 'rgba(0, 240, 255, 0.15)' 
              : state.isFocused 
                ? 'rgba(0, 240, 255, 0.1)' 
                : 'transparent',
            color: state.isSelected ? '#00f0ff' : '#e5e7eb',
            borderRadius: '0.5rem',
            padding: '10px 12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:active': {
              backgroundColor: 'rgba(0, 240, 255, 0.2)',
            },
          }),
          noOptionsMessage: (base) => ({
            ...base,
            color: '#9ca3af',
            padding: '12px',
          }),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#00f0ff',
            primary25: 'rgba(0, 240, 255, 0.15)',
            primary50: 'rgba(0, 240, 255, 0.3)',
            primary75: 'rgba(0, 240, 255, 0.5)',
          },
        })}
      />
      {deliveryAddress && (
        <button
          className="mt-2 text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-colors duration-300 underline"
          onClick={handleClear}
        >
          Очистить
        </button>
      )}
    </div>
  );
}

export default PostOfficeSelect;