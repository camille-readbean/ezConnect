import { AiFillHeart } from "react-icons/ai";
import { IconContext } from "react-icons";

function makeCard(id) {
  const title = "Computer Science with focus area in Software Engineering";
  const num_of_likes = 10;
  const last_updated = "10 Jun 2023";

  return (
    <div className="w-72 bg-white px-3 py-2 shadow-md overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
        alt="study-plan-img"
        className="w-64 rounded-lg shadow-md my-1"
      />
      <div className="flex gap-2 items-center justify-between my-2 font-semibold">
        <p>{title}</p>
        <div className="flex items-center">
          <IconContext.Provider value={{ color: "pink" }}>
            <AiFillHeart />
          </IconContext.Provider>
          <p>{num_of_likes}</p>
        </div>
      </div>
      <p className="text-sm italic">Last updated: {last_updated}</p>
    </div>
  );
}

export default function StudyPlanList({ studyPlans }) {
  return (
    <div className="container m-auto flex flex-wrap gap-3 whitespace-normal bg-white px-2 py-5 rounded-lg justify-center">
      {studyPlans.map((studyPlan) => makeCard(studyPlan))}
    </div>
  );
}
