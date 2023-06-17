import { Link } from "react-router-dom";

function EmptyPersonalStudyPlan() {
  return (
    <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full rounded-lg">
      <p className="text-lg m-2">You have no study plan</p>
      <Link to="/studyplan/editor" className="bluebutton">
        Create one now
      </Link>
    </div>
  );
}

export default EmptyPersonalStudyPlan;
