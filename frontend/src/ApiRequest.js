/**
 * Sends secure request to backend by getting access token and adding to header.
 * @param {import("@azure/msal-browser").IPublicClientApplication} instance 
 * @param {string} method The HTTP method for the request (e.g., "GET", "POST", "PUT", etc.).
 * @param {string} url The path of the backend API endpoint.
 * @param {Object} req_body The request body to be sent with the request.
 * @returns {Promise<JSON>} A promise that resolves with the JSON response from the backend.
 */
export function secureApiRequest(instance, method, url, req_body) {
    return instance.acquireTokenSilent(
    {
        scopes: ["email", "profile", "openid", "https://ezconnecttesting.onmicrosoft.com/ezconnecttesting/App.Use"],
        account: instance.getActiveAccount()
    }
    ).then( (response) => {
        return fetch(process.env.REACT_APP_API_ENDPOINT + url, {
            method: method,
            headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+ response.accessToken
            },
            body: JSON.stringify(req_body),
        }).then(resp => resp.json())
    })
}
