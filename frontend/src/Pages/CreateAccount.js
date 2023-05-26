import { Link } from "react-router-dom";

function CreateAccount() {
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
    }).then((res) => {
      console.log("SUCCESS");
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <section className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-lg font-bold text-center">Create Account</h1>
        <hr className="my-3"></hr>

        <form onSubmit={handleCreateAccount}>
          <p>
            <label for="firstname">First Name</label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              placeholder="First Name"
              className="createaccountinputbox"
              required
            />
          </p>

          <p>
            <label for="lastname">Last Name</label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              placeholder="Last Name"
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
              className="createaccountinputbox"
              required
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
            <label for="course">Course</label>
            <input
              type="text"
              name="course"
              id="course"
              placeholder="Course"
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

        <Link to="/login" className="underline">
          Already have an account? Log in
        </Link>
      </section>
    </div>
  );
}

export default CreateAccount;
