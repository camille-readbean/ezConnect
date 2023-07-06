import { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { IconContext } from "react-icons";
import PopUpPost from "../StudyPlanPost.js/PopUpPost";

function makeCard(studyPlan, setIsOpenPopUp, setStudyPlanInformation) {
  const title = studyPlan["title"];
  const numOfLikes = studyPlan["num_of_likes"];
  const dateUpdated = studyPlan["date_updated"];

  return (
    <div
      className="w-72 bg-white px-3 py-4 shadow-md rounded-md hover:cursor-pointer"
      onClick={() => {
        setStudyPlanInformation(studyPlan);
        setIsOpenPopUp(true);
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
        alt="study-plan-img"
        className="w-full rounded-lg shadow-sm mb-2"
      />
      <div className="flex items-center">
        <p className="font-semibold mr-2 flex-grow">{title}</p>
        <IconContext.Provider value={{ color: "PaleVioletRed" }}>
          <AiFillHeart className="mr-1 h-5 w-fit flex-shrink-0" />
          <p className="font-medium">{numOfLikes}</p>
        </IconContext.Provider>
      </div>
      <p className="text-sm italic">Last updated: {dateUpdated}</p>
    </div>
  );
}

export default function StudyPlanList({
  studyPlans,
  azure_ad_oid,
  setIsFetchAgain,
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
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg">
        {studyPlans.map((studyPlan) =>
          makeCard(studyPlan, setIsOpenPopUp, setStudyPlanInformation)
        )}
      </div>
    </>
  );
}
