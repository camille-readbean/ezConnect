import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import html2canvas from "html2canvas";

function Editor({ studyPlanId }) {
  const [studyPlanInformation, setStudyPlanInformation] = useState({});
  const [title, setTitle] = useState("");
  const [semesterInformation, setSemesterInformation] = useState([]);
  const [isFetchAgain, setIsFetchAgain] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudyPlanInformation(data);
        setTitle(data["title"]);

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
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanInformation["id"]}`,
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

  const downloadStudyPlan = () => {
    console.log("trying to print study plan");
    const studyPlan = document.getElementById("studyPlan");
    html2canvas(studyPlan).then((canvas) => {
      const image = canvas.toDataURL("image/png");
      var anchor = document.createElement('a');
      anchor.setAttribute("href", image);
      anchor.setAttribute("download", `${title.replace(/ /g,"_")}.png`);
      anchor.click();
      anchor.remove();
    })
  }

  return (
    <>
      <input
        type="text"
        value={title}
        onChange={updateTitle}
        className="w-full text-2xl font-semibold px-1 my-2"
      />
      <div id="studyPlan" className="container mx-auto px-10 mb-2">
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
                <div className="w-56 p-1">
                  <h2 className="font-semibold text-lg pb-2">
                    Y{Math.ceil(semesterNumber / 2)}S
                    {((semesterNumber + 1) % 2) + 1}
                  </h2>
                  <div>
                    <Droppable droppableId={index.toString()}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex flex-col bg-sky-100 p-3 min-h-[250px] rounded-md"
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
                                          "border-radius": "5px",
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        {course}
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                            <p className="mt-auto">Total units: {totalUnits}</p>
                            {provided.placeholder}
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
      <button onClick={downloadStudyPlan} className="bg-sky-500 text-white rounded-lg p-2 m-3">Download</button>
    </>
  );
}

export default Editor;
