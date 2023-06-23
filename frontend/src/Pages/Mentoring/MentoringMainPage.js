import React, { useEffect, useState } from 'react';
import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import Unauthenticated from "../../Components/Unauthenticated";
import { secureApiRequest } from '../../ApiRequest';
import CourseSelector from './CourseSelector';
import { RxPlus } from 'react-icons/rx';

function MentoringMainPage() {
  // obtain user_id of current user
  const { instance } = useMsal();
  // const activeAccount = instance.getActiveAccount();


  // let [selectedCourse, updateSelectedCourse] = useState(null);

  const [menteeMatches, setMenteeMatches] = useState([]);
  const [mentorMatches, setMentorMatches] = useState([]);
  const [userMentorPostings, setUserMentorPostings] = useState([]);
  const [userMentorRequests, setUserMentorRequests] = useState([]);
  const [filteredMentorPostings, updateFilteredMentorPostings] = useState([]);
  const [filteredMentorRequests, updateFilteredMentorRequests] = useState([])

  useEffect(() => {
    secureApiRequest(
      instance,
      'GET',
      '/api/mentoring/matches'
    ).then((data) => {
      if (data.mentor_matches && data.mentee_matches) {
        setMenteeMatches(data.mentee_matches);
            setMentorMatches(data.mentor_matches);
      } else if (data.error) {
        console.log(data.error)
      } else if (data.detail) {
        console.log(data.detail)
      }
    })

    secureApiRequest(
      instance,
      'GET',
      '/api/mentoring/mentors/get-user-mentor-postings'
    ).then((data) => {
      if (data.postings) {
        setUserMentorPostings(data.postings);
      } else if (data.error) {
        console.log(data.error)
      } else if (data.detail) {
        console.log(data.detail)
      }
    });

    secureApiRequest(
      instance,
      'GET',
      '/api/mentoring/mentees/get-user-mentor-requests'
    ).then((data) => {
      if (data.postings) {
        setUserMentorRequests(data.postings);
      } else if (data.error) {
        console.log(data.error)
      } else if (data.detail) {
        console.log(data.detail)
      }
    });


    secureApiRequest(
      instance,
      'GET',
      '/api/mentoring/mentors'
    ).then((data) => {
      if (data.postings) {
        updateFilteredMentorPostings(data.postings)
      } else if (data.error) {
        console.log(data.error)
      } else if (data.detail) {
        console.log(data.detail)
      }
    });

    secureApiRequest(
      instance,
      'GET',
      '/api/mentoring/mentees'
    ).then((data) => {
      if (data.postings) {
        updateFilteredMentorRequests(data.postings)
      } else if (data.error) {
        console.log(data.error)
      } else if (data.detail) {
        console.log(data.detail)
      }
    })}, [instance]);

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

  // const filteredMentorPostings = userMentorPostings.filter(
  //   (posting) => !selectedCourse || posting.course === selectedCourse.value
  // );

  // const filteredMentorRequests = mentorRequests.filter(
  //   (request) => !selectedCourse || request.course === selectedCourse.value
  // );

  return (
    <>
      <AuthenticatedTemplate>
        <div className='h-screen flex-wrap bg-zinc-50 ml-4 mr-4'>
          <h2 className='text-2xl'>Mentoring: </h2>
          <p className='text-slate-500'>These are your requested mentees</p>
          {mentorMatches.length > 0 ? (
            mentorMatches.map((match) => (
              <div key={match.id}>
                <h3>{match.title}</h3>
                <p>{match.description}</p>
                <p>Mentee's name: {match.name}</p>
                <p>Email: {match.email}</p>
              </div>
            ))
          ) : (
            <p className='text-slate-700'>Currently not matched with anyone.</p>
          )}
          <h2 className='text-2xl'>Mentee in: </h2>
          <p className='text-slate-500'>These are your requested mentors</p>
          {menteeMatches.length > 0 ? (
            menteeMatches.map((match) => (
              <div key={match.id}>
                <h3>{match.title}</h3>
                <p>{match.description}</p>
                <p>{match.email}</p>
              </div>
            ))
          ) : (
            <p className='text-cyan-600'>Currently not matched with anyone.</p>
          )}
          <hr className='divide-y-4'></hr>

          <div className="flex items-left py-2">
            <h2 className='text-2xl mr-4'>User's Mentor Postings</h2>
            <button className="bluebutton py-1 px-1 w-auto">
              <RxPlus />
            </button>
          </div>
          <p className='text-cyan-600'>Posts to indicate which courses you are mentoring</p>
          {userMentorPostings.length > 0 ? (
            userMentorPostings.map((match) => (
              <div key={match.id}>
                <h3>{match.title}</h3>
                <p>{match.description}</p>
                <p>{match.email}</p>
              </div>
            ))
          ) : (
            <p className='text-cyan-600'>You do not currently have any mentor posting.</p>
          )}
          
          <div className="flex items-left py-2">
            <h2 className='text-2xl mr-4'>User's Mentor Requests</h2>
            <button className="bluebutton py-1 px-1 w-auto">
              <RxPlus />
            </button>
          </div>
          <p className='text-slate-500'>Posts to indicate which courses you want a mentor for</p>
          {userMentorRequests.length > 0 ? (
            userMentorRequests.map((match) => (
              <div key={match.id}>
                <h3>{match.title}</h3>
                <p>{match.description}</p>
                <p>{match.email}</p>
              </div>
            ))
          ) : (
            <p className='text-cyan-600'>You do not currently have any mentor requests.</p>
          )}
          


          <CourseSelector updateSelectedCourses={filterMentorPostingByCourse} />
          {filteredMentorPostings.map((posting) => (
            <div key={posting.id}>
              <h3>{posting.title}</h3>
              <p>Mentor</p>
            </div>
          ))}
          <h2>Mentor Requests</h2>
          {filteredMentorRequests.map((request) => (
            <div key={request.id}>
              <h3>{request.title}</h3>
              <p>Mentee</p>
            </div>
          ))}
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Unauthenticated />
      </UnauthenticatedTemplate>
    </>
  );
}

export default MentoringMainPage;
