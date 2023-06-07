import { useEffect, useState } from "react";
import { MsalProvider, useIsAuthenticated } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';

import { Route, Routes } from "react-router-dom";

import LoginPage from "./Pages/LoginPage";
import AboutUs from "./Pages/AboutUs";
import Homepage from "./Pages/Homepage";
import ForgotPassword from "./Pages/ForgotPassword";
import Navigation from "./Components/Navigation";
import CreateAccount from "./Pages/sign-up/CreateAccount";
import Verify from "./Pages/sign-up/Verify";
import MentorMenteeMatcher from "./Pages/MentorMenteeMatcher";
import StudyPlan from "./Pages/StudyPlan";
import ResourceRespository from "./Pages/ResourceRespository";

import { b2cPolicies } from './authConfig';
// import { compareIssuingPolicy } from './utils/claimUtils';


const Pages = () => {
  // const [isLoggedIn, setLogin] = useState(false);
  const isLoggedIn = useIsAuthenticated();

  return (
    <div>
      <Navigation isLoggedIn={isLoggedIn}/>
      <Routes>
        <Route
          path="/"
          element={<AboutUs isLoggedIn={isLoggedIn}/>}
        />
        <Route path="/homepage" element={<Homepage isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/signup/create-account" element={<CreateAccount />} />
        <Route path="/signup/verify" element={<Verify />} />
        <Route path="/mentormenteematcher" element={<MentorMenteeMatcher />} />
        <Route path="/studyplan" element={<StudyPlan />} />
        <Route path="/resourcerespository" element={<ResourceRespository />} />
      </Routes>
    </div>
  );
};


/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
function App({ instance }) {
  return (
    <MsalProvider instance={instance}>
      <Pages />
    </MsalProvider>
  );
}

export default App;
