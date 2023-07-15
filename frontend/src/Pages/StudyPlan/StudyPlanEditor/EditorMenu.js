import html2canvas from "html2canvas";
import { Menu } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

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
  setSemesterInformation,
  setIsModified,
  setIsShowPublisher,
  semesterInformation,
  setLastInteractedSemesterIndex,
}) {
  const addSemester = () => {
    const newSemesterInfo = {
      course_codes: [],
      id: null,
      semester_number: semesterInformation.length,
      total_units: 0,
    };
    const newSemesterInfoArray = [...semesterInformation, newSemesterInfo];
    setSemesterInformation(newSemesterInfoArray);
    setIsModified(true);
  };

  const deleteLastSemester = () => {
    if (semesterInformation.length === 0) {
      return;
    }
    const newSemesterInfoArray = semesterInformation.slice(0, -1);
    setLastInteractedSemesterIndex(newSemesterInfoArray.length - 1);
    setSemesterInformation(newSemesterInfoArray);
    setIsModified(true);
  };

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
                Publish
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}

export default EditorOptions;
