import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonalStudyPlanList from "./PersonalStudyPlanList";
import EmptyPersonalStudyPlan from "./EmptyPersonalStudyPlan";

const getPersonalStudyPlans = async (userId, navigate) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/user_personal/${userId}`
    );
    const data = await res.json();
    if (
      data.detail &&
      data.detail.includes("User") &&
      data.detail.includes("not found")
    )
      throw Error("User not found");
    const result = data["personal_study_plan_data"];
    return result;
  } catch (error) {
    console.error(error);
    if (error.message === "User not found") {
      console.log("User not found, redirecting to create account");
      navigate("/user/create-account");
    }
  }
};

function PersonalStudyPlanGallery({ azure_ad_oid, setIsFetchAgain }) {
  const navigate = useNavigate();
  const [personalStudyPlans, setPersonalStudyPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      try {
        // const plans = await getPersonalStudyPlans(azure_ad_oid, navigate);
        // if (plans != null)
        //   setPersonalStudyPlans(plans);
        // else console.log("Error 11111")
        // setPersonalStudyPlans(plans);

        await getPersonalStudyPlans(azure_ad_oid, navigate)
          .then((plans) => {
            if (plans != null) {
              setPersonalStudyPlans(plans);
            }
            console.log("plans: " + plans);
          })
          .catch((error) => {
            if (error === "User not found") {
              console.log("User not found");
              navigate("/user/create-account");
            } else {
              console.log("Error caught in " + error);
            }
          });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudyPlans();
  }, [azure_ad_oid, navigate]);

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
      setIsFetchAgain((previous) => !previous);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-slate-50 px-10 sm:px-20 py-10">
      <h1 className="text-2xl font-semibold pb-3">Your study plans</h1>
      {isLoading ? (
        <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full rounded-lg">
          <p className="text-lg m-2">Loading personal study plans...</p>
        </div>
      ) : personalStudyPlans.length > 0 ? (
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
