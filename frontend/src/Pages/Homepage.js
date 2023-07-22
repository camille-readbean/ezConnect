import {
  useMsal,
  AuthenticatedTemplate,
  useIsAuthenticated,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { secureApiRequest } from "../ApiRequest";
import { Link } from "react-router-dom";
import Unauthenticated from "../Components/Unauthenticated";
import { Container} from "@mui/material";
import WelcomeBackBanner from "./WelcomeBackBanner";
import StudyPlanList from "./StudyPlan/StudyPlanMainPage/StudyPlanList";
import UserTab from "./Mentoring/UserTab";
import MatchesTab from "./Mentoring/MatchesTab";

function Homepage() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const azure_ad_oid =
    activeAccount != null ? activeAccount.idTokenClaims["oid"] : "";

  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [menteeMatches, setMenteeMatches] = useState([]);
  const [mentorMatches, setMentorMatches] = useState([]);
  const [userMentorPostings, setUserMentorPostings] = useState([]);
  const [userMentorRequests, setUserMentorRequests] = useState([]);
  const [studyPlanList, setStudyPlanList] = useState([]);
  const [isFetchStudyPlansAgain, setIsFetchStudyPlansAgain] = useState(false);

  // redirect user to create account if they are a new user
  function checkNewUser() {
    if (isAuthenticated) {
      const checkNewAccount = localStorage.getItem(
        `${activeAccount.username} ezConnect_new_user`
      );
      if (
        activeAccount.idTokenClaims["newUser"] &&
        checkNewAccount !== "false"
      ) {
        localStorage.setItem(
          `${activeAccount.username} ezConnect_new_user`,
          "true"
        );
      }
      const isNewAccount = localStorage.getItem(
        `${activeAccount.username} ezConnect_new_user`
      );

      if (isNewAccount === "true" && isAuthenticated) {
        setIsFirstLogin(true);
        navigate("/user/create-account");
      }
      // Get some data for the home page
      secureApiRequest(instance, "GET", "/api/mentoring/matches").then(
        (resp) => {
          // setMenteeMatches(resp.mentee_matches);
          // setMentorMatches(resp.mentor_matches);
          if (resp.mentee_matches != null && resp.mentor_matches) {
            setMenteeMatches(resp.mentee_matches);
            setMentorMatches(resp.mentor_matches);
          } else {
            console.log("Error in getting mentor matches");
            if ("User not found" === resp.error)
              navigate("/user/create-account");
          }
        }
      );
      secureApiRequest(
        instance,
        "GET",
        "/api/mentoring/mentors/get-user-mentor-postings"
      ).then((resp) =>
        resp
          ? setUserMentorPostings(resp.postings)
          : console.log("Error in getting mentor posting")
      );
      secureApiRequest(
        instance,
        "GET",
        "/api/mentoring/mentees/get-user-mentor-requests"
      ).then((resp) =>
        resp
          ? setUserMentorRequests(resp.postings)
          : console.log("Error in getting mentor request")
      );
    }
  }

  useEffect(checkNewUser, [instance, navigate, isAuthenticated]);

  const onPressCreateMentorPosting = (event) => {
    navigate("/mentoring/create-mentor-posting");
  };
  const onPressCreateMentorRequest = (event) => {
    navigate("/mentoring/create-mentor-request");
  };

  function handleButtonClick(matchId, action) {
    // Perform actions based on the matchId
    switch (action) {
      case "updatePosting":
        navigate(`/mentoring/mentors/${matchId}/update`);
        break;
      case "updateRequest":
        navigate(`/mentoring/mentees/${matchId}/update`);
        break;
      case "matchAccept":
        navigate(`/mentoring/matches/accept?match=${matchId}`);
        break;
      default:
        console.log("Card button pressed but nothing done");
    }
  }

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish?user_id=${azure_ad_oid}&ordering=trending`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudyPlanList(data["published_study_plans"].slice(0, 8));
      });
  }, [isFetchStudyPlansAgain]);

  return (
    <>
      <AuthenticatedTemplate>
        <WelcomeBackBanner
          activeAccount={activeAccount}
          isFirstLogin={isFirstLogin}
        />
        <Container className="py-5">
          <h1 className="text-3xl font-semibold text-sky-800">
            Mentor Mentee Matcher
          </h1>

          <MatchesTab 
            menteeMatches={menteeMatches} 
            mentorMatches={mentorMatches} 
            handleButtonClick={handleButtonClick}/>

          <hr className="divide-y-4"></hr>

          <UserTab 
            navigate={navigate}
            userMentorPostings={userMentorPostings}
            userMentorRequests={userMentorRequests}
            handleButtonClick={handleButtonClick}/>
          <center>
          <Link
            to="/studyplan"
            className="bg-sky-500 p-4 mt-3 rounded-full font-semibold text-white hover:bg-sky-600 transition uppercase"
          >
            Edit your study plan or browse study plans!
          </Link>
          </center>

        </Container>

        <Container className="py-5">
          <h1 className="text-3xl font-semibold text-sky-800">
            Trending study plans
          </h1>
          <div className="container m-auto p-5 bg-slate-50 rounded-md">
            {studyPlanList.length > 0 ? (
              <StudyPlanList
                studyPlans={studyPlanList}
                azure_ad_oid={azure_ad_oid}
                setIsFetchAgain={setIsFetchStudyPlansAgain}
                searchValue=""
              />
            ) : (
              <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full">
                <p>There are no study plans found...</p>
              </div>
            )}
            <div className="flex justify-center">
              <Link
                to="/studyplan"
                className="bg-sky-500 p-4 mt-3 rounded-full font-semibold text-white hover:bg-sky-600 transition uppercase"
              >
                Edit your study plan or browse study plans!
              </Link>
            </div>
          </div>
        </Container>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}

export default Homepage;
