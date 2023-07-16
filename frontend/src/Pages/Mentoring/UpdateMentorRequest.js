import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { secureApiRequest } from "../../ApiRequest";
import Unauthenticated from "../../Components/Unauthenticated";
import { Breadcrumbs, Link, Typography } from '@mui/material';

function UpdateMentorRequest() {
  const [responseMessage, setResponseMessage] = useState("");
  const { posting_id } = useParams();
  const [currentPost, setCurrentPost] = useState({
    course: '',
    title: '',
    description: '',
    is_published: false
  });
  const [isPublished, setIsPublished] = useState(false);

  const { instance } = useMsal();
  const navigate = useNavigate();
  
  useEffect( () => {
    secureApiRequest(
        instance, 
        'GET', 
        '/api/mentoring/mentees/get-user-mentor-requests')
        .then(resp => resp.postings
            .filter(post => post.posting_uuid === posting_id)
            .map(post => setCurrentPost(post))[0])
    }, []
  )

  const handleCheckboxChange = (event) => {
    const { checked } = event.target;
    setCurrentPost((prevPost) => ({
      ...prevPost,
      is_published: checked,
    }));
  };

  const handleUpdateRequest = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');

    const request_body = {
      title: event.target.title.value,
      description: event.target.description.value,
      is_published: currentPost.is_published
    }
    // if (event.target.programme.value) {
    //   request_body.programme = event.target.programme.value;
    // }
    
    secureApiRequest(instance, "PUT", `/api/mentoring/mentees/${posting_id}/update`, request_body)
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
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <section className="w-full sm:max-w-lg p-6 m-5 shadow-lg bg-white rounded-md">
        <UnauthenticatedTemplate>
          <Unauthenticated />
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <h1 className="text-lg font-bold text-center">Update a mentor request</h1>
          <center className='text-slate-500 py-2'>
          This lets people know your interest having a mentor for a particular subject <br/>
            Only your name is shared, your email is not revealed till you accept a mentor <br/>
            When a mentor acepts, they can give you their contact details so you can communicate <br/>
            in real life
          </center>
          <hr className="my-3"></hr>
          <h3>Course: {currentPost.course}</h3>
          <form onSubmit={handleUpdateRequest}>
            <p>
              <label for="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Post Title"
                className="createaccountinputbox flex"
                value={currentPost.title}
                required
                tabIndex="1"
                onChange={(event) => setCurrentPost({ ...currentPost, title: event.target.value })}
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
                value={currentPost.description}
                tabIndex="2"
                onChange={(event) => setCurrentPost({ ...currentPost, description: event.target.value })}
              />
            </p>

            <p>
            <label>
                <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={currentPost.is_published}
                onChange={handleCheckboxChange}
                className="px-2 py-2"
                />
                Is published?
            </label>
            </p>

            <button
              type="submit"
              className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
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
              <Typography color="text.primary">Update mentor request</Typography>
            </Breadcrumbs>
          </form>

          {responseMessage && <p className="text-gray-600">{responseMessage}</p>}
        </AuthenticatedTemplate>
      </section>
    </div>
  );
}

export default UpdateMentorRequest;
