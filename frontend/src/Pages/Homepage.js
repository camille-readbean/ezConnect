import { useMsal, AuthenticatedTemplate, useIsAuthenticated, UnauthenticatedTemplate } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { secureApiRequest } from "../ApiRequest";
import Unauthenticated from "../Components/Unauthenticated";
import { MdAdd } from 'react-icons/md';
import { Container, Tabs, Tab, Box, Card, Stack, Button } from '@mui/material'; 

function Homepage(props) {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [menteeMatches, setMenteeMatches] = useState([]);
  const [mentorMatches, setMentorMatches] = useState([]);
  const [userMentorPostings, setUserMentorPostings] = useState([]);
  const [userMentorRequests, setUserMentorRequests] = useState([]);

  // For user's match tab view
  const [matchesTabValue, setMatchesTabValue] = useState(0);
  const handleChangeMatchesTabValue = (event, newValue) => {
    setMatchesTabValue(newValue);
  };
  // For user's post view
  const [mentoringPostsValue, setMentoringPostsValue] = useState(0);
  const handleChangeMentoringPostsTabValue = (event, newValue) => {
    setMentoringPostsValue(newValue);
  };

  // redirect user to create account if they are a new user
  function checkNewUser() {
    if (isAuthenticated) {
      const checkNewAccount = localStorage.getItem(`${activeAccount.username} ezConnect_new_user`);
      if (activeAccount.idTokenClaims["newUser"] && checkNewAccount !== 'false') {
        localStorage.setItem(`${activeAccount.username} ezConnect_new_user`, 'true');
      }
      const isNewAccount = localStorage.getItem(`${activeAccount.username} ezConnect_new_user`);
      
      if (isNewAccount === 'true' && isAuthenticated) {
        navigate('/user/create-account')
      }
      // Get some data for the home page
      secureApiRequest(
        instance, 
        'GET', 
        '/api/mentoring/matches')
        .then(resp => {
          // setMenteeMatches(resp.mentee_matches);
          // setMentorMatches(resp.mentor_matches);
          if (resp.mentee_matches != null && resp.mentor_matches) { 
          setMenteeMatches(resp.mentee_matches);
          setMentorMatches(resp.mentor_matches);
          } else {
            console.log("Error in getting mentor matches")
            if ("User not found" === resp.error)
              navigate('/user/create-account')
          }
        })
      secureApiRequest(
        instance, 
        'GET', 
        '/api/mentoring/mentors/get-user-mentor-postings')
        .then(resp => resp ? setUserMentorPostings(resp.postings) : console.log("Error in getting mentor posting"))
      secureApiRequest(
        instance, 
        'GET', 
        '/api/mentoring/mentees/get-user-mentor-requests')
        .then(resp => resp ? setUserMentorRequests(resp.postings) : console.log("Error in getting mentor request"))
    }
  }

  useEffect(checkNewUser, [instance, navigate, isAuthenticated]);

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
          <Box sx={{minHeight: 10 + 'em', padding: 10 + 'px', marginBottom: 5 + 'px'}}>
            <h1 className='text-2xl'>Pending / Accepted mentor-mentee matches</h1>
            <Tabs value={matchesTabValue} onChange={handleChangeMatchesTabValue} centered variant="fullWidth">
              <Tab label="Matches as mentor" id='full-width-user-matches-tab-0'/>
              <Tab label="Matches as mentee" id='full-width-user-matches-tab-1'/>
            </Tabs>
            <div role="tabpanel" hidden={matchesTabValue !== 0} id='full-width-user-matches-tab-0'>
              <Box my={1} marginBottom={2}>
                <h2 className='text-lg'>Mentoring: </h2>
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
            </div>
            <div role="tabpanel" hidden={matchesTabValue !== 1} id='full-width-user-matches-tab-1'>
              <Box my={1} marginBottom={2}>  
                <h2 className='text-lg'>Mentee in: </h2>
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
            </div>
          </Box>
          
          <hr className='divide-y-4'></hr>

          <Box sx={{minHeight: 10 + 'em', padding: 10 + 'px', marginBottom: 5 + 'px'}}>
            <h1 className='text-2xl mr-4 c-1/10'>Your mentoring posts / requests</h1>
            <Tabs value={mentoringPostsValue} onChange={handleChangeMentoringPostsTabValue} centered variant="fullWidth">
              <Tab label="Posts as mentor" id='full-width-user-posts-tab-0'/>
              <Tab label="Requests for mentor" id='full-width-user-posts-tab-1'/>
            </Tabs>
            <div role="tabpanel" hidden={mentoringPostsValue !== 0} id='full-width-user-posts-tab-0'>
              <Stack direction={'row'} my={1}>
                <p className='text-slate-500 my-5'>Posts to indicate which courses you are mentoring</p>
                <Button
                  onClick={onPressCreateMentorPosting}>
                  <MdAdd size={25}/> Create Posting
                </Button>
              </Stack>
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
            </div>
            <div role="tabpanel" hidden={mentoringPostsValue !== 1} id='full-width-user-posts-tab-1'>
              <Stack direction={'row'}>
              <p className='text-slate-500 my-5'>Posts to indicate which courses you want a mentor for</p>
                  <Button 
                  onClick={onPressCreateMentorRequest}>
                    <MdAdd size={25}/> Create request
                  </Button>
              </Stack>
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
            </div> 
          </Box>
          <hr></hr>
          <h2 className="text-2xl h-20 text-slate-800">Go to the mentoring tab for to see all mentors and mentees in the community</h2>
        </Container>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated/>
      </UnauthenticatedTemplate>
    </>
  );
}

export default Homepage;
