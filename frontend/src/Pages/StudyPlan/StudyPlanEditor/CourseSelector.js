import Select from "react-select";
import courseOptions from "../../../courses.json";
import { useState } from "react";

const filterCourseOptions = (inputValue) => {
  return courseOptions.filter(
    function (course) {
      if (
        this.count < 10 &&
        (course["course_code"]
          .toLowerCase()
          .includes(inputValue.toLowerCase()) ||
          course["course_name"]
            .toLowerCase()
            .includes(inputValue.toLowerCase()))
      ) {
        this.count++;
        return true;
      }
      return false;
    },
    { count: 0 }
  );
};

const addCourse = (course, semesterInformation, updateSemester) => {
  if (
    course === null ||
    semesterInformation === null ||
    semesterInformation.length === 0
  ) {
    return;
  }
  const newCourseCode = course["course_code"];
  const semester = semesterInformation[0];
  const semesterCourses = semester["course_codes"];
  semesterCourses.push(newCourseCode);
  updateSemester(semester);
};

function CourseSelector({ semesterInformation, updateSemester }) {
  const [searchResults, setSearchResults] = useState([]);

  const loadOptions = (inputValue, callback) => {
    const filteredOptions = filterCourseOptions(inputValue);
    setSearchResults(filteredOptions);
    callback(filteredOptions);
  };

  return (
    <Select
      options={searchResults}
      filterOption={() => true}
      isClearable
      isSearchable
      getOptionLabel={(option) => option.course_code + " " + option.course_name}
      placeholder="Search for a course"
      noOptionsMessage={() => "No courses found"}
      onInputChange={(inputValue) => loadOptions(inputValue, () => {})}
      onChange={(course) =>
        addCourse(course, semesterInformation, updateSemester)
      }
      className="mx-3 mb-3"
    />
  );
}

export default CourseSelector;
