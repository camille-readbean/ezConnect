import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated } from '@azure/msal-react';

function LoginModal({setLoginModal}) {
    const { instance, inProgress } = useMsal();
    let activeAccount;
    const isLoggedIn = useIsAuthenticated();

    if (instance) {
        activeAccount = instance.getActiveAccount();
    }

    const handleLoginRedirect = () => {
        instance
            .loginRedirect({
                // scopes: ['openid', 'profile', 'email'],
                // redirectUri: '/homepage',
            })
            // .loginRedirect()
            .catch((error) => console.log(error));
    };
    
    const closeModal = () => {
        setLoginModal(false);
    }

    // const handleLogout = () => {
    //     localStorage.removeItem('JWT')
    //     localStorage.removeItem('user_id')
    //     setLogin(false);
    // }

    const handleLogoutRedirect = () => {
        instance.logoutRedirect({
            mainWindowRedirectUri: '/', // redirects the top level app after logout
        });
    };

    return (
    <div>
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="p-4">
                <h2 className="text-xl mb-4">Login / Create an account using your school Microsoft account</h2>
                <p className="text-sm mb-4">
                  Press the button below to be redirected for login.
                </p>
                <button
                  onClick={handleLoginRedirect}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Login
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
    )
}

export default LoginModal