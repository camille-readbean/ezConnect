import Select from "react-select";
import courseOptions from "../../courses.json";
import { useState } from "react";

// Original author: Li Ting, adapted this for mentoring use case
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
      } else if (
        course["course_code"].toLowerCase() === inputValue.toLowerCase()) {
          return true
        }
      return false;
    },
    { count: 0 }
  ).reverse();
};

function CourseSelector({onChangeFunc}) {
  const [searchResults, setSearchResults] = useState([]);

  const loadOptions = (inputValue) => {
    const filteredOptions = filterCourseOptions(inputValue);
    setSearchResults(filteredOptions);
  };

  return (
    <Select
      options={searchResults}
      filterOption={() => true}
      isClearable
      isSearchable
      getOptionLabel={(option) => option.course_code + " " + option.course_name}
      getOptionValue={option => option.course_code}
      placeholder="Search for a course"
      noOptionsMessage={() => "No course found"}
      onInputChange={(inputValue) => loadOptions(inputValue)}
      onChange={onChangeFunc}
      className="mx-3 mb-3"
    />
  );
}

export default CourseSelector;
