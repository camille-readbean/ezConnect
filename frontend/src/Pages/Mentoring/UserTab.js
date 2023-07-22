import React, { useState } from 'react';
import { Tabs, Tab, Box, Card, Button, Collapse, IconButton, Stack, styled, Typography } from '@mui/material'; 
import { MdExpandMore, MdAdd } from 'react-icons/md';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function UserTab({
  navigate,
  userMentorPostings,
  userMentorRequests,
  handleButtonClick
}) {
  // For user's post view
  const [mentoringPostsValue, setMentoringPostsValue] = useState(0);
  const handleChangeMentoringPostsTabValue = (event, newValue) => {
    setMentoringPostsValue(newValue);
  };
  // For expansion tab
  const [isExpanded, setIsExpanded] = useState(true);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  const onPressCreateMentorPosting = (event) => {
    navigate('/mentoring/create-mentor-posting');
  }

  const onPressCreateMentorRequest = (event) => {
    navigate('/mentoring/create-mentor-request');
  }

  return (
    <>
    <Box sx={{minHeight: 10 + 'em', padding: 10 + 'px', marginBottom: 5 + 'px'}} className="bg-slate-50 rounded-md my-2">
      <Stack direction='row' spacing='1'>
      <h1 className='text-2xl mr-4 c-1/10 font-semibold'>Your mentoring posts / requests</h1>
      <ExpandMore
        expand={isExpanded}
        onClick={handleExpandClick}
        aria-expanded={isExpanded}
        aria-label="show more">
        <MdExpandMore size='30'></MdExpandMore>
      </ExpandMore>
      </Stack>
      <Collapse in={isExpanded} timeout="auto">
        <Tabs value={mentoringPostsValue} onChange={handleChangeMentoringPostsTabValue} centered variant="fullWidth">
          <Tab label="Posts as mentor" id='full-width-user-posts-tab-0'/>
          <Tab label="Requests as mentee" id='full-width-user-posts-tab-1'/>
        </Tabs>
        <div role="tabpanel" hidden={mentoringPostsValue !== 0} id='full-width-user-posts-tab-0'>
          <Stack direction={'row'} my={1}>
            <p className='text-slate-500 my-5'>Posts to indicate which courses you are mentoring</p>
            <Button
              onClick={onPressCreateMentorPosting}>
              <MdAdd size={25}/> Create Posting
            </Button>
          </Stack>
          <Box display='flex' gap={'14px'} flexDirection={'row'} flexWrap={'wrap'} my='2em'>
          {userMentorPostings.length > 0 ? (
            userMentorPostings.map((posting) => (
              <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%',  maxWidth: '30%', overflow: 'auto',
              flex: 'flex-grow', flexDirection: 'column', padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                <h3>Course: {posting.course}</h3>
                <h3>Title: {posting.title}</h3>
                <h4>Published: {posting.is_published ? 'Yes' : 'No'}</h4>
                <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                <Button
                  onClick={() => handleButtonClick(posting.posting_uuid, 'updatePosting')}
                >
                  Update
                </Button>
              </Card>
            ))
          ) : (
            <p className='text-cyan-600'>You do not currently have any mentor posting.</p>
          )}
          </Box>
        </div>
        <div role="tabpanel" hidden={mentoringPostsValue !== 1} id='full-width-user-posts-tab-1'>
          <Stack direction={'row'}>
          <p className='text-slate-500 my-5'>Posts to indicate which courses you want a mentor for</p>
              <Button 
              onClick={onPressCreateMentorRequest}>
                <MdAdd size={25}/> Create request
              </Button>
          </Stack>
          <Box display='flex' gap={'14px'} flexDirection={'row'} flexWrap={'wrap'} my='2em'>
          {userMentorRequests.length > 0 ? (
            userMentorRequests.map((posting) => (
              <Card key={posting.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%',  maxWidth: '30%', overflow: 'auto',
              flex: 'flex-grow', flexDirection: 'column', padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                <h3>Course: {posting.course}</h3>
                <h3>Title: {posting.title}</h3>
                <h4>Published: {posting.is_published ? 'Yes' : 'No'}</h4>
                <p className='text-slate-500 py-2'>Description: {posting.description}</p>
                <Button
                  onClick={() => handleButtonClick(posting.posting_uuid, 'updateRequest')}
                >
                  Update
                </Button>
              </Card>
            ))
          ) : (
            <p className='text-cyan-600'>You do not currently have any mentor requests.</p>
            )}
            </Box>    
          </div> 
          </Collapse>
          {!isExpanded && (<Typography color='text.secondary'>Click on the arrow above to expand this section</Typography>)}
          </Box>


    </>
  )
}