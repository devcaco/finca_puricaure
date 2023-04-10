import React, { useEffect, useState } from 'react';
import axios from 'axios';

import './App.css';
import Header from './components/Header';
import Buttons from './components/Buttons';
import Modal from './components/ui/Modal';

import Compra from './components/formularios/Compra';
import Venta from './components/formularios/Venta';
import Peso from './components/formularios/Peso';
import TheTable from './components/TheTable';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState('');
  const [stocks, setStocks] = useState([]);
  // const [fetch, setFetch] = useState(false);

  const fetchStock = async () => {
    const response = await axios.get('http://localhost:5005/api/stock/');
    console.log({ theStocks: response.data.stocks });
    if (response.data.ok) setStocks(response.data.stocks);
  };

  const deleteStock = async (stockArr) => {
    try {
      const response = await axios.delete('http://localhost:5005/api/stock/', {
        data: stockArr,
      });
      if (response.data.ok) fetchStock();
    } catch (err) {
      console.log('ERROR -> ', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleOnClose = () => {
    setShowModal(false);
    fetchStock();
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
      default:
        setActiveForm('');
    }

    setShowModal(true);
  };

  return (
    <div className="App">
      <Header />
      {showModal && (
        <Modal onClose={handleOnClose}>
          {activeForm === 'compra' && <Compra onClose={handleOnClose} />}
          {activeForm === 'venta' && <Venta onClose={handleOnClose} />}
          {activeForm === 'peso' && <Peso onClose={handleOnClose} />}
        </Modal>
      )}
      <Buttons onShowModal={handleShowModal} />
      <TheTable stocks={stocks} onDelete={deleteStock} />
    </div>
  );
}

export default App;
