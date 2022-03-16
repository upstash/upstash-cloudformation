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
  kafkaTopicPrimaryIdentifier: string
) => {
  return `/stp/upstashkafkatopicv1/${kafkaTopicPrimaryIdentifier}`;
};

export const putApiCredentialsIntoParameterStore = async ({
  apiCreds,
  kafkaTopicPrimaryIdentifier,
  ssmCli,
}: {
  apiCreds: APICredentials;
  kafkaTopicPrimaryIdentifier: string;
  ssmCli: SSM;
}) => {
  const apiCredentials: StoredApiCredentials = {
    email: apiCreds.email,
    key: apiCreds.key,
  };
  return ssmCli
    .putParameter({
      Name: buildApiCredentialsParameterName(kafkaTopicPrimaryIdentifier),
      Overwrite: true,
      Value: JSON.stringify(apiCredentials),
      Type: ParameterType.SECURE_STRING,
    })
    .promise();
};

export const getApiCredentialsFromParameterStore = async ({
  kafkaTopicPrimaryIdentifier,
  ssmCli,
}: {
  kafkaTopicPrimaryIdentifier: string;
  ssmCli: SSM;
}): Promise<StoredApiCredentials> => {
  const {
    Parameter: { Value },
  } = await ssmCli
    .getParameter({
      Name: buildApiCredentialsParameterName(kafkaTopicPrimaryIdentifier),
      WithDecryption: true,
    })
    .promise();

  return JSON.parse(Value);
};

export const deleteApiCredentialsFromParameterStore = async ({
  kafkaTopicPrimaryIdentifier,
  ssmCli,
}: {
  kafkaTopicPrimaryIdentifier: string;
  ssmCli: SSM;
}) => {
  return ssmCli
    .deleteParameter({
      Name: buildApiCredentialsParameterName(kafkaTopicPrimaryIdentifier),
    })
    .promise();
};

type StoredApiCredentials = {
  email: string;
  key: string;
};

export type UpstashKafkaTopicInfoResponse = {
  cluster_id: string;
  topic_name: string;
  topic_id: string;
  region: string;
  tcp_endpoint: string;
  rest_endpoint: string;
  state: string;
  username: string;
  password: string;
  retention_size: number;
  retention_time: number;
  creation_time: number;
  max_message_size: number;
  cleanup_policy: string;
  partitions: number;
};
