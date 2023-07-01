// TODO: Implement tags

import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { Box, TextField, Button, Stack } from "@mui/material";

function Publisher({
  studyPlanId,
  setIsShowPublisher,
  isPublished,
  setIsPublished,
  setIsFetchAgain,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    console.log("fetching study plan information");
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data["title"]);
        setDescription(data["description"]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [studyPlanId, isPublished]);

  const publishStudyPlan = () => {
    console.log("trying to publish study plan");
    const updatedInformation = {
      is_published: true,
      title: title,
      description: description,
    };
    console.log(updatedInformation);
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInformation),
      }
    ).then((res) => {
      setIsPublished(true);
      setIsFetchAgain((previous) => !previous);
    });
  };

  const unpublishStudyPlan = () => {
    console.log("trying to unpublish study plan");
    const updatedInformation = {
      is_published: false,
      title: title,
      description: description,
    };
    console.log(updatedInformation);
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInformation),
      }
    ).then((res) => {
      setIsPublished(false);
      setIsFetchAgain((previous) => !previous);
    });
  };

  return (
    <div className="fixed inset-0 z-20 p-3 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="relative p-5 bg-sky-50 rounded-md shadow-md min-w-min w-full sm:max-w-2xl">
        <RxCross2
          className="absolute right-2 top-2 hover:cursor-pointer"
          onClick={() => setIsShowPublisher(false)}
        />

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <TextField
            required
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            helperText="An informative and succinct title"
            margin="dense"
          />
          <TextField
            fullWidth
            multiline
            label="Description"
            varient="outlined"
            value={description == null ? "" : description}
            onChange={(event) => setDescription(event.target.value)}
            helperText="Explain your reasoning behind your study plan and share your experience (if applicable)"
            margin="dense"
          />
          <Stack direction="row" spacing={2}>
            {isPublished ? (
              <>
                <Button variant="contained" onClick={publishStudyPlan}>
                  Update
                </Button>
                <Button variant="outlined" onClick={unpublishStudyPlan}>
                  Unpublish
                </Button>
              </>
            ) : (
              <Button variant="contained" onClick={publishStudyPlan}>
                Publish
              </Button>
            )}
          </Stack>
        </Box>
      </div>
    </div>
  );
}

export default Publisher;
