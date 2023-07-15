import { useState } from "react";
import Select from "react-select";
import courseDictionary from "../../../courseDictionary.json";

/**
 * Creates a list of course codes from NUSMods timetable sharing link.
 *
 * @param {string} shareLink The link when sharing timetable from NUSMods.
 * @return {Array} An array containing course codes.
 */
function getCourseListFromNUSMod(shareLink) {
  const pattern = /(?![?&])([A-Z]+[0-9]+[A-Z]*)(?=\=)/g;
  const courseList = shareLink.match(pattern);
  if (courseList === []) {
    throw new TypeError("Invalid link inputted");
  }

  // Check if course codes in list are valid
  // Filter out invalid courses
  return courseList.filter((courseCode) => courseCode in courseDictionary);
}

export default function ImportCourses({
  semesterInformation,
  updateCoursesInSemester,
}) {
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedSemester, setSelectedSemester] = useState({});

  const updateCourseList = (event) => {
    event.preventDefault();
    try {
      const courseList = getCourseListFromNUSMod(event.target.shareLink.value);
      updateCoursesInSemester(courseList, selectedSemester);
      setResponseMessage("Succesfully imported courses!");
    } catch (TypeError) {
      setResponseMessage("Please input a valid NUSMods sharing link");
    }
  };

  return (
    <div id="importCourses" className="px-5 py-2">
      <form onSubmit={updateCourseList} className="flex gap-2 items-center">
        <input
          type="text"
          name="shareLink"
          placeholder="NUSMods Timetable Share Link"
          required
          className="flex-grow px-2 py-1 border-[1px] border-slate-300 rounded-md focus:outline-blue-500"
        />
        <Select
          options={semesterInformation}
          getOptionLabel={(option) =>
            `Y${Math.ceil(option.semester_number / 2)}S${
              ((option.semester_number + 1) % 2) + 1
            }`
          }
          getOptionValue={(option) => option.id}
          required
          menuPlacement="auto"
          name="semesterChoice"
          onChange={setSelectedSemester}
        />
        <button
          type="submit"
          className="bg-sky-200 rounded-md px-2 py-1 hover:bg-sky-300 transition"
        >
          Import
        </button>
      </form>
      <p className="text-gray-700">
        Note that importing courses will replace all existing courses in the
        selected semester.
      </p>
      <p className="text-sm text-gray-500">{responseMessage}</p>
    </div>
  );
}
