import {
  Action,
  BaseResource,
  exceptions,
  handlerEvent,
  HandlerErrorCode,
  LoggerProxy,
  OperationStatus,
  Optional,
  ProgressEvent,
  ResourceHandlerRequest,
  SessionProxy,
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
import { SSM } from "aws-sdk";
import fetch from "node-fetch";
import { ResourceModel } from "./models";
import {
  deleteApiCredentialsFromParameterStore,
  getApiCredentialsFromParameterStore,
  handleResponseFromUpstash,
  putApiCredentialsIntoParameterStore,
  upstashAuthorizationHeader,
  UpstashKafkaTopicInfoResponse,
} from "./utils";

interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {
  /**
   * CloudFormation invokes this handler when the resource is initially created
   * during stack create operations.
   *
   * @param session Current AWS session passed through from caller
   * @param request The request object for the provisioning request passed to the implementor
   * @param callbackContext Custom context object to allow the passing through of additional
   * state or metadata between subsequent retries
   * @param logger Logger to proxy requests to default publishers
   */
  @handlerEvent(Action.Create)
  public async create(
    session: Optional<SessionProxy>,
    request: ResourceHandlerRequest<ResourceModel>,
    callbackContext: CallbackContext,
    logger: LoggerProxy
  ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
    const model = new ResourceModel(request.desiredResourceState);
    const progress =
      ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(
        model
      );
    try {
      const response: UpstashKafkaTopicInfoResponse = await fetch(
        `https://api.upstash.com/v2/kafka/topic`,
        {
          method: "POST",
          headers: {
            Authorization: upstashAuthorizationHeader(
              model.apiCredentials.email,
              model.apiCredentials.key
            ),
          },
          body: JSON.stringify({
            name: model.topicName,
            cluster_id: model.clusterID,
            partitions: model.partitions,
            retention_time: model.retentionTime,
            retention_size: model.retentionSize,
            max_message_size: model.maxMessageSize,
            cleanup_policy: model.cleanupPolicy,
          }),
        }
      ).then(handleResponseFromUpstash);

      model.topicID = response.topic_id;
      model.clusterID = response.cluster_id;
      model.creationTime = response.creation_time;
      model.topicName = response.topic_name;
      model.username = response.username;
      model.region = response.region;
      model.password = response.password;
      model.restEndpoint = response.rest_endpoint;
      model.tcpEndpoint = response.tcp_endpoint;
      model.state = response.state;
      model.partitions = response.partitions;
      model.retentionTime = response.retention_time;
      model.retentionSize = response.retention_size;
      model.maxMessageSize = response.max_message_size;

      await putApiCredentialsIntoParameterStore({
        apiCreds: model.apiCredentials,
        kafkaTopicPrimaryIdentifier: model.topicID,
        ssmCli: session.client<SSM>("SSM"),
      });

      // Setting Status to success will signal to CloudFormation that the operation is complete
      progress.status = OperationStatus.Success;
    } catch (err) {
      logger.log(err);
      // exceptions module lets CloudFormation know the type of failure that occurred
      throw new exceptions.InternalFailure(err.message);
      // this can also be done by returning a failed progress event
      // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
    }
    return progress;
  }

  /**
   * CloudFormation invokes this handler when the resource is updated
   * as part of a stack update operation.
   *
   * @param session Current AWS session passed through from caller
   * @param request The request object for the provisioning request passed to the implementor
   * @param callbackContext Custom context object to allow the passing through of additional
   * state or metadata between subsequent retries
   * @param logger Logger to proxy requests to default publishers
   */
  @handlerEvent(Action.Update)
  public async update(
    session: Optional<SessionProxy>,
    request: ResourceHandlerRequest<ResourceModel>,
    callbackContext: CallbackContext,
    logger: LoggerProxy
  ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
    const model = new ResourceModel(request.desiredResourceState);
    const progress =
      ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(
        model
      );
    try {
      let response: UpstashKafkaTopicInfoResponse = await fetch(
        `https://api.upstash.com/v2/kafka/topic/${model.topicID}`,
        {
          method: "GET",
          headers: {
            Authorization: upstashAuthorizationHeader(
              model.apiCredentials.email,
              model.apiCredentials.key
            ),
          },
        }
      ).then(handleResponseFromUpstash);

      response = await fetch(
        `https://api.upstash.com/v2/kafka/update-topic/${model.topicID}`,
        {
          method: "POST",
          headers: {
            Authorization: upstashAuthorizationHeader(
              model.apiCredentials.email,
              model.apiCredentials.key
            ),
          },
          body: JSON.stringify({
            retention_time: model.retentionTime,
            retention_size: model.retentionSize,
            max_message_size: model.maxMessageSize,
          }),
        }
      ).then(handleResponseFromUpstash);

      model.topicID = response.topic_id;
      model.clusterID = response.cluster_id;
      model.creationTime = response.creation_time;
      model.topicName = response.topic_name;
      model.username = response.username;
      model.region = response.region;
      model.password = response.password;
      model.restEndpoint = response.rest_endpoint;
      model.tcpEndpoint = response.tcp_endpoint;
      model.state = response.state;
      model.partitions = response.partitions;
      model.retentionTime = response.retention_time;
      model.retentionSize = response.retention_size;
      model.maxMessageSize = response.max_message_size;

      await putApiCredentialsIntoParameterStore({
        apiCreds: model.apiCredentials,
        kafkaTopicPrimaryIdentifier: model.topicID,
        ssmCli: session.client<SSM>("SSM"),
      });

      // Setting Status to success will signal to CloudFormation that the operation is complete
      progress.status = OperationStatus.Success;
    } catch (err) {
      logger.log(err);
      // exceptions module lets CloudFormation know the type of failure that occurred
      throw new exceptions.InternalFailure(err.message);
      // this can also be done by returning a failed progress event
      // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
    }
    return progress;
  }

  /**
   * CloudFormation invokes this handler when the resource is deleted, either when
   * the resource is deleted from the stack as part of a stack update operation,
   * or the stack itself is deleted.
   *
   * @param session Current AWS session passed through from caller
   * @param request The request object for the provisioning request passed to the implementor
   * @param callbackContext Custom context object to allow the passing through of additional
   * state or metadata between subsequent retries
   * @param logger Logger to proxy requests to default publishers
   */
  @handlerEvent(Action.Delete)
  public async delete(
    session: Optional<SessionProxy>,
    request: ResourceHandlerRequest<ResourceModel>,
    callbackContext: CallbackContext,
    logger: LoggerProxy
  ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
    const model = new ResourceModel(request.desiredResourceState);
    const progress =
      ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();
    try {
      await fetch(`https://api.upstash.com/v2/kafka/topic/${model.topicID}`, {
        method: "DELETE",
        headers: {
          Authorization: upstashAuthorizationHeader(
            model.apiCredentials.email,
            model.apiCredentials.key
          ),
        },
      }).then((response) => {
        if (response.status === 404) {
          // if the resource does not exist, it is probably already deleted (skip)
          return;
        }
        return handleResponseFromUpstash(response);
      });

      await deleteApiCredentialsFromParameterStore({
        kafkaTopicPrimaryIdentifier: model.topicID,
        ssmCli: session.client<SSM>("SSM"),
      });
    } catch (err) {
      logger.log(err);
      // exceptions module lets CloudFormation know the type of failure that occurred
      throw new exceptions.InternalFailure(err.message);
      // this can also be done by returning a failed progress event
      // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
    }
    progress.status = OperationStatus.Success;
    return progress;
  }

  /**
   * CloudFormation invokes this handler as part of a stack update operation when
   * detailed information about the resource's current state is required.
   *
   * @param session Current AWS session passed through from caller
   * @param request The request object for the provisioning request passed to the implementor
   * @param callbackContext Custom context object to allow the passing through of additional
   * state or metadata between subsequent retries
   * @param logger Logger to proxy requests to default publishers
   */
  @handlerEvent(Action.Read)
  public async read(
    session: Optional<SessionProxy>,
    request: ResourceHandlerRequest<ResourceModel>,
    callbackContext: CallbackContext,
    logger: LoggerProxy
  ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
    const model = new ResourceModel(request.desiredResourceState);
    const progress =
      ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(
        model
      );

    try {
      const apiCredentials = await getApiCredentialsFromParameterStore({
        kafkaTopicPrimaryIdentifier: model.topicID,
        ssmCli: session.client<SSM>("SSM"),
      });
      const response: UpstashKafkaTopicInfoResponse = await fetch(
        `https://api.upstash.com/v2/kafka/topic/${model.topicID}`,
        {
          method: "GET",
          headers: {
            Authorization: upstashAuthorizationHeader(
              apiCredentials.email,
              apiCredentials.key
            ),
          },
        }
      ).then(handleResponseFromUpstash);

      model.topicID = response.topic_id;
      model.clusterID = response.cluster_id;
      model.creationTime = response.creation_time;
      model.topicName = response.topic_name;
      model.username = response.username;
      model.region = response.region;
      model.password = response.password;
      model.restEndpoint = response.rest_endpoint;
      model.tcpEndpoint = response.tcp_endpoint;
      model.state = response.state;
      model.partitions = response.partitions;
      model.retentionTime = response.retention_time;
      model.retentionSize = response.retention_size;
      model.maxMessageSize = response.max_message_size;

      // Setting Status to success will signal to CloudFormation that the operation is complete
      progress.status = OperationStatus.Success;
    } catch (err) {
      logger.log(err);
      // exceptions module lets CloudFormation know the type of failure that occurred
      throw new exceptions.InternalFailure(err.message);
      // this can also be done by returning a failed progress event
      // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
    }
    return progress;
  }

  /**
   * CloudFormation invokes this handler when summary information about multiple
   * resources of this resource provider is required.
   *
   * @param session Current AWS session passed through from caller
   * @param request The request object for the provisioning request passed to the implementor
   * @param callbackContext Custom context object to allow the passing through of additional
   * state or metadata between subsequent retries
   * @param logger Logger to proxy requests to default publishers
   */
  @handlerEvent(Action.List)
  public async list(
    session: Optional<SessionProxy>,
    request: ResourceHandlerRequest<ResourceModel>,
    callbackContext: CallbackContext,
    logger: LoggerProxy
  ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
    const model = new ResourceModel(request.desiredResourceState);
    // TODO: put code here
    const progress = ProgressEvent.builder<
      ProgressEvent<ResourceModel, CallbackContext>
    >()
      .status(OperationStatus.Success)
      .resourceModels([model])
      .build();
    return progress;
  }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
