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

function EditorOptions({ title, studyPlanId, setIsFetchAgain }) {
  return (
    <Menu as="div" className="relative z-10">
      <Menu.Button className="flex items-center justify-center py-1 rounded-md hover:bg-sky-500 hover:text-white h-8 w-8">
        <BsThreeDotsVertical />
      </Menu.Button>
      <Menu.Items className="absolute right-0 bg-white rounded-md shadow-md min-w-max">
        <div className="p-1">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? "bg-sky-500 text-white" : "text-gray-900"
                } rounded-md px-2 py-1 w-full`}
                onClick={() => addSemester(studyPlanId, setIsFetchAgain)}
              >
                Add Semester
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
        </div>
      </Menu.Items>
    </Menu>
  );
}

export default EditorOptions;
