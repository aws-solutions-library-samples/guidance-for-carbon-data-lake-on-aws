import React, { useState, useEffect} from 'react';
// import ReactPlayer from 'react-player';

// // API
// import { listJobs } from '../../../graphql/queries'

// // Amplify
// import { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

// Milliseconds to Minutes and Seconds Function
import msToMinAndSec from './msToMinAndSec';

// MUI
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Paper, IconButton,  TextField} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete'


// Styles
import {
  TranscribeJobInfoContainer,
  TranscribeJobInfoContainerCollapsed,
  TranscribeJobNameHeading,
  TranscribeJobName,
  TranscribeJobInfoContainerExpanded,
  TranscribeJobTimestampHeading,
  TranscribeJobTimestamp,
  TranscribeJobOverallCustomerSentimentHeading,
  TranscribeJobOverallCustomerSentiment,
  TranscribeJobLanguageCodeHeading,
  TranscribeJobLanguageCode,
  TranscribeJobCallDurationHeading,
  TranscribeJobCallDuration,
  TranscribeJobAudioHeading,
  TranscribeJobAudio,
  TranscribeJobAudioToggleContainer,
  TranscribeJobAudioToggleText,
  TranscribeJobAudioToggleIcon,
  TranscriptionHeading,
  TranscriptionBody,
  TranscriptionParticipantRole,
  TranscriptionParticipantSentiment,
  TranscriptionContent
} from './TranscribeDropdown.styles'

