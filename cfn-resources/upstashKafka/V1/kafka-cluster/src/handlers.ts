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
  UpstashKafkaClusterInfoResponse,
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
      const response: UpstashKafkaClusterInfoResponse = await fetch(
        `https://api.upstash.com/v2/kafka/cluster/`,
        {
          method: "POST",
          headers: {
            Authorization: upstashAuthorizationHeader(
              model.apiCredentials.email,
              model.apiCredentials.key
            ),
          },
          body: JSON.stringify({
            name: model.clusterName,
            region: model.region,
            multizone: model.multizone,
          }),
        }
      ).then(handleResponseFromUpstash);

      model.clusterID = response.cluster_id;
      model.creationTime = response.creation_time;
      model.clusterName = response.name;
      model.username = response.username;
      model.region = response.region;
      model.multizone = response.multizone;
      model.password = response.password;
      model.restEndpoint = response.rest_endpoint;
      model.tcpEndpoint = response.tcp_endpoint;
      model.state = response.state;

      await putApiCredentialsIntoParameterStore({
        apiCreds: model.apiCredentials,
        kafkaClusterPrimaryIdentifier: model.clusterID,
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
      let response: UpstashKafkaClusterInfoResponse = await fetch(
        `https://api.upstash.com/v2/kafka/cluster/${model.clusterID}`,
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
      if (model.clusterName !== response.name) {
        response = await fetch(
          `https://api.upstash.com/v2/kafka/rename-cluster/${model.clusterID}`,
          {
            method: "POST",
            headers: {
              Authorization: upstashAuthorizationHeader(
                model.apiCredentials.email,
                model.apiCredentials.key
              ),
            },
            body: JSON.stringify({
              name: model.clusterName,
            }),
          }
        ).then(handleResponseFromUpstash);
      }

      model.clusterID = response.cluster_id;
      model.creationTime = response.creation_time;
      model.clusterName = response.name;
      model.username = response.username;
      model.region = response.region;
      model.multizone = response.multizone;
      model.password = response.password;
      model.restEndpoint = response.rest_endpoint;
      model.tcpEndpoint = response.tcp_endpoint;
      model.state = response.state;

      await putApiCredentialsIntoParameterStore({
        apiCreds: model.apiCredentials,
        kafkaClusterPrimaryIdentifier: model.clusterID,
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
      await fetch(
        `https://api.upstash.com/v2/kafka/cluster/${model.clusterID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: upstashAuthorizationHeader(
              model.apiCredentials.email,
              model.apiCredentials.key
            ),
          },
        }
      ).then((response) => {
        if (response.status === 404) {
          // if the resource does not exist, it is probably already deleted (skip)
          return;
        }
        return handleResponseFromUpstash(response);
      });

      await deleteApiCredentialsFromParameterStore({
        kafkaClusterPrimaryIdentifier: model.clusterID,
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
        kafkaClusterPrimaryIdentifier: model.clusterID,
        ssmCli: session.client<SSM>("SSM"),
      });
      const response: UpstashKafkaClusterInfoResponse = await fetch(
        `https://api.upstash.com/v2/kafka/cluster/${model.clusterID}`,
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
      model.clusterID = response.cluster_id;
      model.creationTime = response.creation_time;
      model.clusterName = response.name;
      model.username = response.username;
      model.region = response.region;
      model.multizone = response.multizone;
      model.password = response.password;
      model.restEndpoint = response.rest_endpoint;
      model.tcpEndpoint = response.tcp_endpoint;
      model.state = response.state;
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
