import LoginPage from "./Pages/LoginPage";
import AboutUs from "./Pages/AboutUs";
import Homepage from "./Pages/Homepage";
import ForgotPassword from "./Pages/ForgotPassword";
import Navigation from "./Components/Navigation";
import CreateAccount from "./Pages/sign-up/CreateAccount";
import Verify from "./Pages/sign-up/Verify";
import MentorMenteeMatcher from "./Pages/MentorMenteeMatcher";
import StudyPlanMainPage from "./Pages/StudyPlan/StudyPlanMainPage/StudyPlanMainPage";
import Footer from "./Components/Footer";
import ResourceRespository from "./Pages/ResourceRespository";
import StudyPlanEditor from "./Pages/StudyPlan/StudyPlanEditor/StudyPlanEditor";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";

function App() {
  const [isLoggedIn, setLogin] = useState(false);

  return (
    <>
      <header>
        <Navigation isLoggedIn={isLoggedIn} setLogin={setLogin} />
      </header>
      <body>
        <Routes>
          <Route
            path="/"
            element={<AboutUs isLoggedIn={isLoggedIn} setLogin={setLogin} />}
          />
          <Route
            path="/homepage"
            element={<Homepage isLoggedIn={isLoggedIn} />}
          />
          <Route path="/login" element={<LoginPage setLogin={setLogin} />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/signup/create-account" element={<CreateAccount />} />
          <Route path="/signup/verify" element={<Verify />} />
          <Route
            path="/mentormenteematcher"
            element={<MentorMenteeMatcher />}
          />
          <Route path="/studyplan" element={<StudyPlanMainPage />} />
          <Route
            path="/resourcerespository"
            element={<ResourceRespository />}
          />
          <Route path="/studyplan/editor" element={<StudyPlanEditor />} />
        </Routes>
      </body>
      <footer>
        <Footer />
      </footer>
    </>
  );
}

export default App;
