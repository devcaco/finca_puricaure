import React from 'react';
import { Button, Dropdown } from 'antd';
// import UserContext from '../context/User.context';

import styles from './Language.module.css';

const Language = ({ langText, setLang, className }) => {
  // const { langText } = useContext(UserContext);
  // const { Langtext:langText } = useContext(UserContext);

  const handleLangChange = (e) => {
    console.log({ valor: e.key });
    setLang(e.key);
  };

  const langProps = {
    items: [
      {
        key: 'en',
        label: langText['btn_language_en'],
      },
      {
        key: 'es',
        label: langText['btn_language_es'],
      },
    ],
    onClick: handleLangChange,
    style: { width: '150px' },
  };

  if (!process.env.REACT_APP_SHOWLANG) return <div></div>;

  return (
    <Dropdown menu={langProps} placement="bottom" arrow>
      <Button className={styles[className]}>{langText['btn_language']}</Button>
    </Dropdown>
  );
};

export default Language;
