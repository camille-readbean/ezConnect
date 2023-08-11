import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonalStudyPlanList from "./PersonalStudyPlanList";
import EmptyPersonalStudyPlan from "./EmptyPersonalStudyPlan";

/**
 * Retrieves personal study plans for a given user.
 *
 * @async
 * @param {String} userId - The ID of the user for whom to fetch personal study plans.
 * @param {Function} navigate - Function to navigate to a specific route.
 */
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

/**
 * A component that displays a gallery of personal study plans.
 *
 * @component
 * @prop {String} azure_ad_oid - The ID of the user.
 * @prop {Function} setIsFetchAgain - Function to trigger the fetching of data by controlling the fetch state.
 * @returns {JSX.Element} The rendered personal study plan gallery component.
 */
function PersonalStudyPlanGallery({ azure_ad_oid, setIsFetchAgain }) {
  const navigate = useNavigate();
  const [personalStudyPlans, setPersonalStudyPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // fetch personal study plans
  useEffect(() => {
    const fetchStudyPlans = async () => {
      setIsLoading(true);
      try {
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

  /**
   * Creates new personal study plan for a given user.
   *
   * @param {String} userId - The ID of the user.
   */
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
        // redirect user to the new personal study plan
        navigate(`/studyplan/editor/${studyPlanId}`);
      });
  };

  /**
   * Function to delete a personal study plan.
   *
   * @param {String} studyPlanId - The ID of the study plan to delete.
   */
  const deleteStudyPlan = async (studyPlanId) => {
    try {
      // delete study plan from database
      await fetch(
        `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/${studyPlanId}`,
        {
          method: "DELETE",
        }
      );
      // get updated information and re-render study plan gallery
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
