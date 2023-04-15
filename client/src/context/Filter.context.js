import React, { createContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filterData, setFilterData] = useState({
    vendido: '',
    fechaCompra1: '',
    fechaCompra2: '',
    fechaVenta1: '',
    fechaVenta2: '',
    peso1: 0,
    peso2: 0,
  });
  const [filterActive, setFilterActive] = useState(false);
  const [filterSearch, setFilterSearch] = useState(null);
  const [sortOptions, setSortOptions] = useState(null);

  const isFilterActive = () => {
    if (
      filterData.vendido ||
      filterData.fechaCompra1 ||
      filterData.fechaCompra2 ||
      filterData.fechaVenta1 ||
      filterData.fechaVenta2 ||
      filterData.peso1 ||
      filterData.peso2 ||
      filterSearch ||
      sortOptions
    ) {
      return true;
    }
    return false;
  };

  const clearFilterData = () => {
    setFilterSearch(null);
    setSortOptions(null);
    setFilterData({
      vendido: '',
      fechaCompra1: '',
      fechaCompra2: '',
      fechaVenta1: '',
      fechaVenta2: '',
      peso1: 0,
      peso2: 0,
    });
  };
  return (
    <>
      <FilterContext.Provider
        value={{
          filterData,
          filterSearch,
          sortOptions,
          filterActive,
          setFilterData,
          setFilterActive,
          setFilterSearch,
          setSortOptions,
          isFilterActive,
          clearFilterData,
        }}
      >
        {children}
      </FilterContext.Provider>
    </>
  );
};

export default FilterContext;
