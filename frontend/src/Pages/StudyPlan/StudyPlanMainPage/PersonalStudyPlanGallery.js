import { useState } from "react";
import PersonalStudyPlanList from "./PersonalStudyPlanList";
import EmptyPersonalStudyPlan from "./EmptyPersonalStudyPlan";

const getPersonalStudyPlans = () => {
  // TODO: fetch data using API call
  return [];
};

function PersonalStudyPlanGallery() {
  const [personalStudyPlans, setPersonalStudyPlans] = useState(
    getPersonalStudyPlans()
  );

  return (
    <div className="bg-slate-50 px-20 py-10">
      <h1 className="text-2xl font-semibold pb-3">Your study plans</h1>
      {personalStudyPlans.length > 0 ? (
        <PersonalStudyPlanList personalStudyPlans={personalStudyPlans} />
      ) : (
        <EmptyPersonalStudyPlan />
      )}
    </div>
  );
}

export default PersonalStudyPlanGallery;
