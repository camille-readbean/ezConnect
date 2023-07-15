import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CourseSelector from "./CourseSelector";
import EditorMenu from "./EditorMenu";
import Publisher from "./Publisher";
import ImportCourses from "./ImportCourses";
import SemesterMenu from "./SemesterMenu";
import ExportCourses from "./ExportCourses";
import { RxCross2 } from "react-icons/rx";
import Validator from "./Validator";

function Editor({ studyPlanId, instance }) {
  const [studyPlanInformation, setStudyPlanInformation] = useState(() => {});
  const [title, setTitle] = useState("");
  const [isShowPublisher, setIsShowPublisher] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [semesterInformation, setSemesterInformation] = useState([]);
  const [isFetchAgain, setIsFetchAgain] = useState(true);
  const [isShowExportSemester, setIsShowExportSemester] = useState(false);
  const [exportSemesterInfo, setExportSemesterInfo] = useState({});
  const [isShowValidator, setIsShowValidator] = useState(false);



  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudyPlanInformation(data);
        setTitle(data["title"]);
        setIsPublished(data["is_published"]);

        // get semester information
        const semesterIds = data["semester_ids"];
        const fetchSemesterInfoPromises = Object.values(semesterIds).map(
          (semesterId) =>
            fetch(
              `${process.env.REACT_APP_API_ENDPOINT}/api/study_plan_semester/${semesterId}`
            )
              .then((res) => res.json())
              .catch((err) => console.error(err))
        );

        Promise.all(fetchSemesterInfoPromises)
          .then((semesterInfo) => {
            setSemesterInformation(semesterInfo);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }, [studyPlanId, isFetchAgain]);

  const updateTitle = (event) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanInformation["id"]}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      }
    );
  };

  const onDragEnd = (result, semesterInformation, setSemesterInformation) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      const sourceSemester = semesterInformation[source.droppableId];
      const destSemester = semesterInformation[destination.droppableId];
      const sourceCourses = [...sourceSemester["course_codes"]];
      const destCourses = [...destSemester["course_codes"]];
      const [removed] = sourceCourses.splice(source.index, 1);
      destCourses.splice(destination.index, 0, removed);
      sourceSemester["course_codes"] = sourceCourses;
      destSemester["course_codes"] = destCourses;
      updateSemester(sourceSemester);
      updateSemester(destSemester);
      const updatedSemesterInformation = [...semesterInformation];
      updatedSemesterInformation[source.droppableId] = sourceSemester;
      updatedSemesterInformation[destination.droppableId] = destSemester;
      setSemesterInformation(updatedSemesterInformation);
    } else {
      const semester = semesterInformation[source.droppableId];
      const courses = [...semester["course_codes"]];
      const [removed] = courses.splice(source.index, 1);
      courses.splice(destination.index, 0, removed);
      const updatedSemester = { ...semester, course_codes: courses };
      updateSemester(updatedSemester);
      const updatedSemesterInformation = [...semesterInformation];
      updatedSemesterInformation[source.droppableId] = updatedSemester;
      setSemesterInformation(updatedSemesterInformation);
    }
  };

  const updateSemester = (updatedSemester) => {
    const semesterId = updatedSemester["id"];
    const newCourses = updatedSemester["course_codes"];
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/study_plan_semester/${semesterId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_codes: newCourses,
        }),
      }
    ).then((res) => {
      setIsFetchAgain((previous) => !previous);
    });
  };

  const deleteCourse = (semester, courseIndex) => {
    const courses = semester["course_codes"];
    courses.splice(courseIndex, 1);
    updateSemester(semester);
  };

  return (
    <>
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
      {isShowValidator && (
        <Validator
          studyPlanId={studyPlanId}
          setIsShowValidator={setIsShowValidator}
          instance={instance}
        />
      )}
      <div className="flex items-center">
        <input
          type="text"
          value={title}
          onChange={updateTitle}
          className="w-full text-2xl font-semibold px-1 my-2"
        />
        <EditorMenu
          title={title}
          studyPlanId={studyPlanId}
          setIsFetchAgain={setIsFetchAgain}
          setIsShowPublisher={setIsShowPublisher}
          semesterInformation={semesterInformation}
          setIsShowValidator={setIsShowValidator}
        />
      </div>
      <CourseSelector
        semesterInformation={semesterInformation}
        updateSemester={updateSemester}
      />
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
                      updateSemester={updateSemester}
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
                                  key={course}
                                  draggableId={course}
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
      <ImportCourses
        semesterInformation={semesterInformation}
        updateSemester={updateSemester}
      />
    </>
  );
}

export default Editor;
