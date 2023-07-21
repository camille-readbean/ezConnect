import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

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
