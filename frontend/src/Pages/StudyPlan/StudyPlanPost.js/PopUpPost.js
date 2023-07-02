import { RxCross2 } from "react-icons/rx";
import { AiFillHeart, AiFillStar } from "react-icons/ai";
import { IconContext } from "react-icons";
import { BsThreeDotsVertical } from "react-icons/bs";

function PopUpPost({ studyPlanInformation, setIsOpenPopUp }) {
  const title = studyPlanInformation["title"];
  const description = studyPlanInformation["description"];
  const creatorName = studyPlanInformation["creator_name"];
  const numOfLikes = studyPlanInformation["num_of_likes"];
  const dateUpdated = studyPlanInformation["date_updated"];

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

          <div id="studyPlanInformation">
            <h1 className="text-lg font-semibold">{title}</h1>

            <div className="flex justify-between">
              <p>Created by: {creatorName}</p>
              <div className="flex items-center">
                <IconContext.Provider value={{ color: "pink" }}>
                  <AiFillHeart className="mr-1 h-5 w-fit" />
                </IconContext.Provider>
                <p className="font-medium">{numOfLikes}</p>
              </div>
            </div>

            <p className="text-sm italic">Last updated: {dateUpdated}</p>

            <div id="postButtons" className="flex items-center gap-1 my-3">
              <button className="flex-grow bg-sky-500 hover:bg-sky-600 text-white font-semibold px-2 py-1 rounded-md transition">
                Make a copy
              </button>
              <AiFillStar className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition" />
              <BsThreeDotsVertical className="h-8 w-auto p-1 rounded-md hover:bg-slate-200 hover:cursor-pointer transition" />
            </div>

            <h6 className="font-medium">Description</h6>
            <p className="bg-slate-50 rounded-md p-2">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button className="border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white font-semibold px-3 py-1 rounded-md transition">
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}

export default PopUpPost;
