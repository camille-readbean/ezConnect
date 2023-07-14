import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import Unauthenticated from "../../../Components/Unauthenticated";
import PopUpPost from "../StudyPlanPost.js/PopUpPost";
import Tags from "../StudyPlanPost.js/Tags";
import { useState, useEffect } from "react";
import { AiFillHeart } from "react-icons/ai";
import { IconContext } from "react-icons";

function FavouritedStudyPlanPage() {
  // obtain user_id of current user
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  let azure_ad_oid = "";
  if (activeAccount != null) {
    azure_ad_oid = activeAccount.idTokenClaims["oid"];
  }

  const [studyPlans, setStudyPlans] = useState([]);
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  const [studyPlanInformation, setStudyPlanInformation] = useState({});
  const [isFetchAgain, setIsFetchAgain] = useState(false);

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/favourite/${azure_ad_oid}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudyPlans(data["favourited_study_plans"]);
      })
      .catch((err) => console.error(err));
  }, [azure_ad_oid, isFetchAgain]);

  const makeCard = (studyPlan) => {
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
  };

  return (
    <>
      <AuthenticatedTemplate>
        <div className="container m-auto px-10">
          <h1 className="text-2xl font-semibold py-3">
            Favourited Study Plans
          </h1>

          {isOpenPopUp && (
            <PopUpPost
              studyPlanInformation={studyPlanInformation}
              setIsOpenPopUp={setIsOpenPopUp}
              azure_ad_oid={azure_ad_oid}
              setIsFetchAgain={setIsFetchAgain}
            />
          )}

          <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-lg mb-5">
            {studyPlans.length > 0 ? (
              studyPlans.map((studyPlan) => makeCard(studyPlan))
            ) : (
              <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full">
                <p>You have no favourited study plans</p>
              </div>
            )}
          </div>
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}

export default FavouritedStudyPlanPage;
