/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAllJobs = /* GraphQL */ `
  query GetAllJobs($limit: Int, $nextToken: String) {
    getAllJobs(limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getAllJobsPaginated = /* GraphQL */ `
  query GetAllJobsPaginated($limit: Int, $nextToken: String) {
    getAllJobsPaginated(limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getOneJob = /* GraphQL */ `
  query GetOneJob($JobName: String!) {
    getOneJob(JobName: $JobName) {
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
