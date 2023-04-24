import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, redirect } from 'react-router-dom';

import axios from 'axios';
import { Button, Alert } from 'antd';
import styles from './Login.module.css';

import { Login as LoginForm } from '../components/forms/Login';

import UserContext from '../context/User.context';

import main_logo from '../assets/logo_main.png';

const Login = () => {
  const [alertActive, setAlertActive] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  const {
    setUserData,
    userMessage,
    setUserMessage,
    storeToken,
    authenticateUser,
    isLoggedIn,
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
        // navigate('/');
        // if (response.data.ok) redirect('/');
      }
      //   setUserData(response.data.theUser);
    } catch (err) {
      console.log('ERROR ----> ', err);
      showAlert('error', err.message);
    }
  };

  return (
    <div className={styles.login__container}>
      <div className={styles.login__header}>
        <img src={main_logo} alt="Please login to access full functionality" />
      </div>
      <div className={styles.login__body}>
        <div>
          <h1>Welcome, Please login</h1>
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
          <LoginForm showAlert={showAlert} handleLogin={handleLogin} />
        </div>

        <div>
          <Button type="link">Forgot Password?</Button> |
          <Button type="link">Request Access</Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
