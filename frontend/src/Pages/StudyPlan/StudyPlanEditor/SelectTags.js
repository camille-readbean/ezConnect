import Select from "react-select";
import programmesOptions from "../../../programmes.json";
import degreesOptions from "../../../degrees.json";

function SelectTags({
  academicPlanInformation,
  setAcademicPlanInformation,
  isPublisher,
}) {
  const minorOptions = programmesOptions.filter((programme) =>
    programme.title.toLowerCase().includes("minor")
  );

  const specialProgrammeOptions = programmesOptions.filter(
    (programme) => !programme.title.toLowerCase().includes("minor")
  );

  // Methods to update academic plan
  const updateFirstDegree = (degree) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      first_degree: degree,
    });
  };

  const updateSecondDegree = (degree) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      second_degree: degree,
    });
  };

  const updateSecondMajor = (major) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      second_major: major,
    });
  };

  const updateMinors = (minorsArray) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      minors: minorsArray,
    });
  };

  const updateSpecialProgramme = (specialProgrammeArray) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      special_programmes: specialProgrammeArray,
    });
  };

  return (
    <>
      <div>
        <label for="firstDegree">Degree</label>
        <Select
          options={degreesOptions}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          required={isPublisher}
          isClearable={!isPublisher}
          isSearchable
          value={academicPlanInformation["first_degree"]}
          onChange={updateFirstDegree}
          name="firstDegree"
          placeholder="Degree (Required)"
        />
      </div>

      <div>
        <label for="secondDegree">Second Degree</label>
        <Select
          options={degreesOptions}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          isClearable
          isSearchable
          value={academicPlanInformation["second_degree"]}
          onChange={updateSecondDegree}
          name="secondDegree"
          placeholder="Second Degree (Optional)"
        />
      </div>

      <div>
        <label for="secondMajor">Second Major</label>
        <input
          type="text"
          name="secondMajor"
          onChange={(event) => updateSecondMajor(event.target.value)}
          value={
            academicPlanInformation["second_major"] != null
              ? academicPlanInformation["second_major"]
              : ""
          }
          placeholder="Second Major (Optional)"
          className="w-full border-[1px] rounded-md border-gray-300 p-2 focus:outline-blue-500"
        />
      </div>

      <div>
        <label for="minors">Minors</label>
        <Select
          options={minorOptions}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          isMulti
          isSearchable
          onChange={updateMinors}
          name="minors"
          placeholder="Minors (Optional)"
          value={academicPlanInformation["minors"]}
          isOptionDisabled={() => academicPlanInformation["minors"].length >= 3}
        />
        <p className="text-sm text-gray-500">
          You can select up to a maximum of 3 minors.
        </p>
      </div>

      <div>
        <label for="specialProgrammes">Special Programmes</label>
        <Select
          options={specialProgrammeOptions}
          getOptionLabel={(option) => option.title}
          getOptionValue={(option) => option.id}
          isMulti
          isSearchable
          onChange={updateSpecialProgramme}
          name="specialProgrammes"
          value={academicPlanInformation["special_programmes"]}
          placeholder="Special Programmes (Optional)"
        />
      </div>
    </>
  );
}

export default SelectTags;
