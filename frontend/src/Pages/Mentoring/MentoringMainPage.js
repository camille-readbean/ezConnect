import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import Unauthenticated from "../../Components/Unauthenticated";
import { secureApiRequest } from '../../ApiRequest';
import CourseSelector from './CourseSelector';
import { RxPlus } from 'react-icons/rx';
import { MdAdd } from 'react-icons/md';
import { Container, Tabs, Tab, Box, Card, CardActions, Stack, Typography, Button } from '@mui/material'; 

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
  const [filteredMentorPostings, updateFilteredMentorPostings] = useState([]);
  const [filteredMentorRequests, updateFilteredMentorRequests] = useState([])

  // For mentorin ggallery tab view
  const [mentoringGalleryValue, setMentorinngGalleryValue] = useState(0);
  const handleChangeGalleryTabValue = (event, newValue) => {
    setMentorinngGalleryValue (newValue);
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
          updateFilteredMentorPostings(filteredPostingsData.postings);
        } else if (filteredPostingsData.error) {
          console.log(filteredPostingsData.error);
        } else if (filteredPostingsData.detail) {
          console.log(filteredPostingsData.detail);
        }

        if (filteredRequestsData.postings) {
          updateFilteredMentorRequests(filteredRequestsData.postings);
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

  const filterMentorPostingByCourse = (course) => {
    const newListOfPostings = filteredMentorPostings.filter(
      (posting) => posting.course === course
    )
    const newListOfRequests = filteredMentorRequests.filter(
      (posting) => posting.course === course
    )
    updateFilteredMentorRequests(newListOfRequests);
    updateFilteredMentorPostings(newListOfPostings);
  }

  const onPressCreateMentorPosting = (event) => {
    navigate('/mentoring/create-mentor-posting');
  }

  const onPressCreateMentorRequest = (event) => {
    navigate('/mentoring/create-mentor-request');
  }

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
          <Box my={1} marginBottom={2}>
            <h2 className='text-2xl'>Mentoring: </h2>
            <p className='text-slate-500'>These are your requested mentees</p>
            {mentorMatches.length > 0 ? (
              mentorMatches.map((match) => (
                <Card key={match.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%', 
                padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                  <h3>Course: {match.course_code}</h3>
                  <h3>Status: {match.status}</h3>
                  <p>Mentee's name: {match.mentee_name}</p>
                  <p>Email: {match.email}</p>
                  {match.status === 'Pending mentor' && (
                          <Button
                            onClick={() => handleButtonClick(match.posting_uuid, 'matchAccept')}
                          >
                            Accept
                          </Button>
                  )}
                </Card>
              ))
            ) : (
              <p className='text-cyan-600'>Currently not matched with anyone.</p>
            )}
          </Box>

          <Box my={1} marginBottom={2}>  
            <h2 className='text-2xl'>Mentee in: </h2>
            <p className='text-slate-500'>These are your requested mentors</p>
            {menteeMatches.length > 0 ? (
              menteeMatches.map((match) => (
                <Card key={match.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%', 
                padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                  <h3>Course: {match.course_code}</h3>
                  <h3>Status: {match.status}</h3>
                  <p>Mentor's name: {match.mentor_name}</p>
                  <p>Email: {match.email}</p>
                  {match.status === 'Pending mentee' && (
                    <Button
                      onClick={() => handleButtonClick(match.posting_uuid, 'matchAccept')}
                    >
                      Accept
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <p className='text-cyan-600'>Currently not matched with anyone.</p>
            )}
          </Box>
          <hr className='divide-y-4'></hr>

          <Stack direction={'row'} my={1}>
            <h2 className='text-2xl mr-4'>Your Mentor Postings</h2>
            <Button
              onClick={onPressCreateMentorPosting}>
              <MdAdd size={25}/> Create Posting
            </Button>
          </Stack>
          <p className='text-slate-500'>Posts to indicate which courses you are mentoring</p>
          <Box display='flex' gap={'14px'} flexDirection={'row'} flexWrap={'wrap'} my='2em'>
          {userMentorPostings.length > 0 ? (
            userMentorPostings.map((posting) => (
              <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%', 
                  padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                <h3>Course: {posting.course}</h3>
                <h3>Title: {posting.title}</h3>
                <h4>Published: {posting.is_published ? 'Yes' : 'No'}</h4>
                <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                <Button
                  onClick={() => handleButtonClick(posting.posting_uuid, 'updatePosting')}
                >
                  Update
                </Button>
              </Card>
            ))
          ) : (
            <p className='text-cyan-600'>You do not currently have any mentor posting.</p>
          )}
          </Box>
          
          <Stack direction={'row'}>
            <h2 className='text-2xl'>Your Mentor Requests</h2>
              <Button 
              onClick={onPressCreateMentorRequest}>
                <MdAdd size={25}/> Create request
              </Button>
          </Stack>
          <p className='text-slate-500'>Posts to indicate which courses you want a mentor for</p>
          <Box display='flex' gap={'14px'} flexDirection={'row'} flexWrap={'wrap'} my='2em'>
          {userMentorRequests.length > 0 ? (
            userMentorRequests.map((posting) => (
              <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%', 
                  padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                <h3>Course: {posting.course}</h3>
                <h3>Title: {posting.title}</h3>
                <h4>Published: {posting.is_published ? 'Yes' : 'No'}</h4>
                <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                <Button
                  onClick={() => handleButtonClick(posting.posting_uuid, 'updateRequest')}
                >
                  Update
                </Button>
              </Card>
            ))
          ) : (
            <p className='text-cyan-600'>You do not currently have any mentor requests.</p>
          )}
          </Box>     


          <Box sx={{ bgcolor: '#eff2ef', minHeight: 10 + 'em', padding: 10 + 'px'}}>
            <h2 className='text-2xl mr-4 c-1/10'>Find mentors or mentees</h2>
            <p className='text-slate-500 py-2'>Posts in the community</p>
            <CourseSelector updateSelectedCourses={filterMentorPostingByCourse} />
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
                      <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%', 
                          padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                        <h3>Course: {posting.course}</h3>
                        <h3>Ttitle: {posting.title}</h3>
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
                      <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%', 
                          padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                        <h3>Course: {posting.course}</h3>
                        <h3>Ttitle: {posting.title}</h3>
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
