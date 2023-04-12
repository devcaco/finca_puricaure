import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'antd';

import styles from './peso.module.css';

const Peso = ({ onClose }) => {
  const [formInput, setFormInput] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    peso: '0',
    nroStock: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [stocks, setStocks] = useState([]);

  const fetchStock = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API + 'stock/stockVenta'
      );

      if (response.data.ok) setStocks(response.data.stockVenta);
      else throw new Error(response.data.errorMsg);
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formInput.fecha || !formInput.nroStock || !formInput.peso) {
        throw new Error('Formulario Invalido: Favor llenar campos requeridos');
      }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/peso',
        formInput
      );

      if (response.data.ok) {
        onClose(true);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
    }
  };

  const handleChange = (e) => {
    setErrorMsg('');

    setFormInput((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  return (
    <div className={styles.form}>
      <h2>Registrar Peso</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="fecha">Fecha</label>
        <input
          type="date"
          name="fecha"
          id="fecha"
          value={formInput.fecha}
          onChange={handleChange}
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
          {stocks &&
            stocks.map((stock) => (
              <option key={stock._id} value={stock._id}>
                {stock.stockNro}
              </option>
            ))}
        </select>

        <label htmlFor="peso">Peso</label>
        <div style={{ width: '100%', display: 'flex' }}>
          <input
            type="number"
            name="peso"
            id="peso"
            onChange={handleChange}
            value={formInput.peso}
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
        <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
          Guardar
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </form>
    </div>
  );
};

export default Peso;
