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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInF1ZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG9CQUFvQjtBQUNwQixvQkFBb0I7QUFDcEIsMkRBQTJEOzs7QUFFOUMsUUFBQSxHQUFHLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJoQyxDQUFDO0FBQ1csUUFBQSxNQUFNLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JuQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGUgKi9cbi8qIGVzbGludC1kaXNhYmxlICovXG4vLyB0aGlzIGlzIGFuIGF1dG8gZ2VuZXJhdGVkIGZpbGUuIFRoaXMgd2lsbCBiZSBvdmVyd3JpdHRlblxuXG5leHBvcnQgY29uc3QgYWxsID0gLyogR3JhcGhRTCAqLyBgXG4gIHF1ZXJ5IEFsbCgkbGltaXQ6IEludCwgJG5leHRUb2tlbjogU3RyaW5nKSB7XG4gICAgYWxsKGxpbWl0OiAkbGltaXQsIG5leHRUb2tlbjogJG5leHRUb2tlbikge1xuICAgICAgaXRlbXMge1xuICAgICAgICBhY3Rpdml0eV9ldmVudF9pZFxuICAgICAgICBhc3NldF9pZFxuICAgICAgICBhY3Rpdml0eVxuICAgICAgICBjYXRlZ29yeVxuICAgICAgICBzY29wZVxuICAgICAgICBlbWlzc2lvbnNfb3V0cHV0XG4gICAgICAgIGdlb1xuICAgICAgICBvcmlnaW5fbWVhc3VyZW1lbnRfdGltZXN0YW1wXG4gICAgICAgIHJhd19kYXRhXG4gICAgICAgIHNvdXJjZVxuICAgICAgICB1bml0c1xuICAgICAgfVxuICAgICAgbmV4dFRva2VuXG4gICAgfVxuICB9XG5gO1xuZXhwb3J0IGNvbnN0IGdldE9uZSA9IC8qIEdyYXBoUUwgKi8gYFxuICBxdWVyeSBHZXRPbmUoJGFjdGl2aXR5X2V2ZW50X2lkOiBTdHJpbmchKSB7XG4gICAgZ2V0T25lKGFjdGl2aXR5X2V2ZW50X2lkOiAkYWN0aXZpdHlfZXZlbnRfaWQpIHtcbiAgICAgIGFjdGl2aXR5X2V2ZW50X2lkXG4gICAgICBhc3NldF9pZFxuICAgICAgYWN0aXZpdHlcbiAgICAgIGNhdGVnb3J5XG4gICAgICBzY29wZVxuICAgICAgZW1pc3Npb25zX291dHB1dFxuICAgICAgZ2VvXG4gICAgICBvcmlnaW5fbWVhc3VyZW1lbnRfdGltZXN0YW1wXG4gICAgICByYXdfZGF0YVxuICAgICAgc291cmNlXG4gICAgICB1bml0c1xuICAgIH1cbiAgfVxuYDtcbiJdfQ==