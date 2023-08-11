/**
 * A component to display academic plan information as tags.
 *
 * @component
 * @param {Object} academicPlanInformation - The academic plan information object.
 * @param {Object} academicPlanInformation.first_degree - Information about the first degree.
 * @param {String} academicPlanInformation.first_degree.title - Title of the first degree.
 * @param {?Object} academicPlanInformation.second_degree - Information about the second degree (nullable).
 * @param {?String} academicPlanInformation.second_degree.title - Title of the second degree (nullable).
 * @param {?String} academicPlanInformation.second_major - Title of the second major (nullable or empty string).
 * @param {Array} academicPlanInformation.minors - An array of objects representing minors.
 * @param {String} academicPlanInformation.minors[].title - Title of the minor.
 * @param {Array} academicPlanInformation.special_programmes - An array of special programs.
 * @param {String} academicPlanInformation.special_programmes[].title - Title of the special program.
 * @returns {JSX.Element} The rendered tags component.
 */
export default function Tags({ academicPlanInformation }) {
  // get neccessary information from academicPlanInformation object
  const firstDegreeTitle = academicPlanInformation.first_degree.title;
  const secondDegreeTitle =
    academicPlanInformation.second_degree == null
      ? null
      : academicPlanInformation.second_degree.title;
  const secondMajor = academicPlanInformation.second_major;
  const minorsList = academicPlanInformation.minors.map(
    (minorInfo) => minorInfo.title
  );
  const specialProgrammesList = academicPlanInformation.special_programmes.map(
    (specialProgramme) => specialProgramme.title
  );

  return (
    <div className="flex flex-wrap gap-1">
      <p className="tag bg-yellow-100">{firstDegreeTitle}</p>
      {secondDegreeTitle != null && (
        <p className="tag bg-orange-100">{secondDegreeTitle}</p>
      )}
      {secondMajor != null && secondMajor !== "" && (
        <p className="tag bg-lime-100">{secondMajor}</p>
      )}
      {minorsList.map((minor) => (
        <p className="tag bg-violet-100">{minor}</p>
      ))}
      {specialProgrammesList.map((specialProgramme) => (
        <p className="tag bg-rose-100">{specialProgramme}</p>
      ))}
    </div>
  );
}
