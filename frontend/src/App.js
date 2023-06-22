// import { useEffect, useState } from "react";
import { MsalProvider } from '@azure/msal-react';
import { Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import AboutUs from "./Pages/AboutUs";
import Homepage from "./Pages/Homepage";
import Navigation from "./Components/Navigation";
import CreateAccount from "./Pages/User/CreateAccount";
import MentorMenteeMatcher from "./Pages/MentorMenteeMatcher";
import StudyPlanMainPage from "./Pages/StudyPlan/StudyPlanMainPage/StudyPlanMainPage";
import Footer from "./Components/Footer";
import ResourceRespository from "./Pages/ResourceRespository";
import StudyPlanEditor from "./Pages/StudyPlan/StudyPlanEditor/StudyPlanEditor";



const Pages = () => {
  return (
    <>
      <header>
        <Navigation/>
      </header>
      <body>
        <Routes>
          <Route
            path="/"
            element={<AboutUs />}
          />
          <Route
            path="/homepage"
            element={<Homepage />}
          />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/user/create-account" element={<CreateAccount />} />
          <Route
            path="/mentormenteematcher"
            element={<MentorMenteeMatcher />}
          />
          <Route path="/studyplan" element={<StudyPlanMainPage />} />
          <Route
            path="/resourcerespository"
            element={<ResourceRespository />}
          />
          <Route path="/studyplan/editor/:studyPlanId" element={<StudyPlanEditor />} />
        </Routes>
      </body>
      <footer>
        <Footer />
      </footer>
    </>
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
