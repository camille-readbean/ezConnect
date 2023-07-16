import welcomeBackBannerBackgroundImage from "./welcome_banner_background.png";

function WelcomeBackBanner({ activeAccount, isFirstLogin }) {
  const username = activeAccount ? activeAccount.idTokenClaims.name : null;

  return (
    <div
      className="bg-cover bg-center"
      style={{
        backgroundImage: `url(${welcomeBackBannerBackgroundImage})`,
        height: "350px",
      }}
    >
      <div className="backdrop-blur-sm text-white h-full w-full px-10 sm:px-40 flex flex-col gap-1 justify-center">
        <h1 className="text-4xl font-bold uppercase">
          Welcome{!isFirstLogin && <> Back</>},<br />
          {username != null && username}
        </h1>
        <hr className="w-1/12 border-sky-500 border-2 my-2 rounded-full"></hr>
        <h2 className="text-lg">
          Get back to matching with mentors/mentees or browse study plans!
        </h2>
      </div>
    </div>
  );
}

export default WelcomeBackBanner;
