import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { Modal, Form } from 'antd';

import './App.css';
import Header from './components/Header';
import Buttons from './components/Buttons';

import Compra from './components/formularios/Compra';
import Venta from './components/formularios/Venta';
import Peso from './components/formularios/Peso';
import TheTable from './components/TheTable';
import StockDetails from './components/StockDetails';
import Filter from './components/formularios/Filter';

import FilterContext from './context/Filter.context';

function App() {
  const { filterData, filterSearch } = useContext(FilterContext);

  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState('');
  const [originalStock, setOriginalStock] = useState('');
  const [stocks, setStocks] = useState([]);
  const [stockId, setStockId] = useState('');
  const [lastSelected, setLastSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearTableSelection, setClearTableSelection] = useState(false);

  // const [compraForm] = Form.useForm();

  const fetchStock = async () => {
    try {
      setLoading(true);

      const response = await axios.get(process.env.REACT_APP_API + 'stock/');
      if (response.data.ok) {
        console.log({ theStocks: response.data.stocks });
        setStocks(response.data.stocks);
        setOriginalStock(response.data.stocks);
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      setLoading(false);
      console.log('ERROR -> ', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    const filterStock = () => {
      const filter = filterData;
      let filteredStock = [...originalStock];

      if (filter.loteNro) {
        console.log('FILTRANDO POR LOTE');
        filteredStock = [
          ...filteredStock.filter((stock) => stock.loteNro === filter.loteNro),
        ];
      }

      if (filter.tipoStock) {
        filteredStock = [
          ...filteredStock.filter(
            (stock) => stock.stockTipo === filter.tipoStock
          ),
        ];
      }

      if (filter.vendido) {
        if (filter.vendido === 'sinvender') {
          filteredStock = [
            ...filteredStock.filter((stock) =>
              stock.venta.fecha && Object.keys(stock.venta).length > 0
                ? false
                : true
            ),
          ];
        } else if (filter.vendido === 'sinreponer') {
          filteredStock = [
            ...filteredStock.filter((stock) => {
              if (stock.venta?.tipo === 'perdida') return false;
              if (!stock.venta.fecha || Object.keys(stock.venta).length === 0)
                return false;

              return !!!(
                stock.venta.reposicion && stock.venta.tipo !== 'perdida'
              );
            }),
          ];
        } else if (filter.vendido === 'vendido') {
          filteredStock = [
            ...filteredStock.filter((stock) => {
              return (
                stock.venta &&
                Object.keys(stock.venta).length > 0 &&
                stock.venta.reposicion
              );
            }),
          ];
        } else if (filter.vendido === 'perdida') {
          filteredStock = [
            ...filteredStock.filter((stock) => {
              return stock.venta?.fecha && stock.venta.tipo === 'perdida';
            }),
          ];
        }
      }
      if (filter.fechaCompra1 && filter.fechaCompra1 !== '') {
        filteredStock = [
          ...filteredStock.filter((stock) => {
            const fechaCompra = new Date(
              stock.compra.fecha
            ).toLocaleDateString();
            const fechaFilter1 = new Date(
              filter.fechaCompra1
            ).toLocaleDateString();
            const fechaFilter2 =
              filter.fechaCompra2 && filter.fechaCompra2 !== ''
                ? new Date(filter.fechaCompra2).toLocaleDateString()
                : new Date(fechaFilter1).toLocaleDateString();

            return fechaCompra >= fechaFilter1 && fechaCompra <= fechaFilter2;
          }),
        ];
      }

      if (
        filter.fechaVenta1 &&
        filter.fechaVenta1 !== '' &&
        filter.vendido !== 'sinvender'
      ) {
        filteredStock = [
          ...filteredStock.filter((stock) => {
            // console.log('stockActual', stock);
            if (!stock.venta || Object.keys(stock.venta).length === 0)
              return false;

            const fechaVenta = new Date(stock.venta.fecha).toLocaleDateString();
            const fechaFilter1 = new Date(
              filter.fechaVenta1
            ).toLocaleDateString();
            const fechaFilter2 =
              filter.fechaVenta2 && filter.fechaVenta2 !== ''
                ? new Date(filter.fechaVenta2).toLocaleDateString()
                : new Date(fechaFilter1).toLocaleDateString();

            return fechaVenta >= fechaFilter1 && fechaVenta <= fechaFilter2;
          }),
        ];
      }

      if (filter.peso1 || filter.peso2) {
        filteredStock = [
          ...filteredStock.filter((stock) => {
            if (stock.pesos && stock.pesos.length > 0) {
              return (
                stock.pesos[0].peso >= filter.peso1 &&
                stock.pesos[0].peso <= filter.peso2
              );
            }

            return false;
          }),
        ];
      }

      if (filterSearch) {
        filteredStock = [
          ...filteredStock.filter((stock) => {
            return stock.stockNro.toString().startsWith(filterSearch);
          }),
        ];
      }

      setStocks(filteredStock);
    };
    filterStock();
  }, [filterData, filterSearch, originalStock]);

  const deleteStock = async (stockArr) => {
    try {
      const response = await axios.delete(
        process.env.REACT_APP_API + 'stock/',
        {
          data: stockArr,
        }
      );
      if (response.data.ok) fetchStock();
      setClearTableSelection(!clearTableSelection);
    } catch (err) {
      console.log('ERROR -> ', err);
    }
  };

  const handleOnClose = (fetch = false) => {
    setShowModal(false);
    if (fetch) fetchStock();
  };

  const handleShowModal = (form) => {
    switch (form) {
      case 'compra':
        setActiveForm('compra');
        break;
      case 'venta':
        setActiveForm('venta');
        break;
      case 'peso':
        setActiveForm('peso');
        break;
      case 'filter':
        setActiveForm('filter');
        break;
      default:
        setActiveForm('');
    }
    setShowModal(true);
    setClearTableSelection(!clearTableSelection);
  };

  const handleShowDetails = (id) => {
    setStockId(id);
    setActiveForm('details');
    setShowModal(true);
    setClearTableSelection(!clearTableSelection);
  };

  return (
    <div className="App">
      <Header />
      <Modal
        open={showModal}
        centered
        onCancel={() => setShowModal(false)}
        footer={[]}
        width={activeForm === 'details' && 750}
        destroyOnClose={true}
      >
        {activeForm === 'compra' && <Compra onClose={handleOnClose} />}
        {activeForm === 'venta' && (
          <Venta onClose={handleOnClose} selectedStock={lastSelected} />
        )}
        {activeForm === 'peso' && (
          <Peso
            onClose={handleOnClose}
            selectedStock={lastSelected}
            stockId={lastSelected?._id}
          />
        )}
        {activeForm === 'details' && (
          <StockDetails onClose={handleOnClose} stockId={stockId} />
        )}
        {activeForm === 'filter' && <Filter onClose={handleOnClose} />}
      </Modal>
      <Buttons onShowModal={handleShowModal} isValid={!!lastSelected} />
      <TheTable
        stocks={stocks}
        onDelete={deleteStock}
        onClick={handleShowDetails}
        openFilter={handleShowModal}
        loading={loading}
        clearSelected={clearTableSelection}
        onLastSelected={useCallback((stock) => {
          console.log('hola', stock);
          setLastSelected(
            stock[stock?.length - 1]?.venta?.fecha
              ? null
              : stock[stock.length - 1]
          );
        }, [])}
      />
    </div>
  );
}

export default App;
