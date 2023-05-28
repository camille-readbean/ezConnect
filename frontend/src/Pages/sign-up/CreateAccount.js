import { Link } from "react-router-dom";
import { useState } from "react";

function CreateAccount() {
  const [responseMessage, setResponseMessage] = useState("");

  const handleCreateAccount = (event) => {
    event.preventDefault();
    console.log(event.target.email.value);
    fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: event.target.email.value,
      }),
    }).then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setResponseMessage(data.message);
        } else if (data.error) {
          setResponseMessage(data.error);
        } else if (data.detail) {
          setResponseMessage(data.detail);
        }
      });
  };

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <section className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-lg font-bold text-center">Create Account</h1>
        <hr className="my-3"></hr>

        <form onSubmit={handleCreateAccount}>
          <p>
            <label htmlFor="signupemail">Email</label>
            <input
              type="email"
              name="email"
              id="signupemail"
              placeholder="Email"
              className="createaccountinputbox"
              required
            />
          </p>

          <button
            type="submit"
            className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
          >
            Submit
          </button>
        </form>

        {responseMessage && <p>{responseMessage}</p>}

        <Link to="/login" className="underline">
          Already have an account? Log in
        </Link>
      </section>
    </div>
  );
}

export default CreateAccount;
