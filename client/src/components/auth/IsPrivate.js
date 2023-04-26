import { useContext } from 'react';
import UserContext from '../../context/User.context';
import { Navigate } from 'react-router-dom';

function IsPrivate({ children, allowAuth }) {
  const { isLoggedIn, isLoading } = useContext(UserContext);

  // If the authentication is still loading
  if (isLoading) return <p></p>;

  if (allowAuth && !isLoggedIn) {
    console.log('NOT LOGGED IN REDIRECTING')
    // If the user is not logged in
    return <Navigate to="/login" />;
  } else {
    // If the user is logged in, allow to see the page
    return children;
  }
}

export default IsPrivate;
