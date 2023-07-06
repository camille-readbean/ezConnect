import { useState, useEffect } from "react";
import StudyPlanList from "./StudyPlanList";
import StudyPlanSearchBar from "./StudyPlanSearchBar";

function StudyPlanGallery({ azure_ad_oid }) {
  const [studyPlans, setStudyPlans] = useState([]);
  const [isFetchAgain, setIsFetchAgain] = useState(false);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish?user_id=${azure_ad_oid}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudyPlans(data["published_study_plans"]);
      });
  }, [isFetchAgain]);

  return (
    <div className="bg-slate-50 px-20 py-10">
      <h1 className="text-2xl font-semibold pb-3">Browse Study Plans</h1>

      <div className="container m-auto">
        <StudyPlanSearchBar />

        {studyPlans.length > 0 ? (
          <StudyPlanList
            studyPlans={studyPlans}
            azure_ad_oid={azure_ad_oid}
            setIsFetchAgain={setIsFetchAgain}
          />
        ) : (
          <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full">
            <p>There are currently no study plans published yet...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyPlanGallery;
