import { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { IconContext } from "react-icons";
import PopUpPost from "../StudyPlanPost.js/PopUpPost";
import Tags from "../StudyPlanPost.js/Tags";

function makeCard(
  studyPlan,
  setIsOpenPopUp,
  setStudyPlanInformation,
  azure_ad_oid
) {
  const title = studyPlan["title"];
  const numOfLikes = studyPlan["num_of_likes"];
  const dateUpdated = studyPlan["date_updated"];
  const academicPlanInformation = studyPlan["academic_plan"];

  return (
    <div
      className="w-72 bg-white px-3 py-4 shadow-md rounded-md hover:cursor-pointer"
      onClick={() => {
        setStudyPlanInformation(studyPlan);
        setIsOpenPopUp(true);

        const requestBody = {
          user_id: azure_ad_oid,
          published_study_plan_id: studyPlan["id"],
        };

        fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      }}
    >
      <div className="flex items-center">
        <p className="font-semibold mr-2 flex-grow">{title}</p>
        <IconContext.Provider value={{ color: "PaleVioletRed" }}>
          <AiFillHeart className="mr-1 h-5 w-fit flex-shrink-0" />
          <p className="font-medium">{numOfLikes}</p>
        </IconContext.Provider>
      </div>
      <p className="text-sm italic">Last updated: {dateUpdated}</p>

      {academicPlanInformation != null && (
        <>
          <p className="text-sm font-semibold py-1">Tags:</p>
          <Tags academicPlanInformation={academicPlanInformation} />
        </>
      )}
    </div>
  );
}

function filterStudyPlan(studyPlan, searchValue) {
  const title = studyPlan["title"].toLowerCase();
  return title.includes(searchValue.toLowerCase());
}

export default function StudyPlanList({
  studyPlans,
  azure_ad_oid,
  setIsFetchAgain,
  searchValue,
}) {
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  const [studyPlanInformation, setStudyPlanInformation] = useState({});

  return (
    <>
      {isOpenPopUp && (
        <PopUpPost
          studyPlanInformation={studyPlanInformation}
          setIsOpenPopUp={setIsOpenPopUp}
          azure_ad_oid={azure_ad_oid}
          setIsFetchAgain={setIsFetchAgain}
        />
      )}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg min-h-[256px]">
        {studyPlans
          .filter((studyPlan) => filterStudyPlan(studyPlan, searchValue))
          .map((studyPlan) =>
            makeCard(
              studyPlan,
              setIsOpenPopUp,
              setStudyPlanInformation,
              azure_ad_oid
            )
          )}
      </div>
    </>
  );
}
