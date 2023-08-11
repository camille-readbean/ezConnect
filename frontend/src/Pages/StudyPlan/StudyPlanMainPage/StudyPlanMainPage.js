import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { useState } from "react";
import StudyPlanBanner from "./StudyPlanBanner";
import PersonalStudyPlanGallery from "./PersonalStudyPlanGallery";
import StudyPlanGallery from "./StudyPlanGallary";
import FavouritedStudyPlanGallery from "./FavouritedStudyPlanGallery";
import Unauthenticated from "../../../Components/Unauthenticated";

/**
 * Displays the study plan main page.
 * Authenticated users are shown their personal, favorited, and general study plan galleries.
 * Unauthenticated users are shown an unauthenticated message.
 *
 * @component
 */
export default function StudyPlanMainPage() {
  // obtain user_id of current user
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  let azure_ad_oid = "";
  if (activeAccount != null) {
    azure_ad_oid = activeAccount.idTokenClaims["oid"];
  }

  const [isFetchAgain, setIsFetchAgain] = useState(false);

  return (
    <>
      <StudyPlanBanner />

      <AuthenticatedTemplate>
        <PersonalStudyPlanGallery
          azure_ad_oid={azure_ad_oid}
          setIsFetchAgain={setIsFetchAgain}
        />
        <FavouritedStudyPlanGallery
          azure_ad_oid={azure_ad_oid}
          isFetchAgain={isFetchAgain}
          setIsFetchAgain={setIsFetchAgain}
        />
        <StudyPlanGallery
          azure_ad_oid={azure_ad_oid}
          isFetchAgain={isFetchAgain}
          setIsFetchAgain={setIsFetchAgain}
        />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}
