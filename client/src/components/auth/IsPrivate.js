import { useContext } from 'react';
import UserContext from '../../context/User.context';
import { Navigate } from 'react-router-dom';

function IsPrivate({ children }) {
  const { isLoggedIn, isLoading } = useContext(UserContext);

  // If the authentication is still loading
  if (isLoading) return <p></p>;

  if (!isLoggedIn) {
    // If the user is not logged in
    console.log('NOT LOGGED IN REDIRECTING');
    return <Navigate to="/login" />;
  } else {
    // If the user is logged in, allow to see the page
    return children;
  }
}

export default IsPrivate;
