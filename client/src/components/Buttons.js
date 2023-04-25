import React from 'react';
import { Button } from 'antd';

import styles from './buttons.module.css';

const Buttons = ({ onShowModal, isValid, langText }) => {

  return (
    <div className={styles.buttons}>
      <Button size="large" type="primary" onClick={() => onShowModal('compra')}>
        {langText['btn_register_purchase']}
      </Button>
      <Button
        size="large"
        type="primary"
        disabled={!isValid}
        onClick={() => onShowModal('venta')}
      >
        {langText['btn_register_sale']}
      </Button>
      <Button
        size="large"
        type="primary"
        disabled={!isValid}
        onClick={() => onShowModal('peso')}
      >
        {langText['btn_register_weight']}
      </Button>
    </div>
  );
};

export default Buttons;
