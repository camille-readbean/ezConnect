import { GrUserWorker } from "react-icons/gr";

function Homepage(props) {
  console.log(props.isLoggedIn)
  return (
    <div className="w-96 p-6 shadow-lg bg-white rounded-md flex flex-col items-center justify-center">
      {props.isLoggedIn && <p>User ID: {localStorage.getItem('user_id')} is logged in</p>}
      <p>This page is the homepage.</p>
      <p>Page is under construction.</p>
      <GrUserWorker className="w-28 h-28" />
    </div>
  );
}

export default Homepage;
