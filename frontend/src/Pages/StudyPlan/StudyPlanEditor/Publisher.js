import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { Box, TextField, Button, Stack } from "@mui/material";
import SelectTags from "./SelectTags";

function Publisher({
  studyPlanId,
  studyPlanInformation,
  setIsShowPublisher,
  isPublished,
  setIsPublished,
  setIsFetchAgain,
}) {
  const defaultAcademicPlanInformation = {
    first_degree: { id: "6142a59a-26ff-44d2-8f49-91839c93e66c", title: "Law" },
    minors: [],
    second_degree: null,
    second_major: "",
    special_programmes: [],
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [academicPlanInformation, setAcademicPlanInformation] = useState(
    defaultAcademicPlanInformation
  );

  useEffect(() => {
    console.log("fetching study plan information");
    if (!isPublished) {
      fetch(
        `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`
      )
        .then((res) => res.json())
        .then((data) => {
          setTitle(data["title"]);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      fetch(
        `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish/${studyPlanInformation["published_version_id"]}`
      )
        .then((res) => res.json())
        .then((data) => {
          setTitle(data["title"]);
          setDescription(data["description"]);
          setAcademicPlanInformation(data["academic_plan"]);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [studyPlanId, isPublished]);

  const getAcademicPlanRequestBody = (academicPlanInformation) => {
    console.log(academicPlanInformation);
    return {
      first_degree_id: academicPlanInformation["first_degree"].id,
      second_degree_id:
        academicPlanInformation["second_degree"] != null
          ? academicPlanInformation["second_degree"].id
          : null,
      second_major: academicPlanInformation["second_major"],
      minors_id_list: academicPlanInformation["minors"].map(
        (minor) => minor.id
      ),
      special_programmes_id_list: academicPlanInformation[
        "special_programmes"
      ].map((special_programme) => special_programme.id),
    };
  };

  const publishStudyPlan = () => {
    console.log("trying to publish study plan");

    const requestBody = {
      title: title,
      description: description,
      academic_plan_info: getAcademicPlanRequestBody(academicPlanInformation),
    };
    console.log(requestBody);

    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish/${studyPlanId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    ).then((res) => {
      setIsPublished(true);
      console.log("study plan published");
    });
  };

  const updatePublishedStudyPlan = () => {
    console.log("trying to update published study plan");
    const requestBody = {
      title: title,
      description: description,
      personal_study_plan_id: studyPlanId,
      academic_plan_info: getAcademicPlanRequestBody(academicPlanInformation),
    };
    console.log(requestBody);

    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish/${studyPlanInformation["published_version_id"]}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    ).then((res) => {
      console.log("published study plan updated");
      window.alert("Published Study Plan Updated!");
      setIsFetchAgain((previous) => !previous);
    });
  };

  const unpublishStudyPlan = () => {
    console.log("trying to unpublish study plan");
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanInformation["published_version_id"]}`,
      { method: "DELETE" }
    ).then((res) => {
      setIsPublished(false);
      console.log("study plan unpublished");
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
          <SelectTags
            academicPlanInformation={academicPlanInformation}
            setAcademicPlanInformation={setAcademicPlanInformation}
          />
          <Stack direction="row" spacing={2}>
            {isPublished ? (
              <>
                <Button variant="contained" onClick={updatePublishedStudyPlan}>
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
          {isPublished ? (
            <p className="text-sm text-gray-600 mt-2">
              Note: Unpublishing a study plan will remove data on the
              description and tags associated with the study plan.
            </p>
          ) : (
            <></>
          )}
        </Box>
      </div>
    </div>
  );
}

export default Publisher;
