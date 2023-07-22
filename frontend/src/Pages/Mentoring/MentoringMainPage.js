import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import Unauthenticated from "../../Components/Unauthenticated";
import { secureApiRequest } from '../../ApiRequest';
// import CourseSelector from './CourseSelector';
import { Container, Tabs, Tab, Box, Card, CardActions, Typography, Button, Divider } from '@mui/material'; 
import courseOptions from "../../courses.json";
import Select from "react-select";
import MatchesTab from './MatchesTab';
import UserTab from './UserTab';

const filterCourseOptions = (inputValue) => {
  return courseOptions.filter(
    function (course) {
      if (this.count >= 10) {
        return false;
      }

      const courseCode = course["course_code"].toLowerCase();
      const courseName = course["course_name"].toLowerCase();
      const isInCourseCode = () =>
        courseCode.startsWith(inputValue.toLowerCase());
      const isInCourseName = () =>
        courseName.includes(inputValue.toLowerCase());

      if (isInCourseCode() || isInCourseName()) {
        this.count++;
        return true;
      }
      return false;
    },
    { count: 0 }
  );
};

function MentoringMainPage() {
  // obtain user_id of current user
  const { instance } = useMsal();
  
  if (instance.getActiveAccount() === null) {
    instance.loginRedirect()
  }
  const name = instance.getActiveAccount().name;

  const [menteeMatches, setMenteeMatches] = useState([]);
  const [mentorMatches, setMentorMatches] = useState([]);
  const [userMentorPostings, setUserMentorPostings] = useState([]);
  const [userMentorRequests, setUserMentorRequests] = useState([]);
  const [allPubMentorPostings, updateAllPubMentorPostings] = useState([]);
  const [allPubMentorRequests, updateAllPubMentorRequests] = useState([]);


  // For mentoring gallery tab view
  const [mentoringGalleryValue, setMentorinngGalleryValue] = useState(0);
  const handleChangeGalleryTabValue = (event, newValue) => {
    setMentorinngGalleryValue(newValue);
  };
  // filtered one
  const [filteredMentorPostings, updateFilteredMentorPostings] = useState([]);
  const [filteredMentorRequests, updateFilteredMentorRequests] = useState([]);
  const [courseToFilterBy, setCourseToFilterBy] = useState('');

  const [searchResults, setSearchResults] = useState([]);

  const loadOptions = (inputValue, callback) => {
    const filteredOptions = filterCourseOptions(inputValue);
    setSearchResults(filteredOptions);
    callback(filteredOptions);
  };

  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchesData = await secureApiRequest(instance, 'GET', '/api/mentoring/matches');
        const postingsData = await secureApiRequest(instance, 'GET', '/api/mentoring/mentors/get-user-mentor-postings');
        const requestsData = await secureApiRequest(instance, 'GET', '/api/mentoring/mentees/get-user-mentor-requests');
        const filteredPostingsData = await secureApiRequest(instance, 'GET', '/api/mentoring/mentors');
        const filteredRequestsData = await secureApiRequest(instance, 'GET', '/api/mentoring/mentees');

        if (matchesData.mentor_matches && matchesData.mentee_matches) {
          setMenteeMatches(matchesData.mentee_matches);
          setMentorMatches(matchesData.mentor_matches);
        } else if (matchesData.error) {
          console.log(matchesData.error);
          if (matchesData.error.includes("User not found")) {
            console.log("User not found, redirecting to create account");
            navigate('/user/create-account');
          }
        } else if (matchesData.detail) {
          console.log(matchesData.detail);
        }

        if (postingsData.postings) {
          setUserMentorPostings(postingsData.postings);
        } else if (postingsData.error) {
          console.log(postingsData.error);
        } else if (postingsData.detail) {
          console.log(postingsData.detail);
        }

        if (requestsData.postings) {
          setUserMentorRequests(requestsData.postings);
        } else if (requestsData.error) {
          console.log(requestsData.error);
        } else if (requestsData.detail) {
          console.log(requestsData.detail);
        }

        if (filteredPostingsData.postings) {
          updateAllPubMentorPostings(filteredPostingsData.postings);
          updateFilteredMentorPostings(allPubMentorPostings);
        } else if (filteredPostingsData.error) {
          console.log(filteredPostingsData.error);
        } else if (filteredPostingsData.detail) {
          console.log(filteredPostingsData.detail);
        }
        
        if (filteredRequestsData.postings) {
          updateAllPubMentorRequests(filteredRequestsData.postings);
          updateFilteredMentorRequests(allPubMentorRequests);
        } else if (filteredRequestsData.error) {
          console.log(filteredRequestsData.error);
        } else if (filteredRequestsData.detail) {
          console.log(filteredRequestsData.detail);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
    }, []);

  useEffect(() => {
    console.log('Filtered posting use effect triggered');
    var course = courseToFilterBy;
    if (course !== null && course !== '') {
      course = course.course_code;
      console.log(course)
      const newListOfPostings = allPubMentorPostings.filter(
        (posting) => posting.course === course
      );
      const newListOfRequests = allPubMentorRequests.filter(
        (posting) => posting.course === course
      )
      updateFilteredMentorRequests(newListOfRequests);
      updateFilteredMentorPostings(newListOfPostings);
    } else {
      updateFilteredMentorRequests(allPubMentorRequests);
      updateFilteredMentorPostings(allPubMentorPostings);
    }
  }, [allPubMentorPostings, allPubMentorRequests, courseToFilterBy, setCourseToFilterBy]);


  function handleButtonClick(matchId, action) {
    // Perform actions based on the matchId
    switch (action) {
      case 'updatePosting':
        navigate(`/mentoring/mentors/${matchId}/update`);
        break
      case 'updateRequest':
        navigate(`/mentoring/mentees/${matchId}/update`);
        break
      case 'matchPosting':
        navigate(`/mentoring/mentors/${matchId}/request`);
        break
      case 'matchRequest':
        navigate(`/mentoring/mentees/${matchId}/request`);
        break
      case 'matchAccept':
        navigate(`/mentoring/matches/accept?match=${matchId}`);
        break
      default:
        console.log('Card button pressed but nothing done')
    }
  }

  return (
    <>
      <AuthenticatedTemplate>
        <Container>
          <MatchesTab 
            menteeMatches={menteeMatches} 
            mentorMatches={mentorMatches} 
            handleButtonClick={handleButtonClick}/>

          <Divider />

          <UserTab 
            navigate={navigate}
            userMentorPostings={userMentorPostings}
            userMentorRequests={userMentorRequests}
            handleButtonClick={handleButtonClick}/>

          <Divider />

          <Box sx={{ minHeight: 10 + 'em', padding: 10 + 'px'}} className="bg-slate-50 rounded-md my-2">
            <h2 className='text-2xl mr-4 c-1/10 font-semibold'>Find mentors or mentees</h2>
            <p className='text-slate-500 py-2'>Posts in the community</p>
            <Select
              options={searchResults}
              filterOption={() => true}
              isClearable
              isSearchable
              getOptionLabel={(option) =>
                option.course_code + " " + option.course_name
              }
              getOptionValue={(option) => option.course_code}
              placeholder="Search for a course"
              noOptionsMessage={() => "No courses found"}
              onInputChange={(inputValue) => loadOptions(inputValue, () => {})}
              onChange={(course) => setCourseToFilterBy(course)}
            />
            <Box sx={{ bgcolor: '#D6EFFF', borderBottom: 1, borderColor: 'divider'}}>
              <Tabs value={mentoringGalleryValue} onChange={handleChangeGalleryTabValue} centered variant="fullWidth">
                <Tab label="Find mentees" id='full-width-tab-0'/>
                <Tab label="Find mentors" id='full-width-tab-1'/>
              </Tabs>
            </Box>
                <div role="tabpanel" hidden={mentoringGalleryValue !== 0} id='full-width-tabpanel-0'>
                  <Typography sx={{my: 1}} className='text-slate-500'>Find mentees below and request to a match with them as their mentor</Typography>
                  <Box display='flex' gap={'14px'} flexDirection={'row'} flexWrap={'wrap'} my='2em'>
                  {filteredMentorRequests.length > 0 ? (
                    filteredMentorRequests.map((posting) => (
                      <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%',  maxWidth: '30%', overflow: 'auto',
                      flex: 'flex-grow', flexDirection: 'column', padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                        <h3>Course: {posting.course}</h3>
                        <h3>Title: {posting.title}</h3>
                        <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                        <p>By: {posting.name}</p>
                        {posting.name !== name && (
                          <Button
                            onClick={() => handleButtonClick(posting.posting_uuid, 'matchRequest')}
                            className='bluebutton py-1 px-1 w-auto'
                          >
                            Request to be their mentor
                          </Button>
                        )}
                      </Card>
                    ))
                  ) : (
                    <p className='text-cyan-600 h-40'>No mentor requests right now.</p>
                  )}
                  </Box>
                </div>
                <div role="tabpanel" hidden={mentoringGalleryValue !== 1} id='full-width-tabpanel-1'>
                  <Typography sx={{my: 1}} className='text-slate-500'>Find mentors below and request to a match with them as their mentee</Typography>
                  <Box display='flex' gap={'14px'} flexDirection={'row'} flexWrap={'wrap'} my='2em'>
                  {filteredMentorPostings.length > 0 ? (
                    filteredMentorPostings.map((posting) => (
                      <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%',  maxWidth: '30%', overflow: 'auto',
                      flex: 'flex-grow', flexDirection: 'column', padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                        <h3>Course: {posting.course}</h3>
                        <h3>Title: {posting.title}</h3>
                        <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                        <p>By: {posting.name}</p>
                        <CardActions>
                        {posting.name !== name && (
                          <Button
                            onClick={() => handleButtonClick(posting.posting_uuid, 'matchPosting')}
                          >
                            Request to be their mentee
                          </Button>
                        )}
                        </CardActions>
                      </Card>
                    ))
                  ) : (
                    <p className='text-cyan-600 h-40'>No mentor requests right now.</p>
                  )}
                  </Box>
                </div>
              
            
          </Box>
        </Container>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}

export default MentoringMainPage;
