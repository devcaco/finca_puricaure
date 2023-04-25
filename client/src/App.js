import React, { useContext } from 'react';
import { Route, Routes, useNavigate, redirect } from 'react-router-dom';

import IsPrivate from './components/auth/IsPrivate';
import Main from './pages/Main';
import Login from './pages/Login';

import UserContext from './context/User.context';

import './App.css';

function App() {
  const { isLoggedIn, langText } = useContext(UserContext);
  const navigate = useNavigate();

  const checkAuth = () => {
    if (!isLoggedIn) return redirect('/login');
  };

  const allowAuth = !!(process.env.REACT_APP_AUTH === 'true');
  const allowLang = !!(process.env.REACT_APP_LANG === 'true');
  const showLogo = !!(process.env.REACT_APP_LOGO === 'true');
  console.log({ allowAuth });
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <IsPrivate allowAuth={allowAuth}>
              <Main
                langText={langText}
                allowLang={allowLang}
                allowAuth={allowAuth}
                showLogo={showLogo}
              />
            </IsPrivate>
          }
          loader={checkAuth}
        />
        <Route
          path="/login"
          element={<Login langText={langText} showLogo={showLogo} />}
        />
      </Routes>
    </div>
  );
}

export default App;
