"use strict";
/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = exports.all = void 0;
exports.all = `
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
exports.getOne = `
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
