import { Link } from "react-router-dom";
import { useState } from "react";

function CreateAccount() {
  const [responseMessage, setResponseMessage] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const signUpRequestToken = urlParams.get('signUpRequestToken')

  const handleCreateAccount = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmpassword.value;
    if (password !== confirmPassword) {
      setResponseMessage("Password must match");
      return;
    }
    console.log(event.target.email.value);
    fetch(`http://localhost:5000/api/auth/signup/${signUpRequestToken}?emailQueryString=${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: event.target.name.value,
        year: parseInt(event.target.yearofstudy.value),
        course: event.target.course.value,
        password: event.target.password.value,
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
        <h1 className="text-lg font-bold text-center">Complete account creation</h1>
        <center>Just a few more steps</center>
        <hr className="my-3"></hr>

        <form onSubmit={handleCreateAccount}>
          <p>
            <label for="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              className="createaccountinputbox"
              required
            />
          </p>

          <p>
            <label for="signupemail">Email</label>
            <input
              type="email"
              name="email"
              id="signupemail"
              placeholder="Email"
              className="createaccountinputbox bg-gray-200 pointer-events-none"
              value={email}
              required
              tabIndex="-1"
            />
          </p>

          <p>
            <label for="signuppassword">Password</label>
            <input
              type="password"
              name="password"
              id="signuppassword"
              placeholder="Password"
              className="createaccountinputbox"
              required
            />
          </p>

          <p>
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input
              type="password"
              name="confirmpassword"
              id="confirmpassword"
              placeholder="Confirm Password"
              className="createaccountinputbox"
              required
            />
          </p>

          <p>
            <label for="course">Course</label>
            <input
              type="text"
              name="course"
              id="course"
              placeholder="Computer Science"
              className="createaccountinputbox"
              required
            />
          </p>

          <p>
            <label for="yearofstudy">Year of study</label>
            <select
              name="yearofstudy"
              id="yearofstudy"
              className="createaccountinputbox"
              required
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </p>

          <button
            type="submit"
            className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
          >
            Submit
          </button>
        </form>

        {responseMessage && <p className="text-gray-600">{responseMessage}</p>}

        <Link to="/login" className="underline">
          Already have an account? Log in
        </Link>
      </section>
    </div>
  );
}

export default CreateAccount;
