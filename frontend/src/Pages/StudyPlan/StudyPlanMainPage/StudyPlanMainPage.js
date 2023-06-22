import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import StudyPlanBanner from "./StudyPlanBanner";
import PersonalStudyPlanGallery from "./PersonalStudyPlanGallery";
import StudyPlanGallery from "./StudyPlanGallary";
import Unauthenticated from "../../../Components/Unauthenticated";

function StudyPlanMainPage() {
  // obtain user_id of current user
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  let azure_ad_oid = "";
  if (activeAccount != null) {
    // ! change before deploying for production, fixed id is meant for internal testing
    // azure_ad_oid = activeAccount.idTokenClaims["oid"];
    azure_ad_oid = "12a3b456-c7de-44ce-bde9-a123bc00237d";
  }

  return (
    <>
      <StudyPlanBanner />

      <AuthenticatedTemplate>
        <PersonalStudyPlanGallery azure_ad_oid={azure_ad_oid} />
        <StudyPlanGallery />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}

export default StudyPlanMainPage;
