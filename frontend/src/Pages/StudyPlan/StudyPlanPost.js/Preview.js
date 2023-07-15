export default function Preview({ semesterInformationArray }) {

  return (
    <div
      id="studyPlanPreview"
      className="flex flex-wrap gap-4 border-[1px] rounded-md justify-center p-2"
    >
      {semesterInformationArray.map((semester) => {
        const semesterNumber = semester["semester_number"];
        const totalUnits = semester["total_units"];
        const courseCodeList = semester["course_codes"];
        return (
          <div className="w-40 p-1">
            <h2 className="font-semibold">
              Y{Math.ceil(semesterNumber / 2)}S{((semesterNumber + 1) % 2) + 1}
            </h2>
            <div className="bg-slate-50 rounded-md flex flex-col gap-1 p-2 min-h-[160px]">
              {courseCodeList.map((courseCode) => {
                return (
                  <p className="bg-sky-100 rounded-lg px-2 py-1">
                    {courseCode}
                  </p>
                );
              })}
              <hr className="mt-auto border-slate-300"></hr>
              <p>Toal units: {totalUnits}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
