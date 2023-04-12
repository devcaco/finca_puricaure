import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';

import styles from './compra.module.css';

const Compra = ({ onClose }) => {
  const [isReposicion, setIsReposicion] = useState(false);
  const [stockReposicion, setStockReposicion] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [formInput, setFormInput] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    nroStock: 1001,
    nroLote: 0,
    pesoEntrada: 0,
    precio: 0,
  });

  useEffect(() => {
    const getStockReposicion = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API + 'stock/stockReposicion'
        );
        if (response.data.ok)
          setStockReposicion([...response.data.stockReposicion]);
        else {
          throw new Error(response.data.errorMsg);
        }
      } catch (err) {
        console.log('ERROR -> ', err.message);
        setErrorMsg(err.message);
      }
    };

    const getStockNro = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API + 'stock/nro'
        );

        if (response.data.ok)
          setFormInput((prevState) => {
            return { ...prevState, nroStock: response.data.stockNro };
          });
        // return response.data.stockNro;
        else throw new Error(response.data.errorMsg);
      } catch (err) {
        console.log('error', err);
        // return 0;
      }
    };

    getStockNro();
    getStockReposicion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formInput.nroStock ||
        !formInput.nroLote ||
        !formInput.fecha ||
        !formInput.pesoEntrada ||
        !formInput.precio
      ) {
        throw new Error('Favor llenar campos requeridos');
        // setErrorMsg('Favor llenar campos requeridos');
        // return false;
      }

      if (isReposicion && !formInput.stockReposicion) {
        throw new Error('Favor seleccionar la reposicion');
        // setErrorMsg('Favor seleccionar la reposicion');
        // return false;
      }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/',
        formInput
      );

      if (response.data.ok) onClose(true);
      else throw new Error(response.data.errorMsg);
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
    }
  };

  const handleChange = (e) => {
    setErrorMsg('');

    if (e.target.name === 'reposicion') {
      e.target.value = e.target.checked;
      setIsReposicion(e.target.checked);
    }

    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.form}>
      <h2>Formulario de Entrada</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <form onSubmit={handleSubmit} name="compraForm" id="compraForm">
        <label htmlFor="fecha">Fecha Compra</label>
        <input
          type="date"
          name="fecha"
          id="fecha"
          onChange={handleChange}
          value={formInput.fecha}
          required
        />
        <label htmlFor="nroStock">Nro de Stock</label>
        <input
          type="number"
          name="nroStock"
          id="nroStock"
          onChange={handleChange}
          value={formInput.nroStock}
          step="1"
          required
        />

        <label htmlFor="nroLote">Nro de Lote</label>
        <input
          type="number"
          name="nroLote"
          id="nroLote"
          onChange={handleChange}
          value={formInput.nroLote}
          step="1"
          required
        />

        <label htmlFor="pesoEntrada">Peso Entrada</label>
        <div style={{ width: '100%', display: 'flex' }}>
          <input
            type="number"
            name="pesoEntrada"
            id="pesoEntrada"
            onChange={handleChange}
            value={formInput.pesoEntrada}
            step=".1"
            style={{ flex: '1' }}
            required
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
          required
        />

        <label htmlFor="reposicion">Reposicion?</label>
        <input
          type="checkbox"
          name="reposicion"
          id="reposicion"
          onChange={handleChange}
        ></input>
        {isReposicion && (
          <>
            <label htmlFor="stockReposicion">Stock</label>
            <select
              name="stockReposicion"
              id="stockReposicion"
              onChange={handleChange}
              value={formInput.stockReposicion}
              disabled={!stockReposicion.length ? 'disabled' : ''}
            >
              <option value="">------</option>
              {stockReposicion &&
                stockReposicion.map((stock) => (
                  <option key={stock._id} value={stock._id}>
                    {stock.stockNro}
                  </option>
                ))}
            </select>
          </>
        )}

        <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
          Guardar
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </form>
    </div>
  );
};

export default Compra;
