import { GrUserWorker } from "react-icons/gr";
import { useMsal, AuthenticatedTemplate, useIsAuthenticated, UnauthenticatedTemplate } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { secureApiRequest } from "../ApiRequest";
import { RxPlus } from 'react-icons/rx';
import Unauthenticated from "../Components/Unauthenticated";

function Homepage(props) {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [menteeMatches, setMenteeMatches] = useState([]);
  const [mentorMatches, setMentorMatches] = useState([]);
  const [userMentorPostings, setUserMentorPostings] = useState([]);
  const [userMentorRequests, setUserMentorRequests] = useState([]);

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
          setMenteeMatches(resp.mentee_matches);
          setMentorMatches(resp.mentor_matches);
        })
      secureApiRequest(
        instance, 
        'GET', 
        '/api/mentoring/mentors/get-user-mentor-postings')
        .then(resp => setUserMentorPostings(resp.postings))
      secureApiRequest(
        instance, 
        'GET', 
        '/api/mentoring/mentees/get-user-mentor-requests')
        .then(resp => setUserMentorRequests(resp.postings))
    }
  }

  useEffect(checkNewUser, [instance, navigate, isAuthenticated]);

  const onPressCreateMentorPosting = (event) => {
    navigate('/mentoring/create-mentor-posting');
  }
  const onPressCreateMentorRequest = (event) => {
    navigate('/mentoring/create-mentor-requests');
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
    <div className="flex-wrap bg-zinc-50 ml-4 mr-4 flex-grow">
      <AuthenticatedTemplate>
        {activeAccount ? (
          <h1 className="text-2xl p-3">Hello, <span className="text-teal-600">{activeAccount.idTokenClaims.name}</span></h1>
        ) : null}
        <h2 className='text-2xl'>Mentoring: </h2>
          <p className='text-slate-500'>These are your requested mentees</p>
          {mentorMatches.length > 0 ? (
            mentorMatches.map((match) => (
              <div key={match.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
                <h3>Course: {match.course_code}</h3>
                <h3>Status: {match.status}</h3>
                <p>Mentee's name: {match.mentee_name}</p>
                <p>Email: {match.email}</p>
                {match.status === 'Pending mentor' && (
                        <button
                          onClick={() => handleButtonClick(match.posting_uuid, 'matchAccept')}
                          className='bluebutton py-1 px-1 w-auto'
                        >
                          Accept
                        </button>
                )}
              </div>
            ))
          ) : (
            <p className='text-cyan-600 h-20'>Currently not matched with anyone.</p>
          )}
          <h2 className='text-2xl'>Mentee in: </h2>
          <p className='text-slate-500'>These are your requested mentors</p>
          {menteeMatches.length > 0 ? (
            menteeMatches.map((match) => (
              <div key={match.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
                      <h3>Course: {match.course_code}</h3>
                      <h3>Status: {match.status}</h3>
                      <p>Mentor's name: {match.mentor_name}</p>
                      <p>Email: {match.email}</p>
                      {match.status === 'Pending mentee' && (
                  <button
                    onClick={() => handleButtonClick(match.posting_uuid, 'matchAccept')}
                    className='bluebutton py-1 px-1 w-auto'
                  >
                    Accept
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className='text-cyan-600 h-20'>Currently not matched with anyone.</p>
          )}
          <hr className='divide-y-4'></hr>
          <hr className="p-3"/>
          <div className="flex items-left py-2">
            <h2 className='text-2xl mr-4'>User's Mentor Postings</h2>
            <button className="bluebutton py-1 px-1 w-auto"
              onClick={onPressCreateMentorPosting}>
              <RxPlus />
            </button>
          </div>
          <p className='text-slate-500'>Posts to indicate which courses you are mentoring</p>
          {userMentorPostings.length > 0 ? (
            userMentorPostings.map((posting) => (
              <div key={posting.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
                      <h3>Course: {posting.course}</h3>
                      <h3>Title: {posting.title}</h3>
                      <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                      <button
                        onClick={() => handleButtonClick(posting.posting_uuid, 'updatePosting')}
                        className='bluebutton py-1 px-1 w-auto'
                      >
                        Update
                      </button>
              </div>
            ))
          ) : (
            <p className='text-cyan-600 h-20'>You do not currently have any mentor posting.</p>
          )}
          <div className="flex items-left py-2">
            <h2 className='text-2xl mr-4'>User's Mentor Requests</h2>
            <button className="bluebutton py-1 px-1 w-auto"
            onClick={onPressCreateMentorRequest}>
              <RxPlus />
            </button>
          </div>
          <p className='text-slate-500 h-20'>Posts to indicate which courses you want a mentor for</p>
          {userMentorRequests.length > 0 ? (
            userMentorRequests.map((posting) => (
              <div key={posting.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
                      <h3>Course: {posting.course}</h3>
                      <h3>Title: {posting.title}</h3>
                      <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                      <button
                        onClick={() => handleButtonClick(posting.posting_uuid, 'updateRequest')}
                        className='bluebutton py-1 px-1 w-auto'
                      >
                        Update
                      </button>
              </div>
            ))
          ) : (
            <p className='text-cyan-600 h-20'>You do not currently have any mentor requests.</p>
          )}
          <hr></hr>
          <h2 className="text-2xl h-20 text-slate-800">Go to the mentoring tab for to see all mentors and mentees in the community</h2>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated/>
      </UnauthenticatedTemplate>
    </div>
  );
}

export default Homepage;
