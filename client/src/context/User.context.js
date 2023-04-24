import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userMessage, setUserMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    authenticateUser();
  }, []);

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
          console.log({ THEDATAAA: response.data });

          setIsLoggedIn(true);
          setIsLoading(false);
          setUserData(response.data.payload);
        }
      } catch (err) {
        console.log('ERROR -> ', err);
        setIsLoading(false);
        setUserData(null);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoading(false);
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  const removeToken = () => {
    localStorage.removeItem('authToken');
  };

  const logOutUser = () => {
    removeToken();
    authenticateUser();
    setUserMessage({ type: 'success', message: 'You are now Logged Out' });
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
        }}
      >
        {children}
      </UserContext.Provider>
    </>
  );
};

export default UserContext;
