import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

/**
 * A confirmation dialog box for deleting a study plan.
 *
 * @component
 * @prop {String} studyPlanId - The UUID of the study plan to be deleted.
 * @prop {Function} deleteStudyPlan - The function to call to delete the study plan.
 * @prop {Boolean} isDeleteComfirmationBoxOpen - Indicates whether the delete confirmation box is open.
 * @prop {Function} setIsDeleteComfirmationBoxOpen - Function to control the open state of the delete confirmation box.
 * @returns {JSX.Element} The rendered delete confirmation dialog box component.
 */
export default function DeleteComfirmationBox({
  studyPlanId,
  deleteStudyPlan,
  isDeleteComfirmationBoxOpen,
  setIsDeleteComfirmationBoxOpen,
}) {
  return (
    <Dialog
      open={isDeleteComfirmationBoxOpen}
      onClose={() => setIsDeleteComfirmationBoxOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Are you sure you want to delete your study plan?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Deleting your study plan would also remove its published version (if
          any).
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsDeleteComfirmationBoxOpen(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            deleteStudyPlan(studyPlanId);
            setIsDeleteComfirmationBoxOpen(false);
          }}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
