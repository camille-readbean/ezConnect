import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Button from '@mui/material/Button';

function LoginModal({setLoginModal, showLoginModal}) {
    const { instance} = useMsal();
    const loc = useLocation();
    const nav = useNavigate();

    const handleLoginRedirect = () => {
        sessionStorage.setItem('last_page', loc.pathname)
        instance
            .loginRedirect({
                scopes: ['openid', 'profile', 'email', "https://ezconnecttesting.onmicrosoft.com/ezconnecttesting/App.Use"],
                redirectUri: '/homepage',
                state: `${loc.pathname}`
            })
            // .loginRedirect()
            .catch((error) => console.log(error));
    };
    
    const closeModal = () => {
        setLoginModal(false);
    }

    

    return (
    <Dialog onClose={closeModal} open={showLoginModal}>
      <span>
        <DialogTitle>Sign in / Create account</DialogTitle>
        <DialogContent>
          <DialogContentText>Sign in with Microsoft using Work/School account, you will be redirected.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginRedirect} autoFocus style={{'padding-bottom': '10px', 'padding-right': '24px'}}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <img src={'ms-symbol.png'} style={{ height: '2em', 'padding-right': '12px'}} alt='MS logo'/>Sign in
              </span>
            </Button>
        </DialogActions>
      </span>
    </Dialog>
    )
}

export default LoginModal