/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const all = /* GraphQL */ `
  query All($limit: Int, $nextToken: String) {
    all(limit: $limit, nextToken: $nextToken) {
      items {
        activity_event_id
        asset_id
        activity
        category
        scope
        emissions_output
        geo
        origin_measurement_timestamp
        raw_data
        source
        units
      }
      nextToken
    }
  }
`;
export const getOne = /* GraphQL */ `
  query GetOne($activity_event_id: String!) {
    getOne(activity_event_id: $activity_event_id) {
      activity_event_id
      asset_id
      activity
      category
      scope
      emissions_output
      geo
      origin_measurement_timestamp
      raw_data
      source
      units
    }
  }
`;
