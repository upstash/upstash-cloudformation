// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Upstash::KafkaV1::Cluster';

    @Exclude()
    protected readonly IDENTIFIER_KEY_CLUSTERID: string = '/properties/ClusterID';

    @Expose({ name: 'ClusterName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'clusterName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    clusterName?: Optional<string>;
    @Expose({ name: 'Region' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'region', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    region?: Optional<string>;
    @Expose({ name: 'ClusterID' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'clusterID', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    clusterID?: Optional<string>;
    @Expose({ name: 'CreationTime' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'creationTime', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    creationTime?: Optional<number>;
    @Expose({ name: 'State' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'state', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    state?: Optional<string>;
    @Expose({ name: 'Username' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'username', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    username?: Optional<string>;
    @Expose({ name: 'Password' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'password', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    password?: Optional<string>;
    @Expose({ name: 'ApiCredentials' })
    @Type(() => APICredentials)
    apiCredentials?: Optional<APICredentials>;
    @Expose({ name: 'TcpEndpoint' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'tcpEndpoint', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    tcpEndpoint?: Optional<string>;
    @Expose({ name: 'RestEndpoint' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'restEndpoint', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    restEndpoint?: Optional<string>;
    @Expose({ name: 'Multizone' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'multizone', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    multizone?: Optional<boolean>;
    @Expose({ name: 'ForceUpdate' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'forceUpdate', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    forceUpdate?: Optional<number>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.clusterID != null) {
            identifier[this.IDENTIFIER_KEY_CLUSTERID] = this.clusterID;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class APICredentials extends BaseModel {
    ['constructor']: typeof APICredentials;


    @Expose({ name: 'Email' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'email', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    email?: Optional<string>;
    @Expose({ name: 'Key' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'key', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    key?: Optional<string>;

}

