// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Upstash::DatabasesV1::Database';

    @Exclude()
    protected readonly IDENTIFIER_KEY_DATABASEID: string = '/properties/DatabaseID';

    @Expose({ name: 'DatabaseName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'databaseName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    databaseName?: Optional<string>;
    @Expose({ name: 'Region' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'region', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    region?: Optional<string>;
    @Expose({ name: 'DatabaseID' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'databaseID', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    databaseID?: Optional<string>;
    @Expose({ name: 'Port' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'port', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    port?: Optional<string>;
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
    @Expose({ name: 'Endpoint' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'endpoint', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    endpoint?: Optional<string>;
    @Expose({ name: 'Tls' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'tls', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    tls?: Optional<boolean>;
    @Expose({ name: 'Multizone' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'multizone', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    multizone?: Optional<boolean>;
    @Expose({ name: 'Consistent' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'consistent', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    consistent?: Optional<boolean>;
    @Expose({ name: 'RestToken' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'restToken', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    restToken?: Optional<string>;
    @Expose({ name: 'ReadOnlyRestToken' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'readOnlyRestToken', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    readOnlyRestToken?: Optional<string>;
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
        if (this.databaseID != null) {
            identifier[this.IDENTIFIER_KEY_DATABASEID] = this.databaseID;
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

