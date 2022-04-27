// /c@ts-check - remove '/' in front of @ to check for import dependencies

import React, { useState, useEffect} from 'react';


// MUI
import { Paper, IconButton, DeleteIcon, TextField} from '@material-ui/core'
import PublishIcon from '@mui/icons-material/Publish';

// API
import { updateJob, createJob } from '../../../graphql/mutations'

import { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

// UUID Import
import { v4 as uuid } from 'uuid';


const AddRecording = ({onUpload}) => {

  const [recordingData, setRecordingData] = useState({});
  const [audioData, setAudioData] = useState();

  const uploadRecording = async ()=>{
    // Upload the recording
    console.log('recordingData', recordingData)
    const {title, description, owner} = recordingData

    const { key } = await Storage.put(`${uuid()}`, audioData, {contentType: 'audio/*'});

    const createRecordingInput = {
      id: uuid(),
      title,
      description,
      owner,
      filePath: key,
      like: 0

    }
    await API.graphql(graphqlOperation(createJob, {input: createRecordingInput}))

    onUpload();
  }

  return (
    <div className="newRecording">
      <TextField
        label="Title"
        value={recordingData.title}
        onChange={e => setRecordingData({...recordingData, title: e.target.value})}
        />
      <TextField
        label="Artist"
        value={recordingData.owner}
        onChange={e => setRecordingData({...recordingData, owner: e.target.value})}
        />
      <TextField
        label="Description"
        value={recordingData.description}
        onChange={e => setRecordingData({...recordingData, description: e.target.value})}
        />
        <input type="file" accept="audio/*" onChange={e => setAudioData(e.target.files[0])} />
      <IconButton onClick={uploadRecording}>
        <PublishIcon />
      </IconButton>
    </div>
  )
}
 export default AddRecording;
