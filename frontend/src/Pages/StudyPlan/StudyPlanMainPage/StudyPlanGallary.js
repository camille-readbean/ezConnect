import { useState } from "react";
import StudyPlanList from "./StudyPlanList";
import StudyPlanSearchBar from "./StudyPlanSearchBar";

function StudyPlanGallery() {
  const [studyPlans, setStudyPlans] = useState([]);

  return (
    <div className="bg-slate-50 px-20 py-10">
      <h1 className="text-2xl font-semibold pb-3">Browse Study Plans</h1>

      <StudyPlanSearchBar />

      {studyPlans.length > 0 ? (
        <StudyPlanList studyPlans={studyPlans} />
      ) : (
        <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full">
          <p>There are currently no study plans published yet...</p>
        </div>
      )}
    </div>
  );
}

export default StudyPlanGallery;
