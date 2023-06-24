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
