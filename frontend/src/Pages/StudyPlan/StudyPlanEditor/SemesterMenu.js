import { Menu } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

/**
 * A component that provides a context menu for interacting with a study plan semester.
 * It allows users to clear the semester's courses or export the semester to NUSMods.
 *
 * @component
 * @prop {Function} setIsShowExportSemester - Function to set visibility of export modal.
 * @prop {Function} setExportSemesterInfo - Function to set information of the semester to export.
 * @prop {Object} semesterInfo - Information about the semester.
 * @prop {Function} updateCoursesInSemester - Function to update courses in a semester.
 * @returns {JSX.Element} The semester menu component.
 */
export default function SemesterMenu({
  setIsShowExportSemester,
  setExportSemesterInfo,
  semesterInfo,
  updateCoursesInSemester,
}) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center justify-center py-1 rounded-md hover:bg-slate-200 transition h-8 w-8">
        <BsThreeDotsVertical />
      </Menu.Button>
      <Menu.Items className="absolute right-0 z-10 bg-white rounded-md shadow-md min-w-max">
        <div className="p-1">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? "bg-sky-500 text-white" : "text-gray-900"
                } rounded-md px-2 py-1 w-full`}
                onClick={() => updateCoursesInSemester([], semesterInfo)}
              >
                Clear semester
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
                onClick={() => {
                  setExportSemesterInfo(semesterInfo);
                  setIsShowExportSemester(true);
                }}
              >
                Export semester <br /> to NUSMods
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
