import accessDenied from "./AccessDenied.jpg";

export default function Unauthenticated() {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center h-screen font-medium text-lg">
      <div>
        <p>Only NUS students are allowed to use the web application.</p>
        <p>Please log in / sign up to view the rest of this page!</p>
      </div>
      <img src={accessDenied} alt="Access Denied" width={400} height={400}/>
    </div>
  );
}
