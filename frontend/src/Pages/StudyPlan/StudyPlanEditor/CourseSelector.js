import Select from "react-select";
import courseOptions from "../../../courses.json";
import { useState } from "react";

/**
 * Function to filter course options based on input value.
 *
 * @param {String} inputValue - The input value for filtering.
 * @returns {Object[]} Filtered course options limited to at most 10 options.
 */
const filterCourseOptions = (inputValue) => {
  return courseOptions.filter(
    function (course) {
      // keep number of courses to 10
      if (this.count >= 10) {
        return false;
      }

      const courseCode = course["course_code"].toLowerCase();
      const courseName = course["course_name"].toLowerCase();
      // check if course code starts with input
      // use startsWith as some course codes are substrings of other course codes
      const isInCourseCode = () =>
        courseCode.startsWith(inputValue.toLowerCase());
      // check if course name includes input
      const isInCourseName = () =>
        courseName.includes(inputValue.toLowerCase());

      if (isInCourseCode() || isInCourseName()) {
        this.count++;
        return true;
      }
      return false;
    },
    { count: 0 }
  );
};

/**
 * A component to select a course to add to the study plan.
 *
 * @component
 * @prop {Object[]} semesterInformation - Array which each element contains information on a study plan semester.
 * @prop {Function} updateCoursesInSemester - Function to update courses in a semester.
 * @prop {Number} lastInteractedSemesterIndex - Index of the last interacted semester.
 * @returns {JSX.Element} Course selector component.
 */
export default function CourseSelector({
  semesterInformation,
  updateCoursesInSemester,
  lastInteractedSemesterIndex,
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");

  /**
   * Function to load options based on input value.
   *
   * @param {string} inputValue - The input value for filtering.
   * @param {Function} callback - Callback function after loading options.
   */
  const loadOptions = (inputValue, callback) => {
    const filteredOptions = filterCourseOptions(inputValue);
    setSearchResults(filteredOptions);
    callback(filteredOptions);
  };

  /**
   * Function to add a course to a semester.
   *
   * @param {Object} course - The course object to be added.
   */
  const addCourse = (course) => {
    // check validity of inputs
    if (course === null) {
      setResponseMessage("");
      return;
    } else if (semesterInformation === null) {
      setResponseMessage("No semester information");
      return;
    } else if (semesterInformation.length === 0) {
      setResponseMessage(
        "There are no semesters in the study plan to add the course to"
      );
      return;
    } else if (
      lastInteractedSemesterIndex < 0 ||
      lastInteractedSemesterIndex >= semesterInformation.length
    ) {
      lastInteractedSemesterIndex = 0;
    }

    const newCourseCode = course["course_code"];
    const semester = semesterInformation[lastInteractedSemesterIndex];
    const newCourseCodeList = semester["course_codes"];

    // check for duplicates in semester
    if (newCourseCodeList.includes(newCourseCode)) {
      const semesterNumber = lastInteractedSemesterIndex + 1;
      setResponseMessage(
        `Semester Y${Math.ceil(semesterNumber / 2)}S${
          ((semesterNumber + 1) % 2) + 1
        } contains ${newCourseCode} already`
      );
      return;
    }

    // add course to semester
    newCourseCodeList.push(newCourseCode);
    updateCoursesInSemester(newCourseCodeList, semester);
    setResponseMessage("Course successfully added!");
  };

  return (
    <div className="mx-2 mb-3 p-2 bg-slate-50 rounded-md">
      <h3 className="font-semibold">Course Selector</h3>
      <p className="text-sm text-gray-600 mb-2">
        Search by course code or title and select a course to add it into your
        study plan!
      </p>
      <Select
        options={searchResults}
        filterOption={() => true}
        isClearable
        isSearchable
        getOptionLabel={(option) =>
          option.course_code + " " + option.course_name
        }
        getOptionValue={(option) => option.course_code}
        placeholder="Search for a course"
        noOptionsMessage={() => "No courses found"}
        onInputChange={(inputValue) => loadOptions(inputValue, () => {})}
        onChange={(course) => addCourse(course)}
        className="mb-1"
      />
      <p
        className={`text-sm ${
          responseMessage === "Course successfully added!"
            ? "text-emerald-500"
            : "text-red-500"
        }`}
      >
        {responseMessage}
      </p>
    </div>
  );
}
