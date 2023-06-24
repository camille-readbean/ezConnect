import { Link, useParams } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import Editor from "./Editor";

function StudyPlanEditor() {
  const { instance } = useMsal();
  const [isAuthUser, setIsAuthUser] = useState(false);

  // Function to check that the current user is the creator of the study plan that the user is trying to access
  const checkCreator = (creatorId) => {
    const activeAccount = instance.getActiveAccount();
    if (activeAccount === null) {
      setIsAuthUser(false);
      return;
    }
    // ! check before deploying for production, fixed id is used for internal testing!
    const currUserId = activeAccount.idTokenClaims["oid"];
    // const currUserId = "12a3b456-c7de-44ce-bde9-a123bc00237d";
    setIsAuthUser(currUserId === creatorId);
  };

  const checkStudyPlanInformation = (studyPlanId) => {
    return fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`
    )
      .then((res) => res.json())
      .then((data) => {
        checkCreator(data["creator_id"]);
        return data;
      });
  };

  const { studyPlanId } = useParams();
  checkStudyPlanInformation(studyPlanId);

  if (isAuthUser) {
    return (
      <div className="container mx-auto">
        <Editor studyPlanId={studyPlanId} />
      </div>
    );
  } else {
    return (
      <>
        <p>You do not have access to this study plan</p>
        <Link to="/studyplan">Return to Study Plan Main Page</Link>
      </>
    );
  }
}

export default StudyPlanEditor;
