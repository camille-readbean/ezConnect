import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { MdOutlineCelebration } from "react-icons/md"
import { Box, TextField, Button, Stack, Alert, AlertTitle, Grid } from "@mui/material";
import SelectTags from "./SelectTags";
import { secureApiRequest } from "../../../ApiRequest";

function Validator({
  studyPlanId,
  setIsShowValidator,
  instance
}) {
  

  const [inProgress, setInProgress] = useState(false);
  const [description, setDescription] = useState("");
  const [validated, setValidated] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [failedCourses, setFailedCourses] = useState([]);
  

//   useEffect(() => {
//     if (!isPublished) {
//       fetch(
//         `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`
//       )
//         .then((res) => res.json())
//         .then((data) => {
//           setTitle(data["title"]);
//         })
//         .catch((err) => {
//           console.error(err);
//         });
//     } else {
//       fetch(
//         `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish/${studyPlanInformation["published_version_id"]}`
//       )
//         .then((res) => res.json())
//         .then((data) => {
//           setTitle(data["title"]);
//           setDescription(data["description"]);
//           setAcademicPlanInformation(data["academic_plan"]);
//         })
//         .catch((err) => {
//           console.error(err);
//         });
//     }
//   }, [studyPlanId, isPublished]);

  const validateStudyPlan = () => {
    setRequestSent(true);
    setDescription("In progress");
    setInProgress(true);
    const resp = secureApiRequest(
        instance, "GET", `/api/studyplan/personal/${studyPlanId}/validate`
    ).then(resp => {
        if (resp.validated !== true) {
            setValidated(false);
            setDescription(resp.failed_prereq_check_courses);
            setFailedCourses(resp.failed_prereq_check_courses);
            console.log(resp.failed_prereq_check_courses);
        } else {
            setValidated(true);
        }
        setInProgress(false);
    }).catch(
        error => setDescription("Network error" + error)
    );
    // console.log(resp)
    // setDescription(resp);
    // console.log(description)
  };

//   function displayResult() {
//     return (

//     )
//   }


  return (
    <div className="fixed inset-0 z-20 p-3 pt-14 flex items-center justify-center bg-gray-500 bg-opacity-75 max-h-screen">
      <div className="relative p-5 bg-sky-50 rounded-md shadow-md min-w-min w-full sm:max-w-2xl max-h-full overflow-y-scroll">
        <RxCross2
          className="absolute right-2 top-2 hover:cursor-pointer"
          onClick={() => setIsShowValidator(false)}
        />
        <h6 className="text-lg font-semibold">Validate pre-requisites</h6>
    
        <Grid minHeight={200} my={2}>
            {validated ? (
                <Alert severity="success">
                    <AlertTitle>Validated <MdOutlineCelebration /></AlertTitle> 
                    Your Study plan was validated successfully <br />
                    All courses have their pre-requisites fulfilled! 
                </Alert>
            ) : inProgress ? (
                <Alert severity="info">
                    <AlertTitle>Validating</AlertTitle>
                    The server is processing the request
                </Alert>
            ) : requestSent === false ? (
                <Alert severity="info">Press the button to get started</Alert>
            ) : description.toString().toLocaleLowerCase().includes('error') ? (
                <Alert severity="error">
                    <AlertTitle>There was an error when validating your study plan</AlertTitle>
                    {description}
                </Alert>
            ) : (
                <>
                <Alert severity="error">
                    <AlertTitle>Not valid study plan</AlertTitle>
                </Alert>
                <p>
                {failedCourses.map(
                    (course) => (
                        <Alert severity="warning">{course} did not have its pre-requisite fulfilled</Alert>
                    )
                )}
                </p>
                {/* <p>{description}</p> */}
                </>
            )}
        </Grid>

        <Button variant="contained" onClick={validateStudyPlan}>
            Validate pre-requisites
        </Button>
        
        <p className="text-sm text-gray-600 mt-2">
            Note: <br />
            The pre-requisite validator completely ignores
            courses that have other requirements like units or A levels subjects <br />
            Due to the limitation of our engine we are unable tell you exactly which
            part of a course pre-requisite was not met.
        </p>
            
      </div>
    </div>
  );
}

export default Validator;
