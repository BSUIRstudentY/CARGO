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
          control: (base) => ({
            ...base,
            backgroundColor: 'rgba(255,255,255,0.62)',
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 14,
            color: '#111',
            boxShadow: 'none',
            minHeight: 44,
            width: '100%',
            cursor: 'text',
            '&:hover': { borderColor: 'transparent' },
          }),
          input: (base) => ({
            ...base,
            color: '#111',
            width: '100%',
          }),
          placeholder: (base) => ({
            ...base,
            color: 'rgba(17,17,17,0.42)',
          }),
          singleValue: (base) => ({
            ...base,
            color: '#111',
          }),
          indicatorSeparator: () => ({ display: 'none' }),
          dropdownIndicator: (base) => ({
            ...base,
            color: 'rgba(17,17,17,0.45)',
            '&:hover': { color: '#111' },
          }),
          clearIndicator: (base) => ({
            ...base,
            color: 'rgba(17,17,17,0.45)',
          }),
          loadingIndicator: (base) => ({
            ...base,
            color: '#111',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'rgba(255,255,255,0.96)',
            border: 0,
            borderRadius: 14,
            marginTop: 4,
            boxShadow: '0 10px 30px rgba(17,17,17,0.08)',
            zIndex: 9999,
            overflow: 'hidden',
          }),
          menuList: (base) => ({
            ...base,
            padding: 4,
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused || state.isSelected ? 'rgba(17,17,17,0.06)' : 'transparent',
            color: '#111',
            borderRadius: 10,
            padding: '10px 12px',
            cursor: 'pointer',
          }),
          noOptionsMessage: (base) => ({
            ...base,
            color: 'rgba(17,17,17,0.45)',
            padding: 12,
          }),
        }}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#111',
            primary25: 'rgba(17,17,17,0.06)',
            primary50: 'rgba(17,17,17,0.08)',
            primary75: 'rgba(17,17,17,0.12)',
            neutral0: 'rgba(255,255,255,0.62)',
            neutral20: 'transparent',
            neutral30: 'transparent',
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