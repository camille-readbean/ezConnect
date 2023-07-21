import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

function PersonalStudyPlanList({
  personalStudyPlans,
  azure_ad_oid,
  createNewStudyPlan,
  deleteStudyPlan,
}) {
  const navigate = useNavigate();
  const [isDeleteComfirmationBoxOpen, setIsDeleteComfirmationBoxOpen] =
    useState(false);

  const makeCard = (studyPlanInformation) => {
    const title = studyPlanInformation["title"];
    const dateUpdated = studyPlanInformation["date_updated"];
    const id = studyPlanInformation["id"];

    // TODO: improve styling
    return (
      <>
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
              Deleting your study plan would also remove its published version
              (if any).
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteComfirmationBoxOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteStudyPlan(id);
                setIsDeleteComfirmationBoxOpen(false);
              }}
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <div
          onClick={() => navigate(`/studyplan/editor/${id}`)}
          className="group relative bg-white rounded-lg w-64 min-w-[256px] h-44 p-3 m-2 shadow-md overflow-hidden hover:cursor-pointer"
        >
          <p className="font-semibold whitespace-normal break-words">{title}</p>
          <div className="flex justify-between items-center">
            <p className="text-sm italic whitespace-normal break-words">
              Last updated: {dateUpdated}
            </p>
            <AiFillDelete
              className="hidden cursor-pointer group-hover:block hover:bg-slate-200 p-1 h-6 w-6 rounded-md transition"
              onClick={(event) => {
                event.stopPropagation();
                setIsDeleteComfirmationBoxOpen(true);
              }}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white p-2 rounded-lg">
      <p className="text-lg m-1 font-medium">
        Click on a study plan to continue editing!
      </p>
      <div className="flex overflow-x-auto whitespace-nowrap">
        <div
          className="group relative hover:cursor-pointer"
          onClick={() => createNewStudyPlan(azure_ad_oid)}
        >
          <div className="absolute bg-white w-64 rounded-lg h-44 p-3 m-2 shadow-md flex items-center justify-center">
            <p>Create a new study plan</p>
          </div>
          <div className="bg-black text-white opacity-0 rounded-lg w-64 h-44 p-3 m-2 shadow-md items-center justify-center flex group-hover:opacity-80 transition">
            <p>Create blank</p>
          </div>
        </div>
        {personalStudyPlans.map((studyPlan) => makeCard(studyPlan))}
      </div>
    </div>
  );
}

export default PersonalStudyPlanList;
