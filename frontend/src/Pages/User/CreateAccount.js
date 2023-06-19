import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { secureApiRequest } from "../../ApiRequest";
import Select from "react-select";
import programmesOptions from "../../programmes.json";
import degreesOptions from "../../degrees.json";

function CreateAccount() {
  const [responseMessage, setResponseMessage] = useState("");
  const [programmes, setProgrammes] = useState([]);
  const [degree, setDegree] = useState([]);
  
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const navigate = useNavigate();

  var name = "";
  var email = "";
  var azure_ad_oid = null;
  if ( activeAccount == null) {
    // need to make a way to tell user to log in
    // this code causes a weird thing where the user 
    // simply goes to '/' still "logged in" cause it logs them in again
    // instance.loginRedirect();
    navigate('/')
  } else {
    name = activeAccount.idTokenClaims["name"];
    console.log("name" + name);
    email = activeAccount.idTokenClaims["emails"][0];
    azure_ad_oid = activeAccount.idTokenClaims["oid"];
  }
  
  const handleCreateAccount = (event) => {
    console.log("email: " + email);
    event.preventDefault();
    console.log(event.target.email.value);
    setResponseMessage('⌛');

    const request_body = {
      email: email,
      azure_ad_oid: azure_ad_oid,
      degrees: degree,
      year: parseInt(event.target.yearofstudy.value),
      name: name,
      programmes : programmes
    }

    // if (event.target.programme.value) {
    //   request_body.programme = event.target.programme.value;
    // }
    
    secureApiRequest(instance, "PUT", '/api/user/create-user', request_body)
      .then((data) => {
          if (data.message) {
            localStorage.removeItem(`${activeAccount.username} ezConnect_new_user`);
            localStorage.setItem(`${activeAccount.username} ezConnect_new_user`, 'false');
            sessionStorage.setItem('ezConnect_user_id', data.userid);
            setResponseMessage(data.message);
            navigate('/homepage');
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
        <h1 className="text-lg font-bold text-center">Log in with your school microsoft account to sign up</h1>
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <h1 className="text-lg font-bold text-center">Complete account creation</h1>
          <center>Just a few more steps</center>
          <hr className="my-3"></hr>

          <form onSubmit={handleCreateAccount}>
            <p>
              <label for="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="John Doe"
                className="createaccountinputbox bg-gray-200 pointer-events-none flex"
                value={name}
                required
              />
            </p>

            <p>
              <label for="signupemail">Email</label>
              <input
                type="email"
                name="email"
                id="signupemail"
                placeholder="Email"
                className="createaccountinputbox bg-gray-200 pointer-events-none flex"
                value={email}
                required
                tabIndex="-1"
              />
            </p>

            <p>
              <label for="degree">Degree</label>
              <Select 
                options={degreesOptions}
                getOptionLabel={option => option.title}
                getOptionValue={option => option.id}
                isMulti
                required
                onChange={setDegree}
                name="degree"
                placeholder="Degree"
              />
            </p>

            <p>
              <label for="programme">Programme (Optional)</label>
              <Select 
                options={programmesOptions}
                getOptionLabel={option => option.title}
                getOptionValue={option => option.id}
                isMulti
                onChange={setProgrammes}
                name="programme"
                placeholder="Programmes like minors or RCs"
              />
            </p>

            <p>
              <label for="yearofstudy">Year of study</label>
              <select
                name="yearofstudy"
                id="yearofstudy"
                className="createaccountinputbox"
                required
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </p>

            <button
              type="submit"
              className="w-full my-2 bg-blue-500 px-2 py-1 rounded-lg text-white shadow-md"
            >
              Submit
            </button>
          </form>

          {responseMessage && <p className="text-gray-600">{responseMessage}</p>}
        </AuthenticatedTemplate>
      </section>
    </div>
  );
}

export default CreateAccount;
