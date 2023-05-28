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
import { Route, Routes } from "react-router-dom";
import { useState } from "react";

function App() {
  const [isLoggedIn, setLogin] = useState(false);

  return (
    <div>
      <Navigation isLoggedIn={isLoggedIn} setLogin={setLogin} />
      <Routes>
        <Route
          path="/"
          element={<AboutUs isLoggedIn={isLoggedIn} setLogin={setLogin} />}
        />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/login" element={<LoginPage setLogin={setLogin} />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/signup/create-account" element={<CreateAccount />} />
        <Route path="/signup/verify" element={<Verify />} />
        <Route path="/mentormenteematcher" element={<MentorMenteeMatcher />} />
        <Route path="/studyplan" element={<StudyPlan />} />
        <Route path="/resourcerespository" element={<ResourceRespository />} />
      </Routes>
    </div>
  );
}

export default App;
