import { Link } from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from "@azure/msal-browser"; 
// import { loginRequest, b2cPolicies } from '../authConfig';
import { b2cPolicies } from '../authConfig';

function Navigation(props) {
    // const isLoggedIn = props.isLoggedIn;
    const setLogin = props.setLogin;
    
    const { instance, inProgress } = useMsal();
    let activeAccount;
    const isLoggedIn = useIsAuthenticated();

    if (instance) {
        activeAccount = instance.getActiveAccount();
    }

    const handleLoginPopup = () => {
        instance
            // .loginPopup({
            //     // scopes: ['openid', 'profile', 'email'],
            //     // redirectUri: '/homepage',
            // })
            .loginPopup()
            .catch((error) => console.log(error));
    };
    

    // const handleLogout = () => {
    //     localStorage.removeItem('JWT')
    //     localStorage.removeItem('user_id')
    //     setLogin(false);
    // }

    const handleLogoutPopup = () => {
        instance.logoutPopup({
            mainWindowRedirectUri: '/', // redirects the top level app after logout
        });
    };

    return (
        <header className="sticky top-0 w-screen bg-blue-500 text-white p-3">
            <div className="flex justify-between">
                <Link to="/" className="font-bold">ezConnect</Link>
                <nav className="flex gap-3">
                    <Link to="/homepage">Home</Link>
                    <Link to="/mentormenteematcher">Mentor-Mentee Matcher</Link>
                    <Link to="/studyplan">Study Plan</Link>
                    <Link to="/resourcerespository">Resource Respository</Link>
                    <AuthenticatedTemplate>
                        <Link onClick={handleLogoutPopup}>Logout</Link>
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                        <Link onClick={handleLoginPopup}>Login</Link>
                    </UnauthenticatedTemplate>
                    {/* {isLoggedIn ? <button onClick={handleLogout}>Logout</button> : <Link to="/login">Login</Link>} */}
                </nav>
            </div>
        </header>
    );
}

export default Navigation;