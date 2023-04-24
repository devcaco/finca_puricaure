import React, { useContext } from 'react';
import { Route, Routes, useNavigate, redirect } from 'react-router-dom';

import IsPrivate from './components/auth/IsPrivate';
import Main from './pages/Main';
import Login from './pages/Login';

import UserContext from './context/User.context';

import './App.css';

function App() {
  const { isLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();

  const checkAuth = () => {
    if (!isLoggedIn) return redirect('/login');
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <IsPrivate>
              <Main />
            </IsPrivate>
          }
          loader={checkAuth}
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
