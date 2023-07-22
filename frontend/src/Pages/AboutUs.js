import { Link } from "react-router-dom";
import { FaSlideshare } from "react-icons/fa";
import { FcPlanner } from "react-icons/fc";
import { MdPermIdentity } from "react-icons/md";

function AboutUs({showLoginModal, setLoginModal}) {
  const handleFindOutMoreButtonClick = () => {
    const section = document.getElementById("MMMIntroduction");
    section.scrollIntoView({ behavior: "smooth" });
  };

  // const [showLogin, setShowLogin] = useState(false);
  const handleClickSignUp = () => {
    console.log('Sign up button pressed')
    setLoginModal(!showLoginModal);
  }

  return (
    <>
      <section className="bg-black text-white px-8 py-12 flex flex-col gap-2 items-center text-center">
        <h1 className="text-6xl font-bold">EZCONNECT</h1>
        <hr className="w-36 h-1 bg-gray-100 my-6" />
        <h2 className="text-xl font-semibold">
          Connecting and enabling one another
        </h2>
        <p>
          ezConnect is a one-stop platform for NUS students to find people for
          different purposes. Learn more below!
        </p>
        <button
          className="m-2 bluebutton"
          onClick={handleFindOutMoreButtonClick}
        >
          FIND OUT MORE
        </button>
      </section>

      <section id="MMMIntroduction" className="aboutussection">
        <FaSlideshare className="w-40 h-40" />
        <div className="aboutusdescription">
          <h1 className="text-2xl font-bold">Mentor-Mentee Matcher</h1>
          <p>
            Looking for academic help or career advice? Passionate about helping
            others? Search for a mentor or a mentee to benefit from one another!
          </p>
          <p>
            Users can find students who are actively looking for a match. Each
            posts showcases the name of post, description, type of request and
            course. Using the search feature, users can find a student who meets
            their requirements or make a post looking for one.
          </p>
          <Link to="/mentoring" className="bluebutton">
            Find a match
          </Link>
        </div>
      </section>

      <section className="bg-sky-100 aboutussection">
        <div className="aboutusdescription">
          <h1 className="text-2xl font-bold">Study Plan</h1>
          <p>
            Share your study plans with one another. Share your experience going
            through your study plan to let others learn from you! Reference
            study plans when building your own study plan! Check if your study
            plan meets prequisites! Import courses from NUSMods and export a
            semester to NUSMods!
          </p>
          <Link to="/studyplan" className="bluebutton">
            Look at study plans
          </Link>
        </div>
        <FcPlanner className="w-40 h-40" />
      </section>

      <section id="AccountIntro" className="aboutussection">
        <div className="aboutusdescription">
          <h1 className="text-2xl font-bold">Sign up!</h1>
          <p>
            Creating an account is easy. We use your NUS's Microsoft account to authenticate
             and verify everyone on the platform is an NUS student.
          </p>
          <p>
            There is no password to remember, just use your NUS Microsoft account for logging and sign up. <br />
            You will be prompted to create to create an account after logging for the first time.
          </p>
          <Link onClick={handleClickSignUp} className="bluebutton">
            Sign Up
          </Link>
        </div>
        {/* <MdPermIdentity className="w-40 h-40" /> */}
        {/* <img src={'nus1-logo.png'} style={{ height: '5em', 'padding-right': '12px'}} alt='MS logo'/> */}
      </section>
    </>
  );
}

export default AboutUs;
