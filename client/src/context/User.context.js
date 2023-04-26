import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import langFile from '../assets/lang.json';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userMessage, setUserMessage] = useState(null);
  const [lang, setLang] = useState(process.env.REACT_APP_LANG || 'es');
  const [langText, setLangText] = useState({ ...langFile[lang] });
  const [limitedAccess, setLimitedAccess] = useState(false);

  useEffect(() => {
    authenticateUser();
  }, [limitedAccess]);

  useEffect(() => {
    setLangText({ ...langFile[lang] });
  }, [lang]);

  const storeToken = (token) => {
    localStorage.setItem('authToken', token);
  };

  const authenticateUser = async () => {
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API + 'auth/verify',
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );

        if (!response.data.ok) throw new Error(response.data.errorMsg);
        else {
          setIsLoggedIn(true);
          setIsLoading(false);
          setUserData(response.data.payload);
        }
      } catch (err) {
        setIsLoading(false);
        setUserData(null);
        setIsLoggedIn(false);
      }
    } else {
      console.log('AUTHINGTICATING AND NO TOKEN');
      if (limitedAccess) {
        console.log('GIVING LIMITED ACCESS');
        setIsLoading(false);
        setIsLoggedIn(true);
      } else {
        setIsLoading(false);
        setUserData(null);
        setIsLoggedIn(false);
      }
    }
  };

  const removeToken = () => {
    localStorage.removeItem('authToken');
  };

  const logOutUser = () => {
    if (limitedAccess)
      setUserMessage({
        type: 'warning',
        message: langText['login_page_login_full_access_msg'],
      });
    else
      setUserMessage({
        type: 'success',
        message: langText['login_page_logout_msg'],
      });
    removeToken();
    setLimitedAccess(false);
    authenticateUser();
  };

  return (
    <>
      <UserContext.Provider
        value={{
          userData,
          setUserData,
          isLoggedIn,
          setIsLoggedIn,
          isLoading,
          setIsLoading,
          storeToken,
          authenticateUser,
          logOutUser,
          userMessage,
          setUserMessage,
          langText,
          setLang,
          setLimitedAccess,
          limitedAccess,
        }}
      >
        {children}
      </UserContext.Provider>
    </>
  );
};

export default UserContext;
