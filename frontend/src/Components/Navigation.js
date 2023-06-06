import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";

function Navigation(props) {
  const isLoggedIn = props.isLoggedIn;
  const setLogin = props.setLogin;

  const handleLogout = () => {
    localStorage.removeItem("JWT");
    localStorage.removeItem("user_id");
    setLogin(false);
  };

  const [isShowingNavbar, setShowNavbar] = useState(false);

  return (
    <nav
      id="navbar"
      className="bg-sky-500 text-white fixed w-full z-10 top-0 p-3 shadow-md"
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="flex gap-2">
          <img src="ezConnect_logo.png" alt="Logo" className="h-6 w-auto" />
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
          {isLoggedIn ? (
            <button onClick={handleLogout} className="navBarLink">
              Logout
            </button>
          ) : (
            <Link to="/login" className="navBarLink">
              Login
            </Link>
          )}
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
        {isLoggedIn ? (
          <button onClick={handleLogout} className="navBarLink">
            Logout
          </button>
        ) : (
          <Link to="/login" className="navBarLink">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
