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
import { AiFillAlert } from 'react-icons/ai';

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
        <div className='flex-wrap bg-zinc-50 ml-4 mr-4 flex-grow'>
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
            <p className='text-cyan-600'>Currently not matched with anyone.</p>
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
            <p className='text-cyan-600'>Currently not matched with anyone.</p>
          )}
          <hr className='divide-y-4'></hr>

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
            <p className='text-cyan-600'>You do not currently have any mentor posting.</p>
          )}
          
          <div className="flex items-left py-2">
            <h2 className='text-2xl mr-4'>User's Mentor Requests</h2>
            <button className="bluebutton py-1 px-1 w-auto"
            onClick={onPressCreateMentorRequest}>
              <RxPlus />
            </button>
          </div>
          <p className='text-slate-500'>Posts to indicate which courses you want a mentor for</p>
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
            <p className='text-cyan-600'>You do not currently have any mentor requests.</p>
          )}
          

          <div className='flex flex-col flex-grow flex-shrink-0'>
            <h2 className='text-2xl mr-4 c-1/10'>Find mentors or mentees</h2>
            <p className='text-slate-500 py-2'>Posts in the community</p>
            <CourseSelector updateSelectedCourses={filterMentorPostingByCourse} />
            <div className='flex justify-center justify-items-center'>
              <div className='w-1/2'>
                <h2>Mentor Requests</h2>
                <div className='max-h-96 overflow-y-auto flex-grow'>
                {filteredMentorRequests.length > 0 ? (
                  filteredMentorRequests.map((posting) => (
                    <div key={posting.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
                      <h3>Course: {posting.course}</h3>
                      <h3>Ttitle: {posting.title}</h3>
                      <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                      <p>By: {posting.name}</p>
                      {posting.name !== name && (
                        <button
                          onClick={() => handleButtonClick(posting.posting_uuid, 'matchRequest')}
                          className='bluebutton py-1 px-1 w-auto'
                        >
                          Match
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className='text-cyan-600 h-40'>No mentor requests right now.</p>
                )}
                </div>
              </div>
              <div className='w-1/2'>
                <h2>Mentor Posts</h2>
                <div className='max-h-96 overflow-y-auto flex-grow'>
                {filteredMentorPostings.length > 0 ? (
                  filteredMentorPostings.map((posting) => (
                    <div key={posting.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
                      <h3>Course: {posting.course}</h3>
                      <h3>Ttitle: {posting.title}</h3>
                      <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                      <p>By: {posting.name}</p>
                      {posting.name !== name && (
                        <button
                          onClick={() => handleButtonClick(posting.posting_uuid, 'matchPosting')}
                          className='bluebutton py-1 px-1 w-auto'
                        >
                          Match
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className='text-cyan-600 h-40'>No mentor requests right now.</p>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}

export default MentoringMainPage;