const TranscribeDropdown = () => {
  // Accordion state
  const [expanded, setExpanded] = useState(false)
  const handleChange = (idx) => (event, isExpanded) => {
    setExpanded(isExpanded ? idx : false);
  };

  // Job state
  const [jobs, setJobs] = useState([]);
  const [jobAudioPlaying, setJobAudioPlaying] = useState('');
  const [audioURL, setAudioURL] = useState('');

  // Run fetchJobs() function on page load
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


  const fetchJobs = async () => {
    try {
        // const jobData = await API.graphql(graphqlOperation(listJobs));
        // const jobList = jobData.data.listJobs.items;
        // console.log('job list', jobList);
        // setJobs(jobList)
      } catch (error) {
        console.log("error on fetching jobs", error);
      }
    }

    return (
      <div>
      {jobs.map((job, idx) =>{
        // Parse JSON strings, constructing JavaScript value or object described by the string
        const parsedCategories = JSON.parse(job.Categories)
        console.log(`Parsed Categories-${idx}:`,parsedCategories)
        const parsedContentMetadata = JSON.parse(job.ContentMetadata)
        console.log(`Parsed Content Metadata-${idx}:`,parsedContentMetadata)
        const parsedConversationCharacteristics = JSON.parse(job.ConversationCharacteristics)
        console.log(`Parsed ConversationCharacteristics-${idx}:`,parsedConversationCharacteristics)
        const parsedParticipants = JSON.parse(job.Participants)
        console.log(`Participants-${idx}:`,parsedParticipants)
        const parsedTranscript = JSON.parse(job.Transcript)
        console.log(`Parsed Transcript-${idx}:`,parsedTranscript)

        // Sentiment ranges from +5(very positive) to -5(very negative)
        let OverallAgentSentiment = parsedConversationCharacteristics.Sentiment.OverallSentiment.AGENT
        let OverallCustomerSentiment = parsedConversationCharacteristics.Sentiment.OverallSentiment.CUSTOMER

        // let OverallAgentSentiment = 333434343
        // let OverallCustomerSentiment = 3423423
        const OverallAgentSentimentEvaluator = ()=> {
          if ( OverallAgentSentiment <= 5 && OverallAgentSentiment >= 3 ){
            return 'POSITIVE'
          } else if ( OverallAgentSentiment >= -3 && OverallAgentSentiment <= 3 ){
            return 'NEUTRAL'
          } else if ( OverallAgentSentiment >= -5  && OverallAgentSentiment <= -3){
            return 'NEGATIVE'
          } else {
            return 'Sentiment could not be evaluated.'
          }
        }
        console.log('Agent:',OverallAgentSentimentEvaluator(OverallAgentSentiment))

        const OverallCustomerSentimentEvaluator = ()=> {
          if ( OverallCustomerSentiment <= 5 && OverallCustomerSentiment >= 3 ){
            return 'POSITIVE'
          } else if ( OverallCustomerSentiment >= -3 && OverallCustomerSentiment <= 3 ){
            return 'NEUTRAL'
          } else if ( OverallCustomerSentiment >= -5  && OverallCustomerSentiment <= -3){
            return 'NEGATIVE'
          } else {
            return 'Sentiment could not be evaluated.'
          }
        }
        console.log('Customer:',OverallCustomerSentimentEvaluator(OverallCustomerSentiment))

        return(
          <Accordion expanded={expanded === idx} onChange={handleChange(idx)} key={`job${idx}`}>
            {/* Collapsed Accordion */}
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              >
              <TranscribeJobInfoContainerCollapsed>
                <TranscribeJobNameHeading>
                    Job Name:
                </TranscribeJobNameHeading>
                  <TranscribeJobName>
                    {job.JobName}
                  </TranscribeJobName>
              </TranscribeJobInfoContainerCollapsed>
            </AccordionSummary>

            <AccordionDetails>
              <TranscribeJobInfoContainerExpanded>
                <TranscribeJobTimestampHeading>
                  Timestamp:
                </TranscribeJobTimestampHeading>
                  <TranscribeJobTimestamp>
                    {/* 2022-02-24T06:23:46.971Z */}
                    {job.createdAt}
                  </TranscribeJobTimestamp>
                <TranscribeJobOverallCustomerSentimentHeading>
                  Overall Customer Sentiment:
                </TranscribeJobOverallCustomerSentimentHeading>
                    <TranscribeJobOverallCustomerSentiment>
                      {OverallCustomerSentimentEvaluator(OverallCustomerSentiment)}
                    </TranscribeJobOverallCustomerSentiment>
                <TranscribeJobLanguageCodeHeading>
                  Language Code:
                </TranscribeJobLanguageCodeHeading>
                    <TranscribeJobLanguageCode>
                      {job.LanguageCode}
                    </TranscribeJobLanguageCode>
                <TranscribeJobCallDurationHeading>
                  Call Duration:
                </TranscribeJobCallDurationHeading>
                    <TranscribeJobCallDuration>
                      {msToMinAndSec(parsedConversationCharacteristics.TotalConversationDurationMillis)}
                    </TranscribeJobCallDuration>
                <TranscribeJobAudioHeading>
                  Job Audio:
                </TranscribeJobAudioHeading>
                <TranscribeJobAudio>
                  <IconButton aria-label="play" onClick={()=> toggleJobAudio(idx)}>
                    {jobAudioPlaying === idx ?
                    <TranscribeJobAudioToggleContainer>
                      <TranscribeJobAudioToggleText>
                        Pause Audio
                        <TranscribeJobAudioToggleIcon>
                          <PauseIcon/>
                        </TranscribeJobAudioToggleIcon>
                      </TranscribeJobAudioToggleText>
                    </TranscribeJobAudioToggleContainer>

                    : <TranscribeJobAudioToggleContainer>
                        <TranscribeJobAudioToggleText>
                          Play Audio
                          <TranscribeJobAudioToggleIcon>
                            <PlayArrowIcon/>
                          </TranscribeJobAudioToggleIcon>
                        </TranscribeJobAudioToggleText>
                      </TranscribeJobAudioToggleContainer>}
                     </IconButton>

                    {jobAudioPlaying === idx ? (
                      <div>
                        {/* <ReactPlayer
                          url = {audioURL}
                          controls
                          playing
                          height="50px"
                          onPause ={()=> toggleJobAudio(idx)}
                        /> */}
                      </div>
                    ) : null}
                </TranscribeJobAudio>

                {/* Expanded Accordion */}

                <TranscriptionHeading>
                  Transcription
                </TranscriptionHeading>


                  {parsedTranscript.map((sentence, idx2)=> {
                    return (

                    <TranscriptionBody key={`sentence${idx2}`} >
                      <TranscriptionParticipantRole>
                        [{sentence.ParticipantRole}]
                        - {msToMinAndSec(sentence.BeginOffsetMillis)}
                      </TranscriptionParticipantRole>
                      <TranscriptionParticipantSentiment>
                        {sentence.Sentiment}
                      </TranscriptionParticipantSentiment>

                      <TranscriptionContent>
                        {sentence.Content}
                      </TranscriptionContent>
                  </TranscriptionBody>

                    )
                  })}

                    {/* <TranscriptionParticipantRole>
                      [Agent] - {msToMinAndSec(10000)}
                    </TranscriptionParticipantRole>

                    <TranscriptionContent>
                    Donec placerat, lectus sed mattis semper, neque lectus feugiat lectus,
                    varius pulvinar diam eros in elit. Pellentesque convallis laoreet
                    laoreet.
                  </TranscriptionContent> */}


              </TranscribeJobInfoContainerExpanded>
            </AccordionDetails>
      </Accordion>
        )
      })}

    </div>
  );
};

export default TranscribeDropdown;
