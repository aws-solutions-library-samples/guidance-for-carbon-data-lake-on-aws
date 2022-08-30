/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const deleteOneJob = /* GraphQL */ `
  mutation DeleteOneJob($JobName: String!) {
    deleteOneJob(JobName: $JobName) {
      JobName
      AccountId
      Categories
      Channel
      ContentMetadata
      ConversationCharacteristics
      JobStatus
      LanguageCode
      Participants
      Transcript
      filePath
    }
  }
`;
