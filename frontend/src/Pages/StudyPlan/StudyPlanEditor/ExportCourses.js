import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoMdCopy } from "react-icons/io";

async function createNUSModLink(courseCodeList, semesterNumber) {
  const base = "https://nusmods.com/timetable";
  semesterNumber = ((semesterNumber + 1) % 2) + 1;
  const semester = `/sem-${semesterNumber}`;
  const exportCourseList = []
  for (let i = 0; i < courseCodeList.length; i++) {
    const courseCode = courseCodeList[i];
    await fetch(
      `https://api.nusmods.com/v2/2023-2024/modules/${courseCode}.json`
    )
      .then((res) => res.json())
      .then((data) =>
        processCourseDataToGetTimetable(courseCode, data, semesterNumber)
      )
      .then((courseString) => {
        exportCourseList.push(courseString)
      });
  }
  let result = base + semester + "/share?" + exportCourseList.join("");
  if (result.charAt(result.length - 1) === "&") {
    result = result.slice(0, -1);
  }
  return result;
}

function processCourseDataToGetTimetable(
  courseCode,
  courseData,
  semesterNumber
) {
  let semesterData = courseData.semesterData;
  if (semesterData == null) {
    return "";
  }
  semesterData = semesterData.filter(
    (semester) => semester.semester === semesterNumber
  );
  if (semesterData.length === 0) {
    return "";
  }
  semesterData = semesterData[0];
  const courseTimetable = semesterData.timetable; // array
  if (courseTimetable == null) {
    return "";
  }

  const seen = {}; // lesson types that are seen already
  for (let i = 0; i < courseTimetable.length; i++) {
    const classObj = courseTimetable[i];
    if (!(classObj.lessonType in seen)) {
      seen[classObj.lessonType] = classObj.classNo;
    }
  }

  let result = courseCode + "=";
  for (var lesson in seen) {
    result =
      result + lesson.slice(0, 3).toUpperCase() + ":" + seen[lesson] + ",";
  }

  return result.slice(0, -1) + "&";
}

export default function ExportCourses({
  semesterInfo,
  setIsShowExportSemester,
}) {
  const [exportLink, setExportLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const getLink = async () => {
      const link = await createNUSModLink(
        semesterInfo["course_codes"],
        semesterInfo["semester_number"]
      );
      setExportLink(link);
    };
    getLink();
  }, [semesterInfo]);

  const copyLink = async () => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(exportLink);
      setIsCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-20 p-3 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="relative p-5 bg-white rounded-md shadow-md w-full sm:max-w-2xl">
        <RxCross2
          className="absolute right-2 top-2 hover:cursor-pointer"
          onClick={() => setIsShowExportSemester(false)}
        />
        <div className="flex justify-between m-1 border-[1px] rounded-md">
          <p className="px-3 py-1 flex items-center break-all">{exportLink}</p>
          <button onClick={copyLink} className="bg-sky-100 hover:bg-sky-200 transition p-2 flex flex-col items-center justify-center">
            <IoMdCopy className="w-6 h-auto"/>
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-500">Note: courses that are not found on NUSMods in the selected semester will not be included in the link</p>
        {isCopied && <p className="text-sm flex justify-center text-emerald-600">Link copied!</p>}
      </div>
    </div>
  );
}
