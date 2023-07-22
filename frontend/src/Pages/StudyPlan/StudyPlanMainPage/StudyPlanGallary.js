import { useState, useEffect } from "react";
import StudyPlanList from "./StudyPlanList";
import StudyPlanSearchBar from "./StudyPlanSearchBar";

function StudyPlanGallery({ azure_ad_oid, isFetchAgain, setIsFetchAgain }) {
  const [studyPlans, setStudyPlans] = useState([]);
  const [filteredStudyPlans, setFilteredStudyPlans] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  // Ordering Choices: mostRecent, mostLikes, relevancy, trending
  const [orderingChoice, setOrderingChoice] = useState("mostRecent");
  const [isLoading, setIsLoading] = useState(false);

  const defaultFilterRequest = {
    first_degree: null,
    minors: [],
    second_degree: null,
    second_major: "",
    special_programmes: [],
  };
  const [filterRequest, setFilterRequest] = useState(defaultFilterRequest);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `${process.env.REACT_APP_API_ENDPOINT}/api/studyplan/publish?user_id=${azure_ad_oid}&ordering=${orderingChoice}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStudyPlans(data["published_study_plans"]);
        setFilteredStudyPlans(data["published_study_plans"]);
        setIsLoading(false);
      });
  }, [azure_ad_oid, orderingChoice, isFetchAgain]);

  // Filter study plans
  useEffect(() => {
    console.log(filterRequest);
    let filteredStudyPlans = studyPlans;

    if (filterRequest.first_degree != null) {
      filteredStudyPlans = filteredStudyPlans.filter((studyPlan) =>
        studyPlan.academic_plan == null
          ? false
          : studyPlan.academic_plan.first_degree.id ===
            filterRequest.first_degree.id
      );
    }

    if (filterRequest.second_degree != null) {
      filteredStudyPlans = filteredStudyPlans.filter((studyPlan) =>
        studyPlan.academic_plan == null ||
        studyPlan.academic_plan.second_degree == null
          ? false
          : studyPlan.academic_plan.second_degree.id ===
            filterRequest.second_degree.id
      );
    }

    if (filterRequest.second_major != null) {
      filteredStudyPlans = filteredStudyPlans.filter((studyPlan) =>
        studyPlan.academic_plan == null ||
        studyPlan.academic_plan.second_major == null
          ? false
          : studyPlan.academic_plan.second_major
              .toLowerCase()
              .includes(filterRequest.second_major.toLowerCase())
      );
    }

    if (filterRequest.minors != null && filterRequest.minors !== []) {
      filteredStudyPlans = filteredStudyPlans.filter((studyPlan) => {
        if (
          studyPlan.academic_plan == null ||
          studyPlan.academic_plan.minors === []
        ) {
          return false;
        } else {
          for (let i = 0; i < filterRequest.minors.length; i++) {
            const minor = filterRequest.minors[i];
            let isMinorInStudyPlan = false;
            for (let j = 0; j < studyPlan.academic_plan.minors.length; j++) {
              const currMinor = studyPlan.academic_plan.minors[j];
              if (currMinor.id === minor.id) {
                isMinorInStudyPlan = true;
              }
            }
            if (!isMinorInStudyPlan) {
              return false;
            }
          }
          return true;
        }
      });
    }

    if (
      filterRequest.special_programmes != null &&
      filterRequest.special_programmes !== []
    ) {
      filteredStudyPlans = filteredStudyPlans.filter((studyPlan) => {
        if (
          studyPlan.academic_plan == null ||
          studyPlan.academic_plan.special_programmes === []
        ) {
          return false;
        } else {
          for (let i = 0; i < filterRequest.special_programmes.length; i++) {
            const specialProgramme = filterRequest.special_programmes[i];
            let isSpecialProgrammeInStudyPlan = false;
            for (
              let j = 0;
              j < studyPlan.academic_plan.special_programmes.length;
              j++
            ) {
              const currSpecialProgramme =
                studyPlan.academic_plan.special_programmes[j];
              if (currSpecialProgramme.id === specialProgramme.id) {
                isSpecialProgrammeInStudyPlan = true;
              }
            }
            if (!isSpecialProgrammeInStudyPlan) {
              return false;
            }
          }
          return true;
        }
      });
    }

    setFilteredStudyPlans(filteredStudyPlans);
  }, [studyPlans, filterRequest]);

  return (
    <div className="bg-slate-50 px-10 sm:px-20 pb-10 sm:py-10">
      <h1 className="text-2xl font-semibold pb-3">Browse Study Plans</h1>

      <div className="container m-auto">
        <StudyPlanSearchBar
          setSearchValue={setSearchValue}
          setOrderingChoice={setOrderingChoice}
          filterRequest={filterRequest}
          setFilterRequest={setFilterRequest}
        />

        {isLoading ? (
          <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full rounded-lg">
            <p className="text-lg m-2">Loading published study plans...</p>
          </div>
        ) : filteredStudyPlans.length > 0 ? (
          <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg min-h-[256px]">
            <StudyPlanList
              studyPlans={filteredStudyPlans}
              azure_ad_oid={azure_ad_oid}
              searchValue={searchValue}
              setIsFetchAgain={setIsFetchAgain}
            />
          </div>
        ) : (
          <div className="bg-white shadow-md flex flex-col items-center justify-center h-64 w-full">
            <p>There are no study plans found...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyPlanGallery;
