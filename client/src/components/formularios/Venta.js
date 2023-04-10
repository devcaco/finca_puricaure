import React, { useState } from 'react';

import styles from './venta.module.css';

const Venta = ({ onClose }) => {
  const [formInput, setFormInput] = useState({
    fechaVenta: new Date().toISOString().slice(0, 10),
    nroReferencia: 1001,
    pesoSalida: 0,
    precio: 0,
  });
  const [isReposicion, setIsReposicion] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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
      <h2>Formulario de Venta</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fechaVenta">Fecha Venta</label>
        <input
          type="date"
          name="fechaVenta"
          id="fechaVenta"
          onChange={handleChange}
          value={formInput.fechaVenta}
        />
        <label htmlFor="nroReferencia">Nro de Stock</label>
        <input
          type="number"
          name="nroReferencia"
          id="nroReferencia"
          onChange={handleChange}
          value={formInput.nroReferencia}
          step="1"
        />

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
        />

        <label htmlFor="precio">Reposicion?</label>
        <input
          type="checkbox"
          name="reposicion"
          id="reposicion"
          onChange={handleChange}
        ></input>
        {isReposicion && (
          <>
            <label htmlFor="animalRepuesto">Stock</label>
            <select
              name="animalRepuesto"
              id="animalRepuesto"
              onChange={handleChange}
              value={formInput.animalRepuesto}
            >
              <option value="1">Stock 1</option>
              <option value="2">Stock 2</option>
              <option value="3">Stock 3</option>
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

export default Venta;
