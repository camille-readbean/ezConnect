import html2canvas from "html2canvas";
import { Menu } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteComfirmationBox from "../StudyPlanMainPage/DeleteComfirmationBox";

/**
 * Downloads the study plan as an image.
 *
 * @param {String} title - The title of the study plan.
 */
const downloadStudyPlan = (title) => {
  const studyPlan = document.getElementById("studyPlan");
  html2canvas(studyPlan).then((canvas) => {
    const image = canvas.toDataURL("image/png");
    var anchor = document.createElement("a");
    anchor.setAttribute("href", image);
    anchor.setAttribute("download", `${title.replace(/ /g, "_")}.png`);
    anchor.click();
    anchor.remove();
  });
};

/**
 * A component for displaying options for editing a study plan.
 *
 * @component
 * @prop {String} title - The title of the study plan.
 * @prop {String} studyPlanId - The ID of the study plan.
 * @prop {Function} setSemesterInformation - Function to update semester information.
 * @prop {Function} setIsModified - Function to set the modification status of the study plan.
 * @prop {Boolean} isPublished - Indicates whether the study plan is published.
 * @prop {Function} setIsShowPublisher - Function to control the visibility of the publisher dialog.
 * @prop {Boolean} isShowValidator - Indicates whether the validator is shown.
 * @prop {Function} setIsShowValidator - Function to control the visibility of the validator.
 * @prop {Array} semesterInformation - Information about the semesters.
 * @prop {Function} setLastInteractedSemesterIndex - Function to set the index of the last interacted semester.
 * @returns {JSX.Element} The editor options component.
 */
export default function EditorOptions({
  title,
  studyPlanId,
  setSemesterInformation,
  setIsModified,
  isPublished,
  setIsShowPublisher,
  isShowValidator,
  setIsShowValidator,
  semesterInformation,
  setLastInteractedSemesterIndex,
}) {
  const navigate = useNavigate();
  const [isDeleteComfirmationBoxOpen, setIsDeleteComfirmationBoxOpen] =
    useState(false);

  /** Adds a new semester to the study plan. */
  const addSemester = () => {
    const semesterNumber = semesterInformation.length + 1;
    const newSemesterInfo = {
      course_codes: [],
      id: null,
      semester_number: semesterNumber,
      total_units: 0,
    };
    const newSemesterInfoArray = [...semesterInformation, newSemesterInfo];
    setSemesterInformation(newSemesterInfoArray);
    setLastInteractedSemesterIndex(semesterNumber - 1);
    setIsModified(true);
  };

  /** Deletes the last semester from the study plan. */
  const deleteLastSemester = () => {
    // check if there are any semesters to delete
    if (semesterInformation.length === 0) {
      return;
    }
    const newSemesterInfoArray = semesterInformation.slice(0, -1);
    setLastInteractedSemesterIndex(newSemesterInfoArray.length - 1);
    setSemesterInformation(newSemesterInfoArray);
    setIsModified(true);
  };

  /**
   * Deletes the study plan.
   *
   * @param {String} studyPlanId - The ID of the study plan.
   */
  const deleteStudyPlan = (studyPlanId) => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`,
      {
        method: "DELETE",
      }
    ).then(() => navigate("/studyplan"));
  };

  return (
    <>
      <DeleteComfirmationBox
        studyPlanId={studyPlanId}
        deleteStudyPlan={deleteStudyPlan}
        isDeleteComfirmationBoxOpen={isDeleteComfirmationBoxOpen}
        setIsDeleteComfirmationBoxOpen={setIsDeleteComfirmationBoxOpen}
      />
      <Menu as="div" className="relative z-10">
        <Menu.Button className="flex items-center justify-center py-1 rounded-md bg-sky-200 hover:bg-sky-300 transition h-8 w-8">
          <BsThreeDotsVertical />
        </Menu.Button>
        <Menu.Items className="absolute right-0 bg-white rounded-md shadow-md">
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } rounded-md px-2 py-1 w-full`}
                  onClick={() => addSemester()}
                >
                  Add semester
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } rounded-md px-2 py-1 w-full whitespace-nowrap`}
                  onClick={() => deleteLastSemester()}
                >
                  Delete last semester
                </button>
              )}
            </Menu.Item>
            <hr className="my-1" />
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } rounded-md px-2 py-1 w-full`}
                  onClick={() => downloadStudyPlan(title)}
                >
                  Download
                </button>
              )}
            </Menu.Item>
            <hr className="my-1" />
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } rounded-md px-2 py-1 w-full`}
                  onClick={() => setIsShowPublisher(true)}
                >
                  {isPublished ? <>Update/unpublish</> : <>Publish</>}
                </button>
              )}
            </Menu.Item>
            <hr className="my-1" />
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } rounded-md px-2 py-1 w-full`}
                  onClick={() => setIsShowValidator(true)}
                >
                  Validate Prerequisites
                </button>
              )}
            </Menu.Item>
            <hr className="my-1" />
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } rounded-md px-2 py-1 w-full`}
                  onClick={() => setIsDeleteComfirmationBoxOpen(true)}
                >
                  Delete study plan
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </>
  );
}
