import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { secureApiRequest } from "../../ApiRequest";
import Unauthenticated from "../../Components/Unauthenticated";

// Request a mentor, aka applying to a mentor posting
function AcceptMatch() {
  const [responseMessage, setResponseMessage] = useState("");
  const [currentPost, setCurrentPost] = useState({
    'posting_uuid' : '',
    'course_code' : '',
    'mentee_name' : '',
    'mentor_id' : '',
    'mentee_id' : '',
    'status' : '',
    'mentor_name' : '',
    'mentor_request_description' : '',
    'mentor_posting_description' : ''
  });
  const [isAccepted, setIsAccepted] = useState(false);
  const { instance } = useMsal();
  const navigate = useNavigate();

  if (instance.getActiveAccount() === null) {
    instance.loginRedirect()
  }

  const location = useLocation();
  const queryString = new URLSearchParams(location.search);
  const posting_id = queryString.get('match');
  
  useEffect( () => {
    secureApiRequest(
        instance, 
        'GET', 
        `/api/mentoring/matches/${posting_id}`)
        .then(resp => setCurrentPost(resp))
    }, []
  )


  const handleCheckboxChange = (event) => {
    const { checked } = event.target;
    setIsAccepted(checked);
  };


  var acceptRole;
  if (currentPost['mentor_id'] === instance.getActiveAccount().idTokenClaims.sub) {
    acceptRole = 'mentor'
  } else if (currentPost['mentee_id'] === instance.getActiveAccount().idTokenClaims.sub) {
    acceptRole = 'mentee'
  } else {
    acceptRole = 'neither'
  }
  

  const handleRequest = (event) => {
    event.preventDefault();
    setResponseMessage('⌛');
    
    const req_body = {
      'accept' : isAccepted,
      'message' : event.target.message.value
    }
    // Who we are accepting as what
    const acceptWhat = acceptRole === 'mentor' ? 'mentee' : 'mentor';
    secureApiRequest(instance, "POST", `/api/mentoring/matches/${posting_id}/accept-${acceptWhat}`, req_body)
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
    <div className="flex bg-gray-100 items-center justify-center flex-grow">
      <section className="w-96 p-6 shadow-lg bg-white rounded-md">
        <UnauthenticatedTemplate>
          <Unauthenticated />
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <h1 className="text-lg font-bold text-center">Accept being {acceptRole === 'mentor' ? currentPost.mentee_name : currentPost.mentor_name}'s' {acceptRole}</h1>
          <center className='text-slate-500 py-2'>
          We will send them an email informing them of your request once you submit the request<br/>
          When a mentee acepts, they can give you their contact details so you can communicate <br/>
          in real life
          </center>
          <hr className="my-3"></hr>
          <h3>Course: {currentPost.course_code}</h3>
          <form onSubmit={handleRequest}>
          <h3>Status: {currentPost.status}</h3>
          <p className='text-slate-500 py-2'>Description: {currentPost.description}</p>

          <div key={currentPost.posting_uuid} className='bg-white rounded-lg shadow p-4 mb-4 w-5/6'>
            <p>Mentor posting description: {currentPost.mentor_posting_description}</p>
            <p>Mentor request description: {currentPost.mentor_request_description}</p>
            <p>Mentor name: {currentPost.mentor_name}</p>
            <p>Mentee name: {currentPost.mentee_name}</p>
            <p>Status: {currentPost.status}</p>
          </div>

          <p>
            <label for="message">Description</label>
            <textarea
              name="message"
              id="message"
              placeholder="Say hi to your mentor, say something nice and its best to include your contact details!"
              className="createaccountinputbox flex w-5/6 block p-2 border border-gray-300 rounded-lg resize-none"
              rows='4'
              required
              tabIndex="2"
            />
          </p>

          <p>
            <label>
              <input
              type="checkbox"
              id="is_accepted"
              name="is_accepted"
              checked={isAccepted}
              onChange={handleCheckboxChange}
              className="px-2 py-2"
              />
              Accept? (Submit without ticking to reject)
            </label>
            </p>

          <button
            type="submit"
            className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
          >
            Accept being their {acceptRole}
          </button>
          </form>

          {responseMessage && <p className="text-gray-600">{responseMessage}</p>}
        </AuthenticatedTemplate>
      </section>
    </div>
  );
}

export default AcceptMatch;
