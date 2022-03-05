import { ParameterType } from "@aws-sdk/client-ssm";

import { SSM } from "aws-sdk";
import { Response } from "node-fetch";
import { APICredentials } from "./models";

export const upstashAuthorizationHeader = (email: string, key: string) => {
  return `Basic ${Buffer.from(
    `${email}:${process.env.UPSTASH_API_KEY || key}`,
    "utf-8"
  ).toString("base64")}`;
};

export const handleResponseFromUpstash = async (response: Response) => {
  if (response.status === 200) {
    return response.json();
  }
  throw new Error(
    `Request to Upstash failed with code ${
      response.status
    }.\nResponse: ${await response.text()}`
  );
};

const buildApiCredentialsParameterName = (
  databasePrimaryIdentifier: string
) => {
  return `/stp/upstashdatabasev1/${databasePrimaryIdentifier}`;
};

export const putApiCredentialsIntoParameterStore = async ({
  apiCreds,
  databsePrimaryIdentifier,
  ssmCli,
}: {
  apiCreds: APICredentials;
  databsePrimaryIdentifier: string;
  ssmCli: SSM;
}) => {
  const apiCredentials: StoredApiCredentials = {
    email: apiCreds.email,
    key: apiCreds.key,
  };
  return ssmCli
    .putParameter({
      Name: buildApiCredentialsParameterName(databsePrimaryIdentifier),
      Overwrite: true,
      Value: JSON.stringify(apiCredentials),
      Type: ParameterType.SECURE_STRING,
    })
    .promise();
};

export const getApiCredentialsFromParameterStore = async ({
  databsePrimaryIdentifier,
  ssmCli,
}: {
  databsePrimaryIdentifier: string;
  ssmCli: SSM;
}): Promise<StoredApiCredentials> => {
  const {
    Parameter: { Value },
  } = await ssmCli
    .getParameter({
      Name: buildApiCredentialsParameterName(databsePrimaryIdentifier),
      WithDecryption: true,
    })
    .promise();

  return JSON.parse(Value);
};

export const deleteApiCredentialsFromParameterStore = async ({
  databsePrimaryIdentifier,
  ssmCli,
}: {
  databsePrimaryIdentifier: string;
  ssmCli: SSM;
}) => {
  return ssmCli
    .deleteParameter({
      Name: buildApiCredentialsParameterName(databsePrimaryIdentifier),
    })
    .promise();
};

type StoredApiCredentials = {
  email: string;
  key: string;
};

export type UpstashDatabaseInfoResponse = {
  database_id: string;
  database_name: string;
  database_type: string;
  region: string;
  port: number;
  creation_time: number;
  state: "active" | "deleted";
  password: string;
  user_email: string;
  endpoint: string;
  tls: boolean;
  multizone: boolean;
  consistent: boolean;
  rest_token?: string;
  read_only_rest_token?: string;
};
