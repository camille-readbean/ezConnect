import { GrUserWorker } from "react-icons/gr";
import { useMsal, AuthenticatedTemplate, useIsAuthenticated } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

function Homepage(props) {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  const navigate = useNavigate();
  const isAuthenicated = useIsAuthenticated();
  // redirect user to create account if they are a new user
  function checkNewUser() {
    if (isAuthenicated) {
      const checkNewAccount = localStorage.getItem(`${activeAccount.username} ezConnect_new_user`);
      if (activeAccount.idTokenClaims["newUser"] && checkNewAccount !== 'false') {
        localStorage.setItem(`${activeAccount.username} ezConnect_new_user`, 'true');
      }
      const isNewAccount = localStorage.getItem(`${activeAccount.username} ezConnect_new_user`);
      
      if (isNewAccount === 'true' && isAuthenicated) {
        navigate('/user/create-account')
      }
      // TODO: maybe a check to set user id
    }
  }

  useEffect(checkNewUser, [navigate, isAuthenicated, activeAccount]);

  return (
    <div className="w-96 p-6 shadow-lg bg-white rounded-md flex flex-col items-center justify-center">
      {/* {props.isLoggedIn && <p>User ID: {localStorage.getItem('user_id')} is logged in</p>} */}

      <AuthenticatedTemplate>
        {activeAccount ? (
          <ul>
            {Object.entries(activeAccount.idTokenClaims).map(([key, value]) => (
                <li key={key}>
                    {key}: {value}
                </li>
            ))}
        </ul>
        ) : null}
      </AuthenticatedTemplate>

      <p>This page is the homepage.</p>
      <p>Page is under construction.</p>
      <GrUserWorker className="w-28 h-28" />
    </div>
  );
}

export default Homepage;
