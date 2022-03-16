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
  kafkaClusterPrimaryIdentifier: string
) => {
  return `/stp/upstashkafkaclusterv1/${kafkaClusterPrimaryIdentifier}`;
};

export const putApiCredentialsIntoParameterStore = async ({
  apiCreds,
  kafkaClusterPrimaryIdentifier,
  ssmCli,
}: {
  apiCreds: APICredentials;
  kafkaClusterPrimaryIdentifier: string;
  ssmCli: SSM;
}) => {
  const apiCredentials: StoredApiCredentials = {
    email: apiCreds.email,
    key: apiCreds.key,
  };
  return ssmCli
    .putParameter({
      Name: buildApiCredentialsParameterName(kafkaClusterPrimaryIdentifier),
      Overwrite: true,
      Value: JSON.stringify(apiCredentials),
      Type: ParameterType.SECURE_STRING,
    })
    .promise();
};

export const getApiCredentialsFromParameterStore = async ({
  kafkaClusterPrimaryIdentifier,
  ssmCli,
}: {
  kafkaClusterPrimaryIdentifier: string;
  ssmCli: SSM;
}): Promise<StoredApiCredentials> => {
  const {
    Parameter: { Value },
  } = await ssmCli
    .getParameter({
      Name: buildApiCredentialsParameterName(kafkaClusterPrimaryIdentifier),
      WithDecryption: true,
    })
    .promise();

  return JSON.parse(Value);
};

export const deleteApiCredentialsFromParameterStore = async ({
  kafkaClusterPrimaryIdentifier,
  ssmCli,
}: {
  kafkaClusterPrimaryIdentifier: string;
  ssmCli: SSM;
}) => {
  return ssmCli
    .deleteParameter({
      Name: buildApiCredentialsParameterName(kafkaClusterPrimaryIdentifier),
    })
    .promise();
};

type StoredApiCredentials = {
  email: string;
  key: string;
};

export type UpstashKafkaClusterInfoResponse = {
  cluster_id: string;
  name: string;
  region: string;
  type: string;
  multizone: boolean;
  tcp_endpoint: string;
  rest_endpoint: string;
  state: string;
  username: string;
  password: string;
  max_retention_size: number;
  max_retention_time: number;
  max_messages_per_second: number;
  creation_time: number;
  max_message_size: number;
  max_partitions: number;
};
