import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'antd';

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

    try {
      if (!formInput.nroStock || !formInput.fechaVenta || !formInput.precio) {
        throw new Error('Formulario Invalido.');
      }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/venta',
        formInput
      );

      if (response.data.ok) {
        onClose(true);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err.message);
      setErrorMsg(err.message);
    }
  };

  const fetchStock = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API + 'stock/stockVenta'
      );

      if (response.data.ok) {
        setStocks(response.data.stockVenta);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err.message);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleChange = (e) => {
    setErrorMsg('');
    setFormInput((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
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
          disabled={!stocks.length ? 'disabled' : ''}
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

        <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
          Guardar
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </form>
    </div>
  );
};

export default Venta;
