/**
 * A component displayed when a user has no personal study plans.
 *
 * @component
 * @prop {String} azure_ad_oid - The ID of the user.
 * @prop {Function} createNewStudyPlan - Function to create a new study plan for the user.
 * @returns {JSX.Element} The rendered component indicating the absence of a personal study plan.
 */
function EmptyPersonalStudyPlan({ azure_ad_oid, createNewStudyPlan }) {
  return (
    <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full rounded-lg">
      <p className="text-lg m-2">You have no study plan</p>
      <button
        className="bluebutton"
        onClick={() => createNewStudyPlan(azure_ad_oid)}
      >
        Create one now
      </button>
    </div>
  );
}

export default EmptyPersonalStudyPlan;
