/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getActivity = /* GraphQL */ `
  query GetActivity($id: ID!) {
    getActivity(id: $id) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
export const listActivities = /* GraphQL */ `
  query ListActivities(
    $filter: ModelActivityFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listActivities(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        activity_event_id
        asset_id
        activity
        category
        scope
        geo
        origin_measurement_timestamp
        raw_data
        source
        units
        emissions_output
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const createActivity = /* GraphQL */ `
  mutation CreateActivity(
    $input: CreateActivityInput!
    $condition: ModelActivityConditionInput
  ) {
    createActivity(input: $input, condition: $condition) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
export const updateActivity = /* GraphQL */ `
  mutation UpdateActivity(
    $input: UpdateActivityInput!
    $condition: ModelActivityConditionInput
  ) {
    updateActivity(input: $input, condition: $condition) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
export const deleteActivity = /* GraphQL */ `
  mutation DeleteActivity(
    $input: DeleteActivityInput!
    $condition: ModelActivityConditionInput
  ) {
    deleteActivity(input: $input, condition: $condition) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
export const onCreateActivity = /* GraphQL */ `
  subscription OnCreateActivity($filter: ModelSubscriptionActivityFilterInput) {
    onCreateActivity(filter: $filter) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateActivity = /* GraphQL */ `
  subscription OnUpdateActivity($filter: ModelSubscriptionActivityFilterInput) {
    onUpdateActivity(filter: $filter) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteActivity = /* GraphQL */ `
  subscription OnDeleteActivity($filter: ModelSubscriptionActivityFilterInput) {
    onDeleteActivity(filter: $filter) {
      id
      activity_event_id
      asset_id
      activity
      category
      scope
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
      emissions_output
      createdAt
      updatedAt
    }
  }
`;
