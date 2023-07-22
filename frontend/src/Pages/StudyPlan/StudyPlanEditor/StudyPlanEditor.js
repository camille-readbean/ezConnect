import { Link, useParams } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import Editor from "./Editor";

function StudyPlanEditor() {
  const { instance } = useMsal();
  const [isAuthUser, setIsAuthUser] = useState(false);

  const activeAccount = instance.getActiveAccount();
  const { studyPlanId } = useParams();

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`
    )
      .then((res) => res.json())
      .then((data) => {
        const creatorId = data["creator_id"];
        if (activeAccount != null) {
          const currUserId = activeAccount.idTokenClaims["oid"];
          setIsAuthUser(currUserId === creatorId);
        }
      });
  }, [activeAccount, studyPlanId]);

  if (isAuthUser) {
    return (
      <div className="container mx-auto min-h-screen">
        <Editor studyPlanId={studyPlanId} instance={instance} />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen gap-5">
        <p className="text-lg">You do not have access to this study plan</p>
        <Link to="/studyplan" className="bluebutton">
          Return to Study Plan Main Page
        </Link>
      </div>
    );
  }
}

export default StudyPlanEditor;
