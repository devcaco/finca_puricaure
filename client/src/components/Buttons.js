import React from 'react';
import { Button } from 'antd';

import styles from './buttons.module.css';

const Buttons = ({ onShowModal, isValid }) => {
  return (
    <div className={styles.buttons}>
      <Button size="large" type="primary" onClick={() => onShowModal('compra')}>
        Register Purchase
      </Button>
      <Button
        size="large"
        type="primary"
        disabled={!isValid}
        onClick={() => onShowModal('venta')}
      >
        Register Sale / Death
      </Button>
      <Button
        size="large"
        type="primary"
        disabled={!isValid}
        onClick={() => onShowModal('peso')}
      >
        Register Weight
      </Button>
    </div>
  );
};

export default Buttons;
