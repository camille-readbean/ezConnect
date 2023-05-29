import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage(props) {
  const navigate = useNavigate();
  const [responseMessage, setResponseMessage] = useState("");

  // temporary function to demonstrate change in navigation bar after logging in
  const handleLogin = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');;
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: event.target.email.value,
        password: event.target.password.value
      }),
    }).then((res) => res.json())
      .then((data) => {
        if (data.JWT) {
          setResponseMessage(data.message);
          localStorage.setItem('JWT', data.JWT)
          localStorage.setItem('user_id', data.user)
          const setLogin = props.setLogin;
          setLogin(true);
          navigate("/");
        } else if (data.error) {
          setResponseMessage(data.error);
        } else if (data.detail) {
          setResponseMessage(data.detail);
        }
      });
    
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
              required tabIndex={1}
            />
          </div>

          <div className="my-1">
            <p>Password</p>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="border-2 w-full p-1 border-slate-200 rounded-md"
              required tabIndex={2}
            />
          </div>

          <div className="my-1 flex justify-between text-gray-400 text-sm">
            <Link to="/forgotpassword" className="underline" tabIndex={5}>
              Forgot Password?
            </Link>
          </div>

          {responseMessage && <p className="text-red-600">{responseMessage}</p>}

          <button
            type="submit" tabIndex={3}
            className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
          >
            Submit
          </button>
        </form>

        <Link to="/signup/create-account" className="underline" tabIndex={4}>
          {" "}
          Don't have an account? Create one here!{" "}
        </Link>
      </div>
    </div>
  );
}
