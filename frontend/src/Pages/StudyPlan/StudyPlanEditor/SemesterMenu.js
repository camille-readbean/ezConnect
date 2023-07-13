import { Menu } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

function clearSemester(semesterInfo, updateSemester) {
  semesterInfo["course_codes"] = [];
  updateSemester(semesterInfo);
}

export default function SemesterMenu({
  setIsShowExportSemester,
  setExportSemesterInfo,
  semesterInfo,
  updateSemester,
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
                onClick={() => clearSemester(semesterInfo, updateSemester)}
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
                Export semester
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
