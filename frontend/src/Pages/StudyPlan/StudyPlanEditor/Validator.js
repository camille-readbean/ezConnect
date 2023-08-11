import { useState } from "react";
import { MdOutlineCelebration } from "react-icons/md";
import {
  Button,
  Alert,
  AlertTitle,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { secureApiRequest } from "../../../ApiRequest";

/**
 * A component that provides a study plan validation feature.
 * The validator validates pre-requisites for courses in a study plan.
 *
 * @component
 * @prop {String} studyPlanId - The ID of the study plan to validate.
 * @prop {Boolean} isShowValidator - The boolean indicating whether the validation modal is visible.
 * @prop {Function} setIsShowValidator - The function to set the visibility of the validation modal.
 * @prop {Function} updateStudyPlan - The function to update the study plan.
 * @prop {Function} setIsModified - The function to set the modification state of the study plan.
 * @prop {Object} instance - The MSAL instance for authentication.
 * @returns {JSX.Element} The validator component.
 */
export default function Validator({
  studyPlanId,
  isShowValidator,
  setIsShowValidator,
  updateStudyPlan,
  setIsModified,
  instance,
}) {
  const [inProgress, setInProgress] = useState(false);
  const [description, setDescription] = useState("");
  const [validated, setValidated] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [failedCourses, setFailedCourses] = useState([]);

  const validateStudyPlan = () => {
    setRequestSent(true);
    setDescription("In progress");
    updateStudyPlan(true);
    setIsModified(false);
    setInProgress(true);
    secureApiRequest(
      instance,
      "GET",
      `/api/studyplan/personal/${studyPlanId}/validate`
    )
      .then((resp) => {
        if ("error" in resp) {
          setValidated(false);
          setInProgress(false);
          throw Error(resp.error);
        }
        if (resp.validated !== true) {
          setValidated(false);
          setDescription(resp.failed_prereq_check_courses);
          setFailedCourses(resp.failed_prereq_check_courses);
          console.log(resp.failed_prereq_check_courses);
        } else {
          setValidated(true);
        }
        setInProgress(false);
      })
      .catch((error) => setDescription("Error from backend: " + error));
  };

  const closeModal = () => {
    setIsShowValidator(false);
  };

  return (
    <Dialog onClose={closeModal} open={isShowValidator} fullWidth maxWidth="md">
      <span>
        <DialogTitle>Validate pre-requisites</DialogTitle>
        <DialogContent>
          <Grid minHeight={200} my={2}>
            {validated ? (
              <Alert severity="success">
                <AlertTitle>
                  Validated <MdOutlineCelebration />
                </AlertTitle>
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
            ) : description.toString().toLocaleLowerCase().includes("error") ? (
              <Alert severity="error">
                <AlertTitle>
                  There was an error when validating your study plan
                </AlertTitle>
                {description}
              </Alert>
            ) : (
              <>
                <Alert severity="error">
                  <AlertTitle>Not valid study plan</AlertTitle>
                </Alert>
                <p>
                  {failedCourses.map((course) => (
                    <Alert severity="warning">
                      {course} did not have its pre-requisite fulfilled
                    </Alert>
                  ))}
                </p>
              </>
            )}
          </Grid>
          <Button variant="contained" onClick={validateStudyPlan}>
            Validate pre-requisites
          </Button>

          <p className="text-sm text-gray-600 mt-2">
            Note: <br />
            The pre-requisite validator completely ignores courses that have
            other requirements like units or A levels subjects. <br />
            Due to the limitation of our engine we are unable tell you exactly
            which part of a course pre-requisite was not met. <br />
            We are also unable to check preclusions or multi semester courses.
          </p>
        </DialogContent>
      </span>
    </Dialog>
  );
}
