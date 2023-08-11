import { useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { IconContext } from "react-icons";
import PopUpPost from "../StudyPlanPost.js/PopUpPost";
import Tags from "../StudyPlanPost.js/Tags";

/**
 * A function to generate a card component for displaying study plan information.
 *
 * @param {Object} studyPlan - The study plan data.
 * @param {Function} setIsOpenPopUp - The function to control the visibility of the pop-up.
 * @param {Function} setStudyPlanInformation - The function to set the study plan information in the pop-up.
 * @param {String} azure_ad_oid - The ID of the user.
 * @returns {JSX.Element} The card component displaying study plan information.
 */
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
      className="w-72 min-w-[288px] min-h-[220px] bg-white px-3 py-4 shadow-md rounded-md hover:cursor-pointer"
      onClick={() => {
        // set pop-up information and open pop-up
        setStudyPlanInformation(studyPlan);
        setIsOpenPopUp(true);

        // record view in database
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

/**
 * Function to use to filter study plans based on search value.
 * Checks if search value is in the study plan title.
 *
 * @param {Object} studyPlan - The study plan data.
 * @param {String} searchValue - The search value to filter study plans.
 * @returns {Boolean} True if the study plan title contains the search value, false otherwise.
 */
function filterStudyPlan(studyPlan, searchValue) {
  const title = studyPlan["title"].toLowerCase();
  return title.includes(searchValue.toLowerCase());
}

/**
 * A component that displays a list of study plans.
 *
 * @param {Object[]} studyPlans - Array of study plan objects which contains information of the study plans
 * @param {String} azure_ad_oid - The ID of the user.
 * @param {String} searchValue - The search value to filter study plans.
 * @param {Function} setIsFetchAgain - The function to trigger fetching study plans.
 * @returns {JSX.Element} The study plan list component.
 */
export default function StudyPlanList({
  studyPlans,
  azure_ad_oid,
  searchValue,
  setIsFetchAgain,
}) {
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  // studyPlanInformation is the information of a study plan which is used for the pop up post
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
    </>
  );
}
