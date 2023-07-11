import { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import LoginModal from "./LoginModal";

function Navigation(props) {
  // const isLoggedIn = props.isLoggedIn;

  const [showLoginModal, setLoginModal] = useState(false);
  const [isShowingNavbar, setShowNavbar] = useState(false);

  const { instance } = useMsal();

  const handleLogoutRedirect = () => {
    instance.logoutRedirect({
      mainWindowRedirectUri: "/", // redirects the top level app after logout
    });
    // sessionStorage.clear();
  };

  const handleLoginPress = () => {
    setLoginModal(true);
  };

  return (
    <>
      {showLoginModal && <LoginModal setLoginModal={setLoginModal} />}
      <nav
        id="navbar"
        className="bg-sky-500 text-white fixed w-full z-30 top-0 p-3 shadow-md"
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex gap-2">
            <img
              src="/apple-touch-icon.png"
              alt="Logo"
              className="h-6 w-auto"
            />
            <p className="font-bold hover:text-gray-100 transition">
              ezConnect
            </p>
          </Link>

          <div className="hidden sm:flex gap-3">
            <Link to="/homepage" className="navBarLink">
              Home
            </Link>
            <Link to="/mentoring" className="navBarLink">
              Mentoring
            </Link>
            <div className="group relative">
              <Link to="/studyplan" className="navBarLink">
                Study Plan
              </Link>
              <Link
                to="/studyplan/favourites"
                className="absolute top-full left-0 bg-slate-100 hover:bg-sky-100 rounded-md py-1 px-4 shadow-sm text-black invisible group-hover:visible transition"
              >
                Favourites
              </Link>
            </div>
            <AuthenticatedTemplate>
              <Link onClick={handleLogoutRedirect} className="navBarLink">
                Logout
              </Link>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <Link onClick={handleLoginPress} className="navBarLink">
                Login
              </Link>
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
          <div className="flex flex-col group">
            <Link to="/studyplan" className="navBarLink">
              Study Plan
            </Link>
            <Link
              to="/studyplan/favourites"
              className="navBarLink ml-4 max-h-0 invisible group-hover:max-h-10 group-hover:visible overflow-hidden transition-all duration-500 ease-in-out"
            >
              Favourites
            </Link>
          </div>
          <AuthenticatedTemplate>
            <Link onClick={handleLogoutRedirect} className="navBarLink">
              Logout
            </Link>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <Link onClick={handleLoginPress} className="navBarLink">
              Login
            </Link>
          </UnauthenticatedTemplate>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
