import React, { useContext } from 'react';
import { Popover, Button } from 'antd';
import UserContext from '../context/User.context';

import Language from './Language';

import logo from '../assets/logo_main.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import styles from './header.module.css';

const Header = ({ allowLang, allowAuth, showLogo, onEditProfile }) => {
  const { userData, logOutUser, langText, setLang, limitedAccess } =
    useContext(UserContext);

  const profilePop = (
    <div className={styles.profilePop}>
      <h2 style={{ textAlign: 'center' }}>
        {limitedAccess
          ? langText['header_user_limited_access']
          : userData?.name}
      </h2>
      <Button type="primary" style={{ width: '100%' }} onClick={logOutUser}>
        {limitedAccess
          ? langText['header_user_login']
          : langText['header_user_logout']}
      </Button>
      {!limitedAccess && (
        <div>
          <Button
            style={{ width: '100%', marginTop: '10px' }}
            onClick={() => {
              onEditProfile('profile');
            }}
          >
            {langText['header_user_edit_profile']}
          </Button>
          {allowLang && (
            <Language
              langText={langText}
              setLang={setLang}
              className={'btn2'}
            />
          )}
        </div>
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
            {userData?.picture === '' || !userData?.picture ? (
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
            ) : (
              <img
                src={userData.picture}
                alt="User Profile Pic"
                style={{
                  borderRadius: '50%',
                  border: '1px solid #000',
                  borderColor: '#dedede',
                  cursor: 'pointer',
                }}
              />
            )}
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Header;
