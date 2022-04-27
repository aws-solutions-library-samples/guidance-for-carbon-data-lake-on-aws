// /@ts-check - remove '/' in front of @ to check for import dependencies

import React, { useState, useEffect} from 'react';
// import ReactPlayer from 'react-player';

// MUI
import { Paper, IconButton, TextField} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';


// API
// import { listJobs } from '../../../graphql/queries'
// import { updateJob, createJob } from '../../../graphql/mutations'

import { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

// AddRecording Component
import AddRecording from '../AddRecording'


const TranscribeJobList = () => {

  const [jobs, setJobs] = useState([]);
  const [jobAudioPlaying, setJobAudioPlaying] = useState('');
  const [audioURL, setAudioURL] = useState('');
  const [showAddRecording, setShowAddRecording] = useState(false);

  useEffect(()=> {
    fetchJobs();
  },[]);


  const toggleJobAudio = async idx => {
    if (jobAudioPlaying === idx) {
      setJobAudioPlaying('')
      return
    }

    const jobAudioFilePath = jobs[idx].filePath;
    try {
      // { expires: 10} expires the s3 presigned url after 10 second, generating a new one.
        const fileAccessURL = await Storage.get(jobAudioFilePath, { expires: 10 })
        console.log('access url:', fileAccessURL);
        setJobAudioPlaying(idx);
        setAudioURL(fileAccessURL)
        return;
    } catch (error) {
      console.error('error accessing the file from s3.', error);
      setAudioURL('');
      setJobAudioPlaying('');
    }



  }

// VERIFIED
  const fetchJobs = async () => {
    try {
        const jobData = await API.graphql(graphqlOperation(listJobs));
        const jobList = jobData.data.listJobs.items;
        console.log('job list', jobList);
        setJobs(jobList)
    } catch (error) {
        console.log("error on fetching jobs", error);
    }
  }


  const addLike = async idx => {
    try{
      const job = jobs[idx];
      // job.like = job.like + 1;
      job.like += 1;
      delete job.createdAt;
      delete job.updatedAt;

      const jobData = await API.graphql(graphqlOperation(updateJob, {input: job }));
      const jobList = [...jobs];
      jobList[idx] = jobData.data.updateJob;
      setJobs(jobList);
    } catch (error) {
      console.log("error on adding Like to job", error);
    }
  }



  return (
    <div className="jobList">
    {jobs.map((job, idx) => {
        return (
            <Paper variant="outlined" elevation={2} key={`job${idx}`}>
                <div className="jobCard">
                    <IconButton aria-label="play" onClick={()=> toggleJobAudio(idx)} >
                        { jobAudioPlaying === idx ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <div>
                        <div className="jobName">{job.JobName}</div>
                        <div className="accountId">{job.AccountId}</div>
                    </div>
                    <div>
                        <IconButton aria-label="like" onClick={() => addLike(idx)}>
                            <FavoriteIcon />
                        </IconButton>
                        {job.like}
                    </div>
                    <div className="jobDescription">{job.Transcript.id}</div>
                </div>
                {
                  jobAudioPlaying === idx ? (
                    <div className="ourAudioPlayer">
                      <ReactPlayer
                          url={audioURL}
                          controls
                          playing
                          height="50px"
                          onPause={ ()=> toggleJobAudio(idx) }
                      />
                    </div>
                  ) : null

                }
            </Paper>
        );
    })}
    {
      showAddRecording ? (
        <AddRecording onUpload={()=>{
          setShowAddRecording(false)
          fetchJobs()
        }}/>
      ): <IconButton onClick={()=> setShowAddRecording(true)}>
           <AddIcon/>
        </IconButton>
    }

</div>
  );
};

export default TranscribeJobList;
