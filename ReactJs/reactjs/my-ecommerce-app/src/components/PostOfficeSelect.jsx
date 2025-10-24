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
    <div className="w-full max-w-md">
      <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="deliveryAddress">
        Отделение почты *
      </label>
      <Select
        id="deliveryAddress"
        isLoading={officeLoading}
        options={officeOptions}
        onInputChange={handleOfficeSearchChange}
        onChange={handleOfficeSelect}
        value={deliveryAddress ? { value: deliveryAddress, label: deliveryAddress } : null}
        inputValue={officeSearchText}
        className="text-black"
        placeholder="Введите город, улицу или индекс..."
        noOptionsMessage={() => 'Введите минимум 3 символа'}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            color: 'white',
            '&:hover': { borderColor: 'rgba(6, 182, 212, 0.5)' },
            boxShadow: 'none',
            minWidth: '300px', // Ensure minimum width
            width: '100%', // Full width of container
            minHeight: '44px', // Consistent height
          }),
          input: (base) => ({
            ...base,
            color: 'white',
            width: '100%',
          }),
          singleValue: (base) => ({
            ...base,
            color: 'white',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            color: 'white',
            width: '100%',
            zIndex: 20, // Ensure dropdown appears above other elements
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? 'rgba(6, 182, 212, 0.5)' : 'rgba(31, 41, 55, 0.9)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.3)' },
          }),
        }}
      />
      <button
        className="mt-2 text-sm text-gray-300 hover:text-cyan-400"
        onClick={handleClear}
      >
        Очистить
      </button>
    </div>
  );
}

export default PostOfficeSelect;