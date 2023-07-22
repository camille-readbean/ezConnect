import { MsalProvider } from '@azure/msal-react';
import { Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import AboutUs from "./Pages/AboutUs";
import Homepage from "./Pages/Homepage";
import Navigation from "./Components/Navigation";
import CreateAccount from "./Pages/User/CreateAccount";
import MentoringMainPage from "./Pages/Mentoring/MentoringMainPage";
import StudyPlanMainPage from "./Pages/StudyPlan/StudyPlanMainPage/StudyPlanMainPage";
import Footer from "./Components/Footer";
import StudyPlanEditor from "./Pages/StudyPlan/StudyPlanEditor/StudyPlanEditor";
import CreateMentorPosting from "./Pages/Mentoring/CreateMentorPosting";
import CreateMentorRequest from "./Pages/Mentoring/CreateMentorRequest"
import UpdateMentorPosting from './Pages/Mentoring/UpdateMentorPosting';
import UpdateMentorRequest from './Pages/Mentoring/UpdateMentorRequest';
import RequestMentor from './Pages/Mentoring/RequestMentor';
import RequestMentee from './Pages/Mentoring/RequestMentee';
import AcceptMatch from './Pages/Mentoring/AcceptMatch';
import FavouritedStudyPlanPage from './Pages/StudyPlan/PersonalTabs/FavouritedStudyPlanPage';
import NotFound from './Pages/404';

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
            path="/mentoring"
            element={<MentoringMainPage />}
          />
          <Route path="/mentoring/create-mentor-posting" element={<CreateMentorPosting/>} />
          <Route path="/mentoring/create-mentor-request" element={<CreateMentorRequest/>} />
          <Route path="/mentoring/mentors/:posting_id/update" element={<UpdateMentorPosting/>} />
          <Route path="/mentoring/mentors/:posting_id/request" element={<RequestMentor/>} />
          <Route path="/mentoring/mentees/:posting_id/update" element={<UpdateMentorRequest/>} />
          <Route path="/mentoring/mentees/:posting_id/request" element={<RequestMentee/>} />
          <Route path="/mentoring/matches/accept" element={<AcceptMatch/>} />
          <Route path="/studyplan" element={<StudyPlanMainPage />} />
          <Route path="/studyplan/editor/:studyPlanId" element={<StudyPlanEditor />} />
          <Route path="/studyplan/favourites" element={<FavouritedStudyPlanPage />} />
          <Route path="*" element={<NotFound />} />
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
