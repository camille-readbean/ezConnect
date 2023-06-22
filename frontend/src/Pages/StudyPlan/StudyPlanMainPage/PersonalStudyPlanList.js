import { Link } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";

function PersonalStudyPlanList({
  personalStudyPlans,
  azure_ad_oid,
  createNewStudyPlan,
  deleteStudyPlan,
}) {
  const makeCard = (studyPlanInformation) => {
    const title = studyPlanInformation["title"];
    const dateUpdated = studyPlanInformation["date_updated"];
    const id = studyPlanInformation["id"];

    // TODO: improve styling
    return (
      <div className="group relative bg-white rounded-lg w-64 h-44 p-3 m-2 shadow-md overflow-hidden">
        <Link
          to={`/studyplan/editor/${id}`}
          className="font-semibold whitespace-normal break-words"
        >
          {title}
        </Link>
        <div className="flex justify-between items-center">
          <p className="text-sm italic whitespace-normal break-words">
            Last updated: {dateUpdated}
          </p>
          <AiFillDelete
            className="hidden cursor-pointer group-hover:block hover:bg-sky-500 p-1 h-6 w-6 rounded-md"
            onClick={() => deleteStudyPlan(id)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-2 rounded-lg">
      <p className="text-lg m-1 font-medium">
        Click on a study plan to continue editing!
      </p>
      <div className="flex overflow-x-auto whitespace-nowrap">
        {personalStudyPlans.map((studyPlan) => makeCard(studyPlan))}
        <div
          className="group relative"
          onClick={() => createNewStudyPlan(azure_ad_oid)}
        >
          <div className="absolute bg-white w-64 rounded-lg h-44 p-3 m-2 shadow-md flex items-center justify-center">
            <p>Create a new study plan</p>
          </div>
          <div className="bg-black text-white opacity-0 rounded-lg w-64 h-44 p-3 m-2 shadow-md items-center justify-center flex group-hover:opacity-80 transition">
            <p>Create blank</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalStudyPlanList;
