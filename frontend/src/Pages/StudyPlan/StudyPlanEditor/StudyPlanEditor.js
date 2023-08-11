import { Link, useParams } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import Editor from "./Editor";

/**
 * A component that displays the study plan editor interface.
 * Checks if the active user is the creator of the study plan and renders the
 * editor or an access denial message accordingly.
 *
 * @component
 * @returns {JSX.Element} The study plan editor component.
 */
export default function StudyPlanEditor() {
  // get active user
  const { instance } = useMsal();
  const [isAuthUser, setIsAuthUser] = useState(false);
  const activeAccount = instance.getActiveAccount();
  const { studyPlanId } = useParams(); // get study plan id

  useEffect(() => {
    // get study plan information to get creator id of the study plan
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/personal/${studyPlanId}`
    )
      .then((res) => res.json())
      .then((data) => {
        // check if creator ID is the same as the active user ID
        const creatorId = data["creator_id"];
        if (activeAccount != null) {
          const currUserId = activeAccount.idTokenClaims["oid"];
          setIsAuthUser(currUserId === creatorId);
        }
      });
  }, [activeAccount, studyPlanId]);

  if (isAuthUser) {
    // render the editor for valid user
    return (
      <div className="container mx-auto min-h-screen">
        <Editor studyPlanId={studyPlanId} instance={instance} />
      </div>
    );
  } else {
    // render the access denial message for invalid user
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
