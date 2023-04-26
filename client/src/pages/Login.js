import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { Button, Alert, Modal } from 'antd';
import styles from './Login.module.css';

import { Login as LoginForm } from '../components/forms/Login';
import Register from '../components/forms/Register';
import Language from '../components/Language';

import UserContext from '../context/User.context';

import main_logo from '../assets/logo_main.png';

const Login = ({ langText, showLogo }) => {
  const [alertActive, setAlertActive] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [showModal, setShowModal] = useState(false);

  const {
    setUserData,
    userMessage,
    setUserMessage,
    setLang,
    storeToken,
    authenticateUser,
    isLoggedIn,
    setLimitedAccess,
    limitedAccess,
  } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (alertActive) {
      setTimeout(() => {
        if (alertActive) handleAlertClose();
      }, 5000);
    }
  }, [alertActive]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
    if (userMessage?.type) {
      setAlertMsg(userMessage.message);
      setAlertType(userMessage.type);
      setAlertActive(true);
      setUserMessage(null);
    }
  }, [isLoggedIn]);

  const handleAlertClose = () => {
    setAlertActive(false);
  };

  const showAlert = (type, message) => {
    setAlertMsg(message);
    setAlertType(type);
    setAlertActive(true);
  };

  const handleLogin = async (loginInput) => {
    try {
      console.log({ loginInput });

      const response = await axios.post(
        process.env.REACT_APP_API + 'auth/login',
        loginInput
      );

      if (!response.data.ok) throw new Error(response.data.errorMsg);
      else {
        storeToken(response.data.authToken);
        authenticateUser();
      }
    } catch (err) {
      console.log('ERROR ----> ', err);
      showAlert('error', err.message);
    }
  };

  const onRegister = () => {
    console.log('REGISTER SUCCESSFULL');
    showAlert('success', 'Registration Successful');
    toggleModal();
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <div className={styles.login__container}>
      <Modal
        open={showModal}
        centered
        onCancel={() => setShowModal(false)}
        footer={[]}
        width={400}
        destroyOnClose={true}
      >
        <Register
          langText={langText}
          toggleModal={toggleModal}
          onRegister={onRegister}
          formMode="new"
        ></Register>
      </Modal>
      <div className={styles.login__header}>
        <div>
          {showLogo ? (
            <img src={main_logo} alt="" />
          ) : (
            <h1>{langText['main_title']}</h1>
          )}
        </div>
        <div className={styles.login_lang_btn}>
          <Language langText={langText} setLang={setLang} />
        </div>
      </div>
      <div className={styles.login__body}>
        <div>
          <h1>{langText['login_page_title']}</h1>
          <div className={styles.alert}>
            {alertActive && (
              <Alert
                message={alertMsg}
                type={alertType}
                onClose={handleAlertClose}
                showIcon
                closable
              />
            )}
          </div>
        </div>
        <div className={styles['login__form-container']}>
          <LoginForm
            showAlert={showAlert}
            handleLogin={handleLogin}
            langText={langText}
            limitedAccess={() => {
              console.log('Setting Limited Access to True');
              setLimitedAccess(true);
            }}
          />
        </div>

        <div>
          <Button type="link">{langText['login_page_forgot_pwd']}</Button> |
          <Button type="link" onClick={toggleModal}>
            {langText['login_page_register']}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
