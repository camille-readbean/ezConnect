import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { secureApiRequest } from "../../ApiRequest";
import CourseSelector from './CourseSelector';
import Unauthenticated from "../../Components/Unauthenticated";
import { Breadcrumbs, Link, Typography } from '@mui/material';

function CreateMentorPosting() {
  const [responseMessage, setResponseMessage] = useState("");
  const [course, setCourse] = useState([]);
  
  const { instance } = useMsal();
  const navigate = useNavigate();
  
  const handleCreatePost = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');

    const request_body = {
      title: event.target.title.value,
      description: event.target.description.value,
      course_code: course.course_code
    }
    console.log(`${request_body.course_code}`)
    // if (event.target.programme.value) {
    //   request_body.programme = event.target.programme.value;
    // }
    
    secureApiRequest(instance, "PUT", '/api/mentoring/mentors/new-mentor', request_body)
      .then((data) => {
          if (data.message) {
            setResponseMessage(data.message);
            navigate('/mentoring');
          } else if (data.error) {
            setResponseMessage(data.error);
          } else if (data.detail) {
            setResponseMessage(data.detail);
          }
      })

    
  };

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center flex">
      <section className="w-96 p-6 shadow-lg bg-white rounded-md">
        <UnauthenticatedTemplate>
          <Unauthenticated />
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <h1 className="text-lg font-bold text-center">Create a mentor posting</h1>
          <center className='text-slate-500 py-2'>
            This lets people know your interest in mentoring a particular subject <br/>
            Only your name is shared, your email is not revealed till you accept a mentee <br/>
            When a mentee acepts, they can give you their contact details so you can communicate <br/>
            in real life
          </center>
          <hr className="my-3"></hr>

          <CourseSelector onChangeFunc={setCourse}></CourseSelector>
          <form onSubmit={handleCreatePost}>
            <p>
              <label for="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Post Ttitle"
                className="createaccountinputbox flex"
                required
                tabIndex="1"
              />
            </p>

            <p>
              <label for="description">Description</label>
              <textarea
                name="description"
                id="description"
                placeholder="Tell us more about yourself!"
                className="createaccountinputbox flex w-5/6 block p-2 border border-gray-300 rounded-lg resize-none"
                rows='4'
                required
                tabIndex="2"
              />
            </p>


            <button
              type="submit"
              className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
              tabIndex="3"
            >
              Submit
            </button>

            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="always" color="inherit" href="/homepage">
                Home
              </Link>
              <Link
                underline="always"
                color="inherit"
                href="/mentoring"
              >
                Mentoring
              </Link>
              <Typography color="text.primary">Create mentor postings</Typography>
            </Breadcrumbs>
          </form>

          {responseMessage && <p className="text-gray-600">{responseMessage}</p>}
        </AuthenticatedTemplate>
      </section>
    </div>
  );
}

export default CreateMentorPosting;
