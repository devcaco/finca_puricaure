import React from 'react';

import styles from './buttons.module.css';

const Buttons = ({ onShowModal }) => {
  return (
    <div className={styles.buttons}>
      <button onClick={() => onShowModal('compra')}>Registrar Compra</button>
      <button onClick={() => onShowModal('venta')}>Registrar Venta</button>
      <button onClick={() => onShowModal('peso')}>Registrar Peso</button>
    </div>
  );
};

export default Buttons;
