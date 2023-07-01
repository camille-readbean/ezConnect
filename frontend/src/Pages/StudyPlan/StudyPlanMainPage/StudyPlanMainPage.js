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
    azure_ad_oid = activeAccount.idTokenClaims["oid"];
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
