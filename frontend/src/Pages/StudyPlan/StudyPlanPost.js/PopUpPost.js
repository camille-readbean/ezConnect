import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import Tooltip from "@mui/material/Tooltip";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { IconContext } from "react-icons";
import Tags from "./Tags";
import Preview from "./Preview";

/**
 * A component that displays published study plan information as a pop up post.
 *
 * @component
 * @prop {Object} studyPlanInformation - An object which 
 * contains the study plan information.
 * @prop {Function} setIsOpenPopUp - Function to set state of 
 * whether the pop up post is open or not.
 * @prop {String} azure_ad_oid - The user id of the active user.
 * @prop {Function} setIsFetchAgain - Function to call to change 
 * state to trigger re-rendering of another component.
 */
function PopUpPost({
  studyPlanInformation,
  setIsOpenPopUp,
  azure_ad_oid,
  setIsFetchAgain,
}) {
  const title = studyPlanInformation["title"];
  const description = studyPlanInformation["description"];
  const creatorName = studyPlanInformation["creator_name"];
  const [numOfLikes, setNumOfLikes] = useState(
    studyPlanInformation["num_of_likes"]
  );
  const dateUpdated = studyPlanInformation["date_updated"];
  const [isFavouritedBy, setIsFavouritedBy] = useState(
    studyPlanInformation["is_favourited_by"]
  );
  const [isLikedBy, setIsLikedBy] = useState(
    studyPlanInformation["is_liked_by"]
  );
  const academicPlanInformation = studyPlanInformation["academic_plan"];
  const navigate = useNavigate();

  /** Function to create a copy of a published study plan */
  const makeACopy = () => {
    const requestBody = {
      published_study_plan_id: studyPlanInformation["id"],
      user_id: azure_ad_oid,
    };

    fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish/copy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((data) => {
        const newStudyPlanId = data["id"];
        // redirect to editor after making a copy
        navigate(`/studyplan/editor/${newStudyPlanId}`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /** Function to favourite a study plan */
  const favouriteStudyPlan = () => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/favourite/${azure_ad_oid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published_study_plan_id: studyPlanInformation["id"],
        }),
      }
    )
      .then(() => {
        // re-render page to change colour of the star icon
        setIsFavouritedBy(true);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /** Function to unfavourite a study plan */
  const unfavouriteStudyPlan = () => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/favourite/${azure_ad_oid}?published_study_plan_id=${studyPlanInformation["id"]}`,
      { method: "DELETE" }
    )
      .then(() => {
        // re-render page to change colour of the star icon
        setIsFavouritedBy(false);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /** Function to like a study plan */
  const likeStudyPlan = () => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/like/${azure_ad_oid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published_study_plan_id: studyPlanInformation["id"],
        }),
      }
    )
      .then(() => {
        // re-render page to change colour of the heart icon and number of likes
        setIsLikedBy(true);
        setNumOfLikes((previous) => previous + 1);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  /** Function to unlike a study plan */
  const unlikeStudyPlan = () => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/like/${azure_ad_oid}?published_study_plan_id=${studyPlanInformation["id"]}`,
      { method: "DELETE" }
    )
      .then(() => {
        // re-render page to change colour of the heart icon and number of likes
        setIsLikedBy(false);
        setNumOfLikes((previous) => previous - 1);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="fixed inset-0 z-10 p-3 pt-14 flex items-center justify-center bg-gray-500 bg-opacity-75 max-h-screen">
      <div className="relative p-5 bg-white rounded-md shadow-md min-w-min w-full sm:max-w-3xl max-h-full overflow-y-scroll">
        <RxCross2
          className="absolute right-2 top-2 hover:cursor-pointer"
          onClick={() => setIsOpenPopUp(false)}
        />

        <div className="flex gap-5 mb-3 flex-col">
          <div id="studyPlanInformation" className="flex-grow">
            <h1 className="text-xl font-semibold">{title}</h1>

            {academicPlanInformation != null && (
              <Tags academicPlanInformation={academicPlanInformation} />
            )}

            <div className="flex justify-between items-center">
              <p>Created by: {creatorName}</p>

              <Tooltip title={isLikedBy ? "Unlike" : "Like"} arrow>
                <div
                  className="flex items-center p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                  onClick={
                    isLikedBy ? unlikeStudyPlan : likeStudyPlan
                  }
                >
                  <IconContext.Provider value={{ color: "PaleVioletRed" }}>
                    {isLikedBy ? (
                      <AiFillHeart className="mr-1 h-5 w-fit" />
                    ) : (
                      <AiOutlineHeart className="mr-1 h-5 w-fit" />
                    )}
                  </IconContext.Provider>
                  <p className="font-medium">{numOfLikes}</p>
                </div>
              </Tooltip>
            </div>

            <p className="text-sm italic">Last updated: {dateUpdated}</p>

            <div id="postButtons" className="flex items-center gap-1 my-3">
              <button
                className="flex-grow bg-sky-500 hover:bg-sky-600 text-white font-semibold px-2 py-1 rounded-md transition"
                onClick={makeACopy}
              >
                Make a copy
              </button>

              <Tooltip
                title={isFavouritedBy ? "Unfavourite" : "Favourite"}
                arrow
              >
                <div>
                  <IconContext.Provider value={{ color: "gold" }}>
                    {isFavouritedBy ? (
                      <AiFillStar
                        className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                        onClick={unfavouriteStudyPlan}
                      />
                    ) : (
                      <AiOutlineStar
                        className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                        onClick={favouriteStudyPlan}
                      />
                    )}
                  </IconContext.Provider>
                </div>
              </Tooltip>
            </div>

            <h6 className="font-semibold">Description</h6>
            <p className="bg-slate-50 rounded-md p-2">{description}</p>
          </div>

          <Preview
            semesterInformationArray={
              studyPlanInformation["semester_info_list"]
            }
          />
        </div>
      </div>
    </div>
  );
}

export default PopUpPost;
