import axios from 'axios';
import React, { useState, useEffect } from 'react';

import styles from './compra.module.css';

const Compra = ({ onClose }) => {
  const [isReposicion, setIsReposicion] = useState(false);
  const [stockReposicion, setStockReposicion] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [formInput, setFormInput] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    nroStock: 1001,
    pesoEntrada: 0,
    precio: 0,
  });

  useEffect(() => {
    const getStockReposicion = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5005/api/stock/stockReposicion'
        );
        setStockReposicion([...response.data.stockReposicion]);
      } catch (err) {
        console.log('error', err);
      }
    };

    const getStockNro = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/stock/nro');
        setFormInput({ ...formInput, nroStock: response.data.stockNro });
      } catch (err) {
        console.log('error', err);
      }
    };

    getStockNro();
    getStockReposicion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formInput.nroStock ||
      !formInput.fecha ||
      !formInput.pesoEntrada ||
      !formInput.precio
    ) {
      setErrorMsg('Favor llenar campos requeridos');
      return false;
    }

    if (isReposicion && !formInput.stockReposicion) {
      setErrorMsg('Favor seleccionar la reposicion');
      return false;
    }

    const response = await axios.post(
      'http://localhost:5005/api/stock/',
      formInput
    );

    if (!response.data.ok) {
      console.log('Error Not OK');
      console.log({ theResponse: response.data });
      setErrorMsg(response.errorMsg);
    } else onClose();
  };

  const handleChange = (e) => {
    if (e.target.name === 'reposicion') {
      e.target.value = e.target.checked;
      setIsReposicion(e.target.checked);
    }
    console.log(e.target.name, e.target.value);

    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.form}>
      <h2>Formulario de Entrada</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <form onSubmit={handleSubmit}>
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
            <option value="Kgs">Kgs</option>
            <option value="Lbs">Lbs</option>
            <option value="Grm">Grms</option>
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
              disabled={
                stockReposicion && stockReposicion.length ? '' : 'disabled'
              }
            >
              {stockReposicion &&
                stockReposicion.map((stock) => (
                  <option key={stock._id} value={stock.stockNro}>
                    {stock.stockNro}
                  </option>
                ))}
            </select>
          </>
        )}

        <button style={{ marginTop: '20px' }}>Guardar</button>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </form>
    </div>
  );
};

export default Compra;
