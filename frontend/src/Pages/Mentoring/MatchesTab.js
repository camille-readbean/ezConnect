import React, { useState } from 'react';
import { Tabs, Tab, Box, Card, Button, Collapse, IconButton, Stack, styled, Typography } from '@mui/material'; 
import { MdExpandMore } from 'react-icons/md';

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

export default function MatchesTab({
  navigate,
  mentorMatches,
  menteeMatches,
  handleButtonClick
}) {
  // For user's match tab view
  const [matchesTabValue, setMatchesTabValue] = useState(0);
  // For expansion tab
  const [isExpanded, setIsExpanded] = useState(true);
  const handleChangeMatchesTabValue = (event, newValue) => {
      setMatchesTabValue(newValue);
  };
  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
    <Box sx={{minHeight: 10 + 'em', padding: 10 + 'px', marginBottom: 5 + 'px'}} className="bg-slate-50 rounded-md my-2">
      <Stack direction='row' spacing='2'>
      <h1 className='text-2xl font-semibold'>Matches as mentor / mentee</h1>
      <ExpandMore
        expand={isExpanded}
        onClick={handleExpandClick}
        aria-expanded={isExpanded}
        aria-label="show more">
        <MdExpandMore size='30'></MdExpandMore>
      </ExpandMore>
      </Stack>
      <Collapse in={isExpanded} timeout="auto">
        <Tabs value={matchesTabValue} onChange={handleChangeMatchesTabValue} centered variant="fullWidth">
          <Tab label="Matches as mentor" id='full-width-user-matches-tab-0'/>
          <Tab label="Matches as mentee" id='full-width-user-matches-tab-1'/>
        </Tabs>
        <div role="tabpanel" hidden={matchesTabValue !== 0} id='full-width-user-matches-tab-0'>
          <Box my={1} marginBottom={2}>
            <h2 className='text-lg'>Mentoring: </h2>
            <p className='text-slate-500'>These are your requested mentees</p>
            {mentorMatches.length > 0 ? (
              mentorMatches.map((match) => (
                <Card key={match.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%',  maxWidth: '30%', overflow: 'auto',
                flex: 'flex-grow', flexDirection: 'column', padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                  <h3>Course: {match.course_code}</h3>
                  <h3>Status: {match.status}</h3>
                  <p>Mentee's name: {match.mentee_name}</p>
                  <p>Email: {match.email}</p>
                  {match.status === 'Pending mentor' && (
                          <Button
                            onClick={() => handleButtonClick(match.posting_uuid, 'matchAccept')}
                          >
                            Accept
                          </Button>
                  )}
                </Card>
              ))
            ) : (
              <p className='text-cyan-600'>Currently not matched with anyone.</p>
            )}
          </Box>
        </div>
        <div role="tabpanel" hidden={matchesTabValue !== 1} id='full-width-user-matches-tab-1'>
          <Box my={1} marginBottom={2}>  
            <h2 className='text-lg'>Mentee in: </h2>
            <p className='text-slate-500'>These are your requested mentors</p>
            {menteeMatches.length > 0 ? (
              menteeMatches.map((match) => (
                <Card key={match.posting_uuid} variant="outlined" sx={{display:'inline-block', minWidth: '30%',  maxWidth: '30%', overflow: 'auto',
                flex: 'flex-grow', flexDirection: 'column', padding:'1em', borderBottomColor: 'gray', borderBottomWidth: 1}}>
                  <h3>Course: {match.course_code}</h3>
                  <h3>Status: {match.status}</h3>
                  <p>Mentor's name: {match.mentor_name}</p>
                  <p>Email: {match.email}</p>
                  {match.status === 'Pending mentee' && (
                    <Button
                      onClick={() => handleButtonClick(match.posting_uuid, 'matchAccept')}
                    >
                      Accept
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <p className='text-cyan-600'>Currently not matched with anyone.</p>
            )}
          </Box>
        </div>
      </Collapse>
      {!isExpanded && (<Typography color='text.secondary'>Click on the arrow above to expand this section</Typography>)}
    </Box>
    </>
  )
}