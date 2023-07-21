import { Menu } from "@headlessui/react";
import { BiSearch, BiChevronDown } from "react-icons/bi";
import { BsFilter } from "react-icons/bs";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import SelectTags from "../StudyPlanEditor/SelectTags";

function StudyPlanSearchBar({
  setSearchValue,
  setOrderingChoice,
  filterRequest,
  setFilterRequest,
}) {
  const [isFilterTabOpen, setIsFilterTabOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center px-2 my-2">
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center px-2 py-1 rounded-md bg-sky-500 text-white hover:bg-sky-600 min-w-max">
          Order by
          <BiChevronDown className="w-5 h-5" />
        </Menu.Button>
        <Menu.Items className="absolute left-0 w-32 bg-white rounded-md shadow-md">
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } w-full rounded-md p-1`}
                  onClick={() => setOrderingChoice("relevancy")}
                >
                  Relevancy
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } w-full rounded-md p-1`}
                  onClick={() => setOrderingChoice("trending")}
                >
                  Trending
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } w-full rounded-md p-1`}
                  onClick={() => setOrderingChoice("mostRecent")}
                >
                  Most Recent
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-sky-500 text-white" : "text-gray-900"
                  } w-full rounded-md p-1`}
                  onClick={() => setOrderingChoice("mostLikes")}
                >
                  Most Likes
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>

      <form
        className="flex-grow flex gap-1 items-center bg-white p-1 pl-2 rounded-md border-2 border-slate-200 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          setSearchValue(event.target.searchInput.value);
        }}
      >
        <input
          type="search"
          name="searchInput"
          placeholder="Search for a study plan"
          className="border-0 outline-0 flex-grow"
        />
        <button>
          <BiSearch className="w-6 h-6" />
        </button>
      </form>

      <div className="relative">
        <Tooltip title="Filter" arrow>
          <div>
            <BsFilter
              className="w-8 h-8 min-w-max min-h-max hover:bg-slate-200 hover:cursor-pointer rounded-md transition"
              onClick={() => setIsFilterTabOpen((previous) => !previous)}
            />
          </div>
        </Tooltip>
        {isFilterTabOpen ? (
          <div className="bg-slate-50 absolute right-0 w-96 rounded-md shadow-md p-3">
            <div className="flex items-center gap-2">
              <h6 className="font-semibold">Filter by Tags</h6>
              <p className="text-sm text-gray-600">
                Select tags to filter study plans by
              </p>
            </div>
            <SelectTags
              academicPlanInformation={filterRequest}
              setAcademicPlanInformation={setFilterRequest}
              isPublisher={false}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default StudyPlanSearchBar;
