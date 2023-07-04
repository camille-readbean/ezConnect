import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonalStudyPlanList from "./PersonalStudyPlanList";
import EmptyPersonalStudyPlan from "./EmptyPersonalStudyPlan";

const getPersonalStudyPlans = async (userId) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/user_personal/${userId}`
    );
    const data = await res.json();
    const result = data["personal_study_plan_data"];
    return result;
  } catch (error) {
    console.error(error);
  }
};

function PersonalStudyPlanGallery({ azure_ad_oid }) {
  const navigate = useNavigate();
  const [personalStudyPlans, setPersonalStudyPlans] = useState([]);

  const createNewStudyPlan = (userId) => {
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/studyplan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creator_id: userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => res["study_plan_id"])
      .then((studyPlanId) => {
        navigate(`/studyplan/editor/${studyPlanId}`);
      });
  };

  useEffect(() => {
    const fetchStudyPlans = async () => {
      try {
        const plans = await getPersonalStudyPlans(azure_ad_oid);
        setPersonalStudyPlans(plans);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudyPlans();
  }, [azure_ad_oid]);

  const deleteStudyPlan = async (studyPlanId) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`,
        {
          method: "DELETE",
        }
      );
      const plans = await getPersonalStudyPlans(azure_ad_oid);
      setPersonalStudyPlans(plans);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-slate-50 px-20 py-10">
      <h1 className="text-2xl font-semibold pb-3">Your study plans</h1>
      {personalStudyPlans.length > 0 ? (
        <PersonalStudyPlanList
          personalStudyPlans={personalStudyPlans}
          azure_ad_oid={azure_ad_oid}
          createNewStudyPlan={createNewStudyPlan}
          deleteStudyPlan={deleteStudyPlan}
        />
      ) : (
        <EmptyPersonalStudyPlan
          azure_ad_oid={azure_ad_oid}
          createNewStudyPlan={createNewStudyPlan}
        />
      )}
    </div>
  );
}

export default PersonalStudyPlanGallery;
