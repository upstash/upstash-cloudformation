import {
  Action,
  BaseResource,
  exceptions,
  handlerEvent,
  LoggerProxy,
  OperationStatus,
  Optional,
  ProgressEvent,
  ResourceHandlerRequest,
  SessionProxy,
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
import { ResourceModel } from "./models";
import fetch from "node-fetch";
import {
  deleteApiCredentialsFromParameterStore,
  getApiCredentialsFromParameterStore,
  handleResponseFromUpstash,
  putApiCredentialsIntoParameterStore,
  upstashAuthorizationHeader,
  UpstashDatabaseInfoResponse,
} from "./utils";
import { SSM } from "aws-sdk";

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
      const response: UpstashDatabaseInfoResponse = await fetch(
        `https://api.upstash.com/v2/redis/database/`,
        {
          method: "POST",
          headers: {
            Authorization: upstashAuthorizationHeader(
              model.apiCredentials.email,
              model.apiCredentials.key
            ),
          },
          body: JSON.stringify({
            name: model.databaseName,
            region: model.region,
            multizone: model.multizone,
            tls: model.tls,
            consistent: model.consistent,
          }),
        }
      ).then(handleResponseFromUpstash);

      model.databaseID = response.database_id;
      model.consistent = response.consistent;
      model.creationTime = response.creation_time;
      model.databaseName = response.database_name;
      model.endpoint = response.endpoint;
      model.region = response.region;
      model.multizone = response.multizone;
      model.password = response.password;
      model.port = `${response.port}`;
      model.state = response.state;
      model.tls = response.tls;

      await putApiCredentialsIntoParameterStore({
        apiCreds: model.apiCredentials,
        databasePrimaryIdentifier: model.databaseID,
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
      let response: UpstashDatabaseInfoResponse = await fetch(
        `https://api.upstash.com/v2/redis/database/${model.databaseID}`,
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
      if (model.databaseName !== response.database_name) {
        response = await fetch(
          `https://api.upstash.com/v2/redis/rename/${model.databaseID}`,
          {
            method: "POST",
            headers: {
              Authorization: upstashAuthorizationHeader(
                model.apiCredentials.email,
                model.apiCredentials.key
              ),
            },
            body: JSON.stringify({
              name: model.databaseName,
            }),
          }
        ).then(handleResponseFromUpstash);
      }
      if (model.tls !== response.tls) {
        if (response.tls && !model.tls) {
          // Tls cannot be disabled once it was enabled. However if such request is given, we will simply ignore it.
          // This is due to possible problems with potential rollback
          // In future we might throw an error.
          // throw new Error(
          //   "It is not possible to disable tls for Upstash redis database once it was enabled."
          // );
        }
        response = await fetch(
          `https://api.upstash.com/v2/redis/enable-tls/${model.databaseID}`,
          {
            method: "POST",
            headers: {
              Authorization: upstashAuthorizationHeader(
                model.apiCredentials.email,
                model.apiCredentials.key
              ),
            },
          }
        ).then(handleResponseFromUpstash);
      }
      if (model.multizone !== response.multizone) {
        if (response.multizone && !model.multizone) {
          // Multizone cannot be disabled once it was enabled. However if such request is given, we will simply ignore it.
          // This is due to possible problems with potential rollback
          // In future we might throw an error.
          // throw new Error(
          //   "It is not possible to disable multizone replication for Upstash redis database once it was enabled."
          // );
        }
        response = await fetch(
          `https://api.upstash.com/v2/redis/enable-multizone/${model.databaseID}`,
          {
            method: "POST",
            headers: {
              Authorization: upstashAuthorizationHeader(
                model.apiCredentials.email,
                model.apiCredentials.key
              ),
            },
          }
        ).then(handleResponseFromUpstash);
      }

      model.databaseID = response.database_id;
      model.consistent = response.consistent;
      model.creationTime = response.creation_time;
      model.databaseName = response.database_name;
      model.endpoint = response.endpoint;
      model.region = response.region;
      model.multizone = response.multizone;
      model.password = response.password;
      model.port = `${response.port}`;
      model.state = response.state;
      model.tls = response.tls;

      await putApiCredentialsIntoParameterStore({
        apiCreds: model.apiCredentials,
        databasePrimaryIdentifier: model.databaseID,
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
        `https://api.upstash.com/v2/redis/database/${model.databaseID}`,
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
        databasePrimaryIdentifier: model.databaseID,
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
        databasePrimaryIdentifier: model.databaseID,
        ssmCli: session.client<SSM>("SSM"),
      });
      const response: UpstashDatabaseInfoResponse = await fetch(
        `https://api.upstash.com/v2/redis/database/${model.databaseID}`,
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
      model.databaseID = response.database_id;
      model.consistent = response.consistent;
      model.creationTime = response.creation_time;
      model.databaseName = response.database_name;
      model.endpoint = response.endpoint;
      model.region = response.region;
      model.multizone = response.multizone;
      model.password = response.password;
      model.port = `${response.port}`;
      model.state = response.state;
      model.tls = response.tls;
      model.restToken = response.rest_token;
      model.readOnlyRestToken = response.read_only_rest_token;
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
