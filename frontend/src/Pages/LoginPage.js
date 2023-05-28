import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function LoginPage(props) {
  const navigate = useNavigate();

  // temporary function to demonstrate change in navigation bar after logging in
  const handleLogin = (event) => {
    event.preventDefault();
    const setLogin = props.setLogin;
    setLogin(true);
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <div className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-lg font-bold text-center">Login</h1>
        <hr className="my-3"></hr>

        <form className="my-2" onSubmit={handleLogin}>
          <div className="my-1">
            <p>Email</p>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="border-2 w-full p-1 border-slate-200 rounded-md"
              required
            />
          </div>

          <div className="my-1">
            <p>Password</p>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="border-2 w-full p-1 border-slate-200 rounded-md"
              required
            />
          </div>

          <div className="my-1 flex justify-between">
            <div>
              <input type="checkbox" id="remembermeCB" className="mr-1" />
              <label for="remembermeCB">Remember me?</label>
            </div>
            <Link to="/forgotpassword" className="underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
          >
            Submit
          </button>
        </form>

        <Link to="/signup/create-account" className="underline">
          {" "}
          Don't have an account? Create one here!{" "}
        </Link>
      </div>
    </div>
  );
}
