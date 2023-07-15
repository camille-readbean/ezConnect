import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CourseSelector from "./CourseSelector";
import EditorMenu from "./EditorMenu";
import Publisher from "./Publisher";
import ImportCourses from "./ImportCourses";
import SemesterMenu from "./SemesterMenu";
import ExportCourses from "./ExportCourses";
import { RxCross2 } from "react-icons/rx";

export default function Editor({ studyPlanId }) {
  const [studyPlanInformation, setStudyPlanInformation] = useState(() => {});
  const [title, setTitle] = useState("");
  const [isShowPublisher, setIsShowPublisher] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [semesterInformation, setSemesterInformation] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [isFetchAgain, setIsFetchAgain] = useState(true);
  const [isShowExportSemester, setIsShowExportSemester] = useState(false);
  const [exportSemesterInfo, setExportSemesterInfo] = useState({});
  const [lastInteractedSemesterIndex, setLastInteractedSemesterIndex] =
    useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudyPlanInformation(data);
        setTitle(data["title"]);
        setIsPublished(data["is_published"]);
        setSemesterInformation(data["semester_info_list"]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [studyPlanId, isFetchAgain]);

  const onDragEnd = (result, semesterInformation, setSemesterInformation) => {
    if (!result.destination) return;
    const { source, destination } = result;
    setLastInteractedSemesterIndex(destination.droppableId);
    if (source.droppableId !== destination.droppableId) {
      const sourceSemester = semesterInformation[source.droppableId];
      const destSemester = semesterInformation[destination.droppableId];
      const sourceCourses = [...sourceSemester["course_codes"]];
      const destCourses = [...destSemester["course_codes"]];
      const [removed] = sourceCourses.splice(source.index, 1);

      // check for duplicates
      if (destCourses.includes(removed)) {
        const semesterNumber = parseInt(destination.droppableId) + 1;
        setErrorMessage(
          `Semester Y${Math.ceil(semesterNumber / 2)}S${
            ((semesterNumber + 1) % 2) + 1
          } contains ${removed} already`
        );
        return;
      }

      destCourses.splice(destination.index, 0, removed);
      sourceSemester["course_codes"] = sourceCourses;
      destSemester["course_codes"] = destCourses;
      const updatedSemesterInformation = [...semesterInformation];
      updatedSemesterInformation[source.droppableId] = sourceSemester;
      updatedSemesterInformation[destination.droppableId] = destSemester;
      setSemesterInformation(updatedSemesterInformation);
      setIsModified(true);
      setErrorMessage("");
    } else {
      const semester = semesterInformation[source.droppableId];
      const courses = [...semester["course_codes"]];
      const [removed] = courses.splice(source.index, 1);
      courses.splice(destination.index, 0, removed);
      const updatedSemester = { ...semester, course_codes: courses };
      const updatedSemesterInformation = [...semesterInformation];
      updatedSemesterInformation[source.droppableId] = updatedSemester;
      setSemesterInformation(updatedSemesterInformation);
      setIsModified(true);
      setErrorMessage("");
    }
  };

  const deleteCourse = (semester, courseIndex) => {
    const courses = semester["course_codes"];
    courses.splice(courseIndex, 1);
    setLastInteractedSemesterIndex(semester["semester_number"] - 1);
    const updatedSemesterInformation = [...semesterInformation];
    updatedSemesterInformation[semester["semester_number"] - 1] = semester;
    setSemesterInformation(updatedSemesterInformation);
    setIsModified(true);
  };

  const updateCoursesInSemester = (courseArray, semester) => {
    semester["course_codes"] = courseArray;
    const updatedSemesterInformation = [...semesterInformation];
    updatedSemesterInformation[semester["semester_number"] - 1] = semester;
    setLastInteractedSemesterIndex(semester["semester_number"] - 1);
    setSemesterInformation(updatedSemesterInformation);
    setIsModified(true);
  };

  const updateStudyPlan = (fetchAgain) => {
    const requestBody = {
      title: title,
      semester_info_list: semesterInformation,
    };

    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    ).then(() => {
      fetchAgain && setIsFetchAgain((previous) => !previous);
    });
  };

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    if (isModified) {
      window.addEventListener("beforeunload", handler);
      return () => {
        window.removeEventListener("beforeunload", handler);
      };
    }
    return () => {};
  }, [isModified]);

  useEffect(() => {
    const autosave = setInterval(() => {
      console.log("checking if modified");
      if (isModified) {
        setIsModified(false);
        console.log("updating study plan");
        updateStudyPlan(false);
      }
    }, 5000);
    return () => clearInterval(autosave);
  });

  return (
    <div className="px-8">
      {isShowPublisher && (
        <Publisher
          studyPlanId={studyPlanId}
          studyPlanInformation={studyPlanInformation}
          setIsShowPublisher={setIsShowPublisher}
          isPublished={isPublished}
          setIsPublished={setIsPublished}
          setIsFetchAgain={setIsFetchAgain}
        />
      )}
      {isShowExportSemester && (
        <ExportCourses
          semesterInfo={exportSemesterInfo}
          setIsShowExportSemester={setIsShowExportSemester}
        />
      )}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setIsModified(true);
          }}
          className="w-full text-2xl font-semibold px-1 my-2"
        />
        <button
          onClick={() => {
            updateStudyPlan(true);
            setIsModified(false);
          }}
          className="bg-sky-200 rounded-md px-2 py-1 hover:bg-sky-300 transition"
        >
          {isModified ? <>Save</> : <>Saved</>}
        </button>
        <EditorMenu
          title={title}
          setSemesterInformation={setSemesterInformation}
          setIsModified={setIsModified}
          setIsShowPublisher={setIsShowPublisher}
          semesterInformation={semesterInformation}
          setLastInteractedSemesterIndex={setLastInteractedSemesterIndex}
        />
      </div>
      <p className="px-2 text-gray-600">
        Drag and drop courses to create your own study plan!
      </p>
      <p className="text-sm p-2 text-gray-600">
        Your study plan is autosaved every few seconds. Click on the save button
        to ensure that your study plan is saved and calculate the total number
        of units per semester.
      </p>
      <CourseSelector
        semesterInformation={semesterInformation}
        updateCoursesInSemester={updateCoursesInSemester}
        lastInteractedSemesterIndex={lastInteractedSemesterIndex}
      />
      <ImportCourses
        semesterInformation={semesterInformation}
        updateCoursesInSemester={updateCoursesInSemester}
      />
      <p className="text-sm text-red-500 px-4 pb-2">{errorMessage}</p>
      <div id="studyPlan" className="px-3 mb-3">
        <DragDropContext
          onDragEnd={(result) =>
            onDragEnd(result, semesterInformation, setSemesterInformation)
          }
        >
          <div className="flex flex-wrap gap-3">
            {semesterInformation.map((semester, index) => {
              const semesterNumber = semester["semester_number"];
              const totalUnits = semester["total_units"];
              const courseCodeList = semester["course_codes"];

              return (
                <div className="group w-56 p-1">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg pb-2">
                      Y{Math.ceil(semesterNumber / 2)}S
                      {((semesterNumber + 1) % 2) + 1}
                    </h2>
                    <SemesterMenu
                      setIsShowExportSemester={setIsShowExportSemester}
                      setExportSemesterInfo={setExportSemesterInfo}
                      semesterInfo={semester}
                      updateCoursesInSemester={updateCoursesInSemester}
                    />
                  </div>
                  <div>
                    <Droppable droppableId={index.toString()}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex flex-col bg-sky-100 p-3 min-h-[285px] rounded-md"
                          >
                            {courseCodeList.map((course, index) => {
                              return (
                                <Draggable
                                  key={course + semesterNumber + index}
                                  draggableId={course + semesterNumber + index}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          userSelect: "none",
                                          padding: 12,
                                          margin: "0 0 8px 0",
                                          backgroundColor: snapshot.isDragging
                                            ? "SteelBlue"
                                            : "MidnightBlue",
                                          color: "white",
                                          ...provided.draggableProps.style,
                                        }}
                                        className="flex group/course rounded-md items-center"
                                      >
                                        {course}
                                        <RxCross2
                                          className="invisible ml-auto group-hover/course:visible hover:cursor-pointer"
                                          onClick={() =>
                                            deleteCourse(semester, index)
                                          }
                                        />
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                            <hr className="mt-auto mb-2 border-slate-300"></hr>
                            <p>Total units: {totalUnits}</p>
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
