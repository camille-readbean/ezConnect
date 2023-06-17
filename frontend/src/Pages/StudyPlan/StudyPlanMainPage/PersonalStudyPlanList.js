import { Link } from "react-router-dom";

function PersonalStudyPlanList({ personalStudyPlans }) {
  return (
    <div className="bg-white p-2 rounded-lg">
      <p className="text-lg m-1 font-semibold">
        Click on a study plan to continue editing!
      </p>
      <div className="flex overflow-x-auto whitespace-nowrap">
        {personalStudyPlans.map((studyPlan) => {
          return (
            <div className="bg-white rounded-lg w-64 h-44 p-3 m-2 shadow-md">
              <p>Supposed to be a card</p>
            </div>
          );
        })}
        <Link to="/studyplan/editor" className="group relative">
          <div className="absolute bg-white w-64 rounded-lg h-44 p-3 m-2 shadow-md flex items-center justify-center">
            <p>Create a new study plan</p>
          </div>
          <div className="bg-black text-white opacity-0 rounded-lg w-64 h-44 p-3 m-2 shadow-md items-center justify-center flex group-hover:opacity-80 transition">
            <p>Create blank</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default PersonalStudyPlanList;
