import Select from "react-select";
import courseOptions from "../../../courses.json";
import { useState } from "react";

const filterCourseOptions = (inputValue) => {
  return courseOptions.filter(
    function (course) {
      if (this.count >= 10) {
        return false;
      }

      const courseCode = course["course_code"].toLowerCase();
      const courseName = course["course_name"].toLowerCase();
      const isInCourseCode = () =>
        courseCode.startsWith(inputValue.toLowerCase());
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

function CourseSelector({
  semesterInformation,
  updateCoursesInSemester,
  lastInteractedSemesterIndex,
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");

  const loadOptions = (inputValue, callback) => {
    const filteredOptions = filterCourseOptions(inputValue);
    setSearchResults(filteredOptions);
    callback(filteredOptions);
  };

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

    newCourseCodeList.push(newCourseCode);
    updateCoursesInSemester(newCourseCodeList, semester);
    setResponseMessage("Course successfully added!");
  };

  return (
    <div className="mx-3 mb-3">
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

export default CourseSelector;
