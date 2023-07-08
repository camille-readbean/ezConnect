import studyPlanBackgroundImage from "./study_plan_banner_background.jpg";

function StudyPlanBanner() {
  return (
    <div
      className="bg-cover bg-center"
      style={{
        backgroundImage: `url(${studyPlanBackgroundImage})`,
        height: "350px",
      }}
    >
      <div className="backdrop-blur-sm h-full w-full px-10 sm:px-40 flex flex-col gap-1 justify-center">
        <h1 className="text-5xl font-bold uppercase">Study Plan</h1>
        <hr className="w-1/12 border-sky-500 border-2 my-2 rounded-full"></hr>
        <h2 className="text-2xl font-semibold">Course planning made easier</h2>
        <h3>Plan your courses and view other students' study plans</h3>
      </div>
    </div>
  );
}

export default StudyPlanBanner;
