import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { secureApiRequest } from "../../ApiRequest";
import Unauthenticated from "../../Components/Unauthenticated";

// Mentee requesting for a mentor
function RequestMentor() {
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
    setIsPublished(event.target.checked);
  };

  const handleRequest = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');

    // const request_body = {
    //   title: event.target.title.value,
    //   description: event.target.description.value,
    //   is_published: isPublished
    // }
    
    secureApiRequest(instance, "POST", `/api/mentoring/mentees/${posting_id}/update`)
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
          <h1 className="text-lg font-bold text-center">Update a mentor request</h1>
          <center className='text-slate-500 py-2'>
          This lets people know your interest having a mentor for a particular subject <br/>
            Only your name is shared, your email is not revealed till you accept a mentor <br/>
            When a mentor acepts, they can give you their contact details so you can communicate <br/>
            in real life
          </center>
          <hr className="my-3"></hr>
          <h3>Course: {currentPost.course}</h3>
          <form onSubmit={handleRequest}>
            <p>
                <label htmlFor="title">Title</label>
                <span>{currentPost.title}</span>
            </p>

            <p>
                <label htmlFor="description">Description</label>
                <span>{currentPost.description}</span>
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
              Request to be their mentee
            </button>
          </form>

          {responseMessage && <p className="text-gray-600">{responseMessage}</p>}
        </AuthenticatedTemplate>
      </section>
    </div>
  );
}

export default RequestMentor;
