export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: string;
  AWSDateTime: string;
  AWSEmail: string;
  AWSIPAddress: string;
  AWSJSON: string;
  AWSPhone: string;
  AWSTime: string;
  AWSTimestamp: number;
  AWSURL: string;
};

export type CalculatorOutput = {
  __typename?: 'CalculatorOutput';
  activity?: Maybe<Scalars['String']>;
  activity_event_id: Scalars['String'];
  asset_id?: Maybe<Scalars['String']>;
  category?: Maybe<Scalars['String']>;
  emissions_output?: Maybe<Scalars['AWSJSON']>;
  geo?: Maybe<Scalars['AWSJSON']>;
  origin_measurement_timestamp?: Maybe<Scalars['String']>;
  raw_data?: Maybe<Scalars['Float']>;
  scope?: Maybe<Scalars['Int']>;
  source?: Maybe<Scalars['String']>;
  units?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  delete?: Maybe<CalculatorOutput>;
};


export type MutationDeleteArgs = {
  activity_event_id: Scalars['String'];
};

export type PaginatedCalculatorOutput = {
  __typename?: 'PaginatedCalculatorOutput';
  items?: Maybe<Array<Maybe<CalculatorOutput>>>;
  nextToken?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  all?: Maybe<PaginatedCalculatorOutput>;
  getOne?: Maybe<CalculatorOutput>;
};


export type QueryAllArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  nextToken?: InputMaybe<Scalars['String']>;
};


export type QueryGetOneArgs = {
  activity_event_id: Scalars['String'];
};
