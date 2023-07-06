import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { IconContext } from "react-icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu } from "@headlessui/react";

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
  const navigate = useNavigate();

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
        setIsFavouritedBy(true);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const unfavouriteStudyPlan = () => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/favourite/${azure_ad_oid}?published_study_plan_id=${studyPlanInformation["id"]}`,
      { method: "DELETE" }
    )
      .then(() => {
        setIsFavouritedBy(false);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

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
        setIsLikedBy(true);
        setNumOfLikes((previous) => previous + 1);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const unlikeStudyPlan = () => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/like/${azure_ad_oid}?published_study_plan_id=${studyPlanInformation["id"]}`,
      { method: "DELETE" }
    )
      .then(() => {
        setIsLikedBy(false);
        setNumOfLikes((previous) => previous - 1);
        setIsFetchAgain((previous) => !previous);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // TODO: Add functionality for learn more
  const learnMore = () => {
    console.log("trying to learn more");
  };

  return (
    <div className="fixed inset-0 z-10 p-3 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="relative p-5 bg-white rounded-md shadow-md min-w-min w-full sm:max-w-3xl">
        <RxCross2
          className="absolute right-2 top-2 hover:cursor-pointer"
          onClick={() => setIsOpenPopUp(false)}
        />

        <div className="flex gap-5 mb-3 flex-col sm:flex-row">
          <img
            src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
            alt="study-plan-img"
            className="w-full sm:w-2/5 h-fit rounded-lg shadow-sm mb-2"
          />

          <div id="studyPlanInformation" className="flex-grow">
            <h1 className="text-lg font-semibold">{title}</h1>

            <div className="flex justify-between items-center">
              <p>Created by: {creatorName}</p>

              {isLikedBy ? (
                <div
                  className="flex items-center p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                  onClick={unlikeStudyPlan}
                >
                  <IconContext.Provider value={{ color: "PaleVioletRed" }}>
                    <AiFillHeart className="mr-1 h-5 w-fit" />
                  </IconContext.Provider>
                  <p className="font-medium">{numOfLikes}</p>
                </div>
              ) : (
                <div
                  className="flex items-center p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                  onClick={likeStudyPlan}
                >
                  <IconContext.Provider value={{ color: "PaleVioletRed" }}>
                    <AiOutlineHeart className="mr-1 h-5 w-fit" />
                  </IconContext.Provider>
                  <p className="font-medium">{numOfLikes}</p>
                </div>
              )}
            </div>

            <p className="text-sm italic">Last updated: {dateUpdated}</p>

            <div id="postButtons" className="flex items-center gap-1 my-3">
              <button
                className="flex-grow bg-sky-500 hover:bg-sky-600 text-white font-semibold px-2 py-1 rounded-md transition"
                onClick={makeACopy}
              >
                Make a copy
              </button>

              {isFavouritedBy ? (
                <IconContext.Provider value={{ color: "gold" }}>
                  <AiFillStar
                    className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                    onClick={unfavouriteStudyPlan}
                  />
                </IconContext.Provider>
              ) : (
                <AiOutlineStar
                  className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition"
                  onClick={favouriteStudyPlan}
                />
              )}

              {/* <BsThreeDotsVertical className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition" /> */}
              <Menu as="div" className="relative">
                <Menu.Button className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition">
                  <BsThreeDotsVertical />
                </Menu.Button>
                <Menu.Items className="absolute right-0 bg-slate-50 mt-1 rounded-md shadow-sm min-w-max">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-sky-500 text-white" : "text-gray-900"
                        } transition rounded-md px-2 py-1`}
                        onClick={() => console.log("download")}
                      >
                        Download
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>

            <h6 className="font-medium">Description</h6>
            <p className="bg-slate-50 rounded-md p-2">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white font-semibold px-3 py-1 rounded-md transition"
            onClick={learnMore}
          >
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopUpPost;
