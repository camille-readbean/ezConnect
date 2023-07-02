import { AiFillHeart } from "react-icons/ai";
import { IconContext } from "react-icons";

function makeCard(studyPlan) {
  const title = studyPlan["title"];
  const numOfLikes = studyPlan["num_of_likes"];
  const dateUpdated = studyPlan["date_updated"];

  return (
    <div className="w-72 bg-white px-3 py-4 shadow-md rounded-md">
      <img
        src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
        alt="study-plan-img"
        className="w-full rounded-lg shadow-sm mb-2"
      />
      <div className="flex items-center">
        <p className="font-semibold mr-2 flex-grow">{title}</p>
        <IconContext.Provider value={{ color: "pink" }}>
          <AiFillHeart className="mr-1 h-6 w-8" />
          <p className="font-medium">{numOfLikes}</p>
        </IconContext.Provider>
      </div>
      <p className="text-sm italic">Last updated: {dateUpdated}</p>
    </div>
  );
}

export default function StudyPlanList({ studyPlans }) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg">
      {studyPlans.map((studyPlan) => makeCard(studyPlan))}
    </div>
  );
}
