import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { Modal } from 'antd';

import Header from '../components/Header';
import Buttons from '../components/Buttons';

import Compra from '../components/forms/Compra';
import Venta from '../components/forms/Venta';
import Peso from '../components/forms/Peso';
import TheTable from '../components/TheTable';
import StockDetails from '../components/StockDetails';
import Filter from '../components/forms/Filter';
import UploadFile from '../components/forms/UploadFile';
import Register from '../components/forms/Register';

import FilterContext from '../context/Filter.context';

import styles from './Main.module.css';

function Main({
  langText,
  allowLang,
  allowAuth,
  showLogo,
  limitedAccess,
  userData,
  setUserData,
}) {
  const { filterData, filterSearch } = useContext(FilterContext);

  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState('');
  const [originalStock, setOriginalStock] = useState('');
  const [stocks, setStocks] = useState([]);
  const [stockId, setStockId] = useState('');
  const [lastSelected, setLastSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearTableSelection, setClearTableSelection] = useState(false);
  const [modalWidth, setModalWidth] = useState(500);

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
              stock.venta?.fecha && Object.keys(stock.venta).length > 0
                ? false
                : true
            ),
          ];
        } else if (filter.vendido === 'sinreponer') {
          filteredStock = [
            ...filteredStock.filter((stock) => {
              if (stock.venta?.tipo === 'perdida') return false;
              if (!stock.venta?.fecha || Object.keys(stock.venta).length === 0)
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
                stock.venta?.reposicion
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
      // setClearTableSelection(!clearTableSelection);
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
        setModalWidth(500);
        setActiveForm('compra');
        break;
      case 'venta':
        setModalWidth(450);
        setActiveForm('venta');
        break;
      case 'peso':
        setModalWidth(400);
        setActiveForm('peso');
        break;
      case 'filter':
        setModalWidth(400);
        setActiveForm('filter');
        break;
      case 'upload':
        setModalWidth(500);
        setActiveForm('upload');
        break;
      case 'profile':
        setModalWidth(500);
        setActiveForm('profile');
        break;
      default:
        setModalWidth(500);
        setActiveForm('');
    }
    setShowModal(true);
    // setClearTableSelection(!clearTableSelection);
  };

  const handleShowDetails = (id) => {
    setStockId(id);
    setModalWidth(750);
    setActiveForm('details');
    setShowModal(true);
    // setClearTableSelection(!clearTableSelection);
  };

  const onEditProfile = () => {
    handleOnClose(false);
  };

  return (
    <div className={styles.main}>
      <Header
        allowLang={allowLang}
        allowAuth={allowAuth}
        showLogo={showLogo}
        onEditProfile={handleShowModal}
      />
      <Modal
        open={showModal}
        centered
        onCancel={() => setShowModal(false)}
        footer={[]}
        width={modalWidth}
        destroyOnClose={true}
      >
        {activeForm === 'compra' && (
          <Compra onClose={handleOnClose} langText={langText} />
        )}
        {activeForm === 'venta' && (
          <Venta
            onClose={handleOnClose}
            selectedStock={lastSelected}
            langText={langText}
          />
        )}
        {activeForm === 'peso' && (
          <Peso
            onClose={handleOnClose}
            selectedStock={lastSelected}
            stockId={lastSelected?._id}
            langText={langText}
          />
        )}
        {activeForm === 'details' && (
          <StockDetails
            onClose={handleOnClose}
            stockId={stockId}
            langText={langText}
          />
        )}
        {activeForm === 'filter' && (
          <Filter
            onClose={handleOnClose}
            stockCount={stocks.length}
            langText={langText}
          />
        )}
        {activeForm === 'upload' && (
          <UploadFile onClose={handleOnClose} langText={langText} />
        )}
        {activeForm === 'profile' && (
          <Register
            langText={langText}
            onClose={handleOnClose}
            mode="edit"
            theUser={userData}
            onEditProfile={onEditProfile}
            setUserData={setUserData}
            userData={userData}
          />
        )}
      </Modal>
      <Buttons
        onShowModal={handleShowModal}
        isValid={!!lastSelected}
        langText={langText}
        disabled={limitedAccess}
      />
      <TheTable
        loading={loading}
        stocks={stocks}
        limitedAccess={limitedAccess}
        onDelete={deleteStock}
        onClick={handleShowDetails}
        openFilter={handleShowModal}
        openUpload={handleShowModal}
        clearSelected={clearTableSelection}
        onLastSelected={useCallback((stock) => {
          setLastSelected(
            stock[stock?.length - 1]?.venta?.fecha
              ? null
              : stock[stock.length - 1]
          );
        }, [])}
        langText={langText}
      />
    </div>
  );
}

export default Main;
