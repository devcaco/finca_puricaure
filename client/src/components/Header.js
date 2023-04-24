import React, { useContext } from 'react';
import { Popover, Button } from 'antd';
import UserContext from '../context/User.context';

import logo from '../assets/logo_main.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import styles from './header.module.css';

const Header = () => {
  const { userData, logOutUser } = useContext(UserContext);

  const profilePop = (
    <div className={styles.profilePop}>
      <h2 style={{ textAlign: 'center' }}>{userData.name}</h2>
      <Button type="primary" style={{ width: '100%' }} onClick={logOutUser}>
        Log Out
      </Button>
      <Button style={{ width: '100%', marginTop: '10px' }}>Edit Profile</Button>
    </div>
  );
  return (
    <div className={styles.header}>
      <div>
        <img src={logo} alt="Ranch Puricaure Logo" />
      </div>
      <div className={styles.profile}>
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
      </div>
    </div>
  );
};

export default Header;
