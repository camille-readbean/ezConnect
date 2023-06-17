import { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from "@azure/msal-browser"; 
import LoginModal from "./LoginModal";

function Navigation(props) {
    // const isLoggedIn = props.isLoggedIn;
    
    const [showLoginModal, setLoginModal] = useState(false);
    const [isShowingNavbar, setShowNavbar] = useState(false);

    const { instance, inProgress } = useMsal();
    let activeAccount;
    const isLoggedIn = useIsAuthenticated();

    if (instance) {
        activeAccount = instance.getActiveAccount();
    }

    const handleLogoutRedirect = () => {
      instance.logoutRedirect({
        mainWindowRedirectUri: '/', // redirects the top level app after logout
      });
      // sessionStorage.clear();
    };

    const handleLoginPress = () => {
        setLoginModal(true)
    }

  return (
    <>
    {showLoginModal && <LoginModal setLoginModal={setLoginModal} />}
    <nav
      id="navbar"
      className="bg-sky-500 text-white fixed w-full z-10 top-0 p-3 shadow-md"
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="flex gap-2">
          <img src="apple-touch-icon.png" alt="Logo" className="h-6 w-auto" />
          <p className="font-bold hover:text-gray-100 transition">ezConnect</p>
        </Link>

        <div className="hidden sm:flex gap-3">
          <Link to="/homepage" className="navBarLink">
            Home
          </Link>
          <Link to="/mentormenteematcher" className="navBarLink">
            Mentoring
          </Link>
          <Link to="/studyplan" className="navBarLink">
            Study Plan
          </Link>
          <Link to="/resourcerespository" className="navBarLink">
            Resources
          </Link>
          <AuthenticatedTemplate>
            <Link onClick={handleLogoutRedirect} className="navBarLink">Logout</Link>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <Link onClick={handleLoginPress} className="navBarLink">Login</Link>
          </UnauthenticatedTemplate>
        </div>

        <GiHamburgerMenu
          onClick={() => setShowNavbar(!isShowingNavbar)}
          className="sm:hidden h-6 w-auto cursor-pointer"
        />
      </div>

      <div
        id="collapsibleMenu"
        className={`sm:hidden pl-1 ${
          isShowingNavbar ? "max-h-40" : "max-h-0 invisible"
        } overflow-hidden transition-all duration-500 ease-in-out flex flex-col gap-2`}
      >
        <Link to="/homepage" className="navBarLink pt-1">
          Home
        </Link>
        <Link to="/mentormenteematcher" className="navBarLink">
          Mentoring
        </Link>
        <Link to="/studyplan" className="navBarLink">
          Study Plan
        </Link>
        <Link to="/resourcerespository" className="navBarLink">
          Resources
        </Link>
        <AuthenticatedTemplate>
          <Link onClick={handleLogoutRedirect} className="navBarLink">Logout</Link>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Link onClick={handleLoginPress} className="navBarLink">Login</Link>
        </UnauthenticatedTemplate>
        {/* {isLoggedIn ? (
          <button onClick={handleLogout} className="navBarLink">
            Logout
          </button>
        ) : (
          <Link to="/login" className="navBarLink">
            Login
          </Link>
        )} */}
      </div>
    </nav>
    </>
  );
}

export default Navigation;
