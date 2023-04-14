import React from 'react';
import { Button } from 'antd';

import styles from './buttons.module.css';

const Buttons = ({ onShowModal, isValid }) => {
  return (
    <div className={styles.buttons}>
      <Button size="large" type="primary" onClick={() => onShowModal('compra')}>
        Registrar Compra
      </Button>
      <Button
        size="large"
        type="primary"
        disabled={!isValid}
        onClick={() => onShowModal('venta')}
      >
        Registrar Venta
      </Button>
      <Button
        size="large"
        type="primary"
        disabled={!isValid}
        onClick={() => onShowModal('peso')}
      >
        Registrar Peso
      </Button>
    </div>
  );
};

export default Buttons;
