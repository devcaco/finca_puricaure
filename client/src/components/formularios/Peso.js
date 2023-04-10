import React, { useState } from 'react';

import styles from './peso.module.css';

const Peso = ({ onClose }) => {
  const [formInput, setFormInput] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    peso: '0',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.form}>
      <h2>Registrar Peso</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fecha">Fecha</label>
        <input
          type="date"
          name="fecha"
          id="fecha"
          value={formInput.fecha}
          onChange={handleChange}
        />

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
            <option value="Kgs">Kgs</option>
            <option value="Lbs">Lbs</option>
            <option value="Grm">Grms</option>
          </select>
        </div>
        <button style={{ marginTop: '20px' }}>Guardar</button>
        <button type="button" onClick={onClose}>
          Cerrar
        </button>
      </form>
    </div>
  );
};

export default Peso;
