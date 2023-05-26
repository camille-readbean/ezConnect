import { Link } from "react-router-dom";

function Navigation(props) {
    const isLoggedIn = props.isLoggedIn;
    const setLogin = props.setLogin;

    const handleLogout = () => {
        setLogin(false);
    }

    return (
        <header className="sticky top-0 w-screen bg-blue-500 text-white p-3">
            <div className="flex justify-between">
                <Link to="/" className="font-bold">ezConnect</Link>
                <nav className="flex gap-3">
                    <Link to="/homepage">Home</Link>
                    <Link to="/mentormenteematcher">Mentor-Mentee Matcher</Link>
                    <Link to="/studyplan">Study Plan</Link>
                    <Link to="/resourcerespository">Resource Respository</Link>
                    {isLoggedIn ? <button onClick={handleLogout}>Logout</button> : <Link to="/login">Login</Link>}
                </nav>
            </div>
        </header>
    );
}

export default Navigation;