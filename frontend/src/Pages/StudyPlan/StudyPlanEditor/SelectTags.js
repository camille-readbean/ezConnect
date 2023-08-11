import Select from "react-select";
import programmesOptions from "../../../programmes.json";
import degreesOptions from "../../../degrees.json";

/**
 * A component that provides a form to select tags for the study plan.
 * Tags information are stored in the academic plan of the study plan.
 *
 * @component
 * @prop {Object} academicPlanInformation - The academic plan information.
 * @prop {Function} setAcademicPlanInformation - Function to update academic plan information.
 * @prop {Boolean} isPublisher - Indicates if the component is placed in the Publisher component
 * @returns {JSX.Element} The select tags component.
 */
export default function SelectTags({
  academicPlanInformation,
  setAcademicPlanInformation,
  isPublisher,
}) {
  // get minors from programmesOptions
  const minorOptions = programmesOptions.filter((programme) =>
    programme.title.toLowerCase().includes("minor")
  );

  // get special programmes from programmesOptions
  const specialProgrammeOptions = programmesOptions.filter(
    (programme) => !programme.title.toLowerCase().includes("minor")
  );

  /**
   * Function to update the first degree in the academic plan information.
   *
   * @param {Object} degree - The degree to be changed to.
   */
  const updateFirstDegree = (degree) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      first_degree: degree,
    });
  };

  /**
   * Function to update the second degree in the academic plan information.
   *
   * @param {Object} degree - The degree to be changed to.
   */
  const updateSecondDegree = (degree) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      second_degree: degree,
    });
  };

  /**
   * Function to update the second major in the academic plan information.
   *
   * @param {String} major - The major to be changed to.
   */
  const updateSecondMajor = (major) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      second_major: major,
    });
  };

  /**
   * Function to update the minors in the academic plan information.
   *
   * @param {Object[]} minorsArray - The array of minors to be changed to.
   */
  const updateMinors = (minorsArray) => {
    setAcademicPlanInformation({
      ...academicPlanInformation,
      minors: minorsArray,
    });
  };

  /**
   * Function to update the special programmes in the academic plan information.
   *
   * @param {Object[]} specialProgrammeArray - The array of special programmes to be changed to.
   */
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
