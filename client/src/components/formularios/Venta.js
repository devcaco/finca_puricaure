import React, { useState, useEffect } from 'react';
import axios from 'axios';

import styles from './venta.module.css';

const Venta = ({ onClose }) => {
  const [formInput, setFormInput] = useState({
    fechaVenta: new Date().toISOString().slice(0, 10),
    nroStock: '',
    pesoSalida: 0,
    precio: 0,
  });
  const [stocks, setStocks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({
      nroStock: formInput.nroStock,
      fechaVenta: formInput.fechaVenta,
      precio: formInput.precio,
    });

    if (!formInput.nroStock || !formInput.fechaVenta || !formInput.precio) {
      setErrorMsg('Formulario Invalido.');
      return false;
    }

    const response = await axios.post(
      'http://localhost:5005/api/stock/venta',
      formInput
    );

    if (response.data.ok) {
      onClose();
    } else {
      setErrorMsg(response.data.errorMsg);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5005/api/stock/stockVenta'
      );

      if (response.data.ok) {
        setStocks(response.data.stockVenta);
        console.log({ theResponse: response.data.stockVenta });
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR > ', err);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleChange = (e) => {
    setErrorMsg('');
    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.form}>
      <h2>Formulario de Venta</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="fechaVenta">Fecha Venta</label>
        <input
          type="date"
          name="fechaVenta"
          id="fechaVenta"
          onChange={handleChange}
          value={formInput.fechaVenta}
        />
        <label htmlFor="nroStock">Nro de Stock</label>
        <select
          name="nroStock"
          id="nroStock"
          onChange={handleChange}
          value={formInput.nroStock}
          disabled={!stocks.length ? 'disabled': ''}
        >
          <option value="">Seleccionar</option>
          {stocks.map((stock) => (
            <option key={stock._id} value={stock._id}>
              {stock.stockNro}
            </option>
          ))}
        </select>

        <label htmlFor="pesoSalida">Peso Salida</label>
        <div style={{ width: '100%', display: 'flex' }}>
          <input
            type="number"
            name="pesoSalida"
            id="pesoSalida"
            onChange={handleChange}
            value={formInput.pesoSalida}
            step=".1"
            style={{ flex: '1' }}
          />
          <select
            name="unidadPeso"
            id="unidadPeso"
            onChange={handleChange}
            value={formInput.unidadPeso}
          >
            <option value="kg">Kgs</option>
            <option value="lb">Lbs</option>
            <option value="grm">Grms</option>
          </select>
        </div>

        <label htmlFor="precio">Precio Por Peso</label>
        <input
          type="number"
          name="precio"
          id="precio"
          onChange={handleChange}
          value={formInput.precio}
          step=".1"
        />

        <button style={{ marginTop: '20px' }}>Guardar</button>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </form>
    </div>
  );
};

export default Venta;
