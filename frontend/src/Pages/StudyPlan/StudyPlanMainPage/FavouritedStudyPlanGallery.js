import { useState, useEffect } from "react";
import StudyPlanList from "./StudyPlanList";

export default function FavouritedStudyPlanGallery({
  azure_ad_oid,
  isFetchAgain,
  setIsFetchAgain,
}) {
  const [favouritedStudyPlans, setFavouritedStudyPlans] = useState([]);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/favourite/${azure_ad_oid}`
    )
      .then((res) => res.json())
      .then((data) => {
        setFavouritedStudyPlans(data["favourited_study_plans"]);
      })
      .catch((err) => console.error(err));
  }, [azure_ad_oid, isFetchAgain]);

  return (
    <>
      <div className="bg-slate-50 px-10 sm:px-20 py-5">
        <h1 className="text-2xl font-semibold py-3">Favourited Study Plans</h1>

        <div className="flex gap-3 p-4 bg-white rounded-lg overflow-x-auto">
          {favouritedStudyPlans.length > 0 ? (
            <StudyPlanList
              studyPlans={favouritedStudyPlans}
              azure_ad_oid={azure_ad_oid}
              searchValue=""
              setIsFetchAgain={setIsFetchAgain}
            />
          ) : (
            <div className="flex items-center justify-center h-44 w-full">
              <p>You have no favourited study plans</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
