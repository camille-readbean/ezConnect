export default function Tags({ academicPlanInformation }) {
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
      {secondDegreeTitle != null ? (
        <p className="tag bg-orange-100">{secondDegreeTitle}</p>
      ) : (
        <></>
      )}
      {secondMajor != null && secondMajor !== "" ? (
        <p className="tag bg-lime-100">{secondMajor}</p>
      ) : (
        <></>
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
