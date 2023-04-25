import React, { useContext } from 'react';
import { Popover, Button } from 'antd';
import UserContext from '../context/User.context';

import Language from './Language';

import logo from '../assets/logo_main.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import styles from './header.module.css';

const Header = ({ allowLang, allowAuth, showLogo }) => {
  const { userData, logOutUser, langText, setLang } = useContext(UserContext);

  const profilePop = (
    <div className={styles.profilePop}>
      <h2 style={{ textAlign: 'center' }}>{userData?.name}</h2>
      <Button type="primary" style={{ width: '100%' }} onClick={logOutUser}>
        Cerrar Sesion
      </Button>
      <Button style={{ width: '100%', marginTop: '10px' }}>
        Modificar Perfil
      </Button>
      {allowLang && (
        <Language langText={langText} setLang={setLang} className={'btn2'} />
      )}
    </div>
  );
  return (
    <div className={styles.header}>
      <div>
        {showLogo ? (
          <img src={logo} alt="Ranch Puricaure Logo" />
        ) : (
          <h1>{langText['main_title']}</h1>
        )}
      </div>
      <div className={styles.profile}>
        {!allowAuth && allowLang && (
          <div className={styles.btnLang}>
            <Language
              langText={langText}
              setLang={setLang}
              className={'btn1'}
            />
          </div>
        )}
        {allowAuth && (
          <Popover content={profilePop}>
            {/* <FontAwesomeIcon icon={faUser} size="2xs" className={styles.icon} /> */}
            <Button
              shape="circle"
              size="large"
              type="primary"
              icon={
                <FontAwesomeIcon
                  icon={faUser}
                  style={{ fontSize: '1.5rem' }}
                  size="2xs"
                />
              }
            ></Button>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Header;
