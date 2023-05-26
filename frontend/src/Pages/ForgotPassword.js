function ForgotPassword() {
  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <div className="w-96 p-6 shadow-lg bg-white rounded-md">
        <h1 className="text-lg font-bold text-center">Reset Password</h1>
        <hr className="my-3"></hr>
        <form>
          <p>Email</p>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="border-2 w-full my-2 p-1 border-slate-200 rounded-md"
            required
          />

          <button
            type="submit"
            className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
