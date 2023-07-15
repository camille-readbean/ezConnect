import html2canvas from "html2canvas";
import { Menu } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

const addSemester = (studyPlanId, setIsFetchAgain) => {
  fetch(
    `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/semester/${studyPlanId}`,
    {
      method: "POST",
    }
  ).then(() => {
    setIsFetchAgain((previous) => !previous);
  });
};

const deleteLastSemester = (semesterInformation, setIsFetchAgain) => {
  if (semesterInformation.length === 0) {
    return;
  }

  const lastSemesterId =
    semesterInformation[semesterInformation.length - 1]["id"];
  fetch(
    `${process.env.REACT_APP_API_ENDPOINT}/api/study_plan_semester/${lastSemesterId}`,
    {
      method: "DELETE",
    }
  ).then(() => {
    setIsFetchAgain((previous) => !previous);
  });
};

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

function EditorOptions({
  title,
  studyPlanId,
  setIsFetchAgain,
  setIsShowPublisher,
  setIsShowValidator,
  semesterInformation,
}) {
  return (
    <Menu as="div" className="relative z-10">
      <Menu.Button className="flex items-center justify-center py-1 rounded-md hover:bg-slate-200 transition h-8 w-8">
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
                onClick={() => addSemester(studyPlanId, setIsFetchAgain)}
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
                onClick={() =>
                  deleteLastSemester(semesterInformation, setIsFetchAgain)
                }
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
                Publish
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
        </div>
      </Menu.Items>
    </Menu>
  );
}

export default EditorOptions;
