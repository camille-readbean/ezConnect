import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { secureApiRequest } from "../../ApiRequest";
import Unauthenticated from "../../Components/Unauthenticated";
import { Breadcrumbs, Link, Typography } from '@mui/material';

// Request a mentee, aka applying to a mentor request
function RequestMentee() {
  const [responseMessage, setResponseMessage] = useState("");
  const { posting_id } = useParams();
  const [currentPost, setCurrentPost] = useState({
    course: '',
    title: '',
    description: '',
    is_published: false
  });

  const { instance } = useMsal();
  const navigate = useNavigate();
  
  useEffect( () => {
    secureApiRequest(
        instance, 
        'GET', 
        `/api/mentoring/mentees/${posting_id}`)
        .then(resp => setCurrentPost(resp))
    }, []
  )

  const handleRequest = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');
    
    secureApiRequest(instance, "POST", `/api/mentoring/mentees/${posting_id}/request`)
      .then((data) => {
          if (data.message) {
            setResponseMessage(data.message);
            // navigate('/mentoring');  
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
          <h1 className="text-lg font-bold text-center">Request to be {currentPost.name}'s' mentor</h1>
          <center className='text-slate-500 py-2'>
          We will send them an email informing them of your request once you submit the request<br/>
          When the mentee acepts, they can give you their contact details so you can communicate <br/>
          in real life
          </center>
          <hr className="my-3"></hr>
          <h3>Course: {currentPost.course}</h3>
          <form onSubmit={handleRequest}>
          <h3>Title: {currentPost.title}</h3>
          <p className='text-slate-500 py-2'>Description: {currentPost.description}</p>

            <p>
                <label>
                <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={currentPost.is_published}
                    className="px-2 py-2 pointer-events-none opacity-50"
                />
                Is published?
                </label>
            </p>


            <button
              type="submit"
              className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
            >
              Request to be their mentor
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
              <Typography color="text.primary">Request a mentee</Typography>
            </Breadcrumbs>
          </form>

          {responseMessage && <p className="text-gray-600">{responseMessage}</p>}
        </AuthenticatedTemplate>
      </section>
    </div>
  );
}

export default RequestMentee;
