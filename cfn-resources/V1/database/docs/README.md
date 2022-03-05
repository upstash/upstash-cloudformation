# Upstash::DatabasesV1::Database

Provisions Upstash Redis Database resource.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Upstash::DatabasesV1::Database",
    "Properties" : {
        "<a href="#databasename" title="DatabaseName">DatabaseName</a>" : <i>String</i>,
        "<a href="#region" title="Region">Region</a>" : <i>String</i>,
        "<a href="#apicredentials" title="ApiCredentials">ApiCredentials</a>" : <i><a href="apicredentials.md">APICredentials</a></i>,
        "<a href="#tls" title="Tls">Tls</a>" : <i>Boolean</i>,
        "<a href="#multizone" title="Multizone">Multizone</a>" : <i>Boolean</i>,
        "<a href="#consistent" title="Consistent">Consistent</a>" : <i>Boolean</i>,
        "<a href="#forceupdate" title="ForceUpdate">ForceUpdate</a>" : <i>Double</i>
    }
}
</pre>

### YAML

<pre>
Type: Upstash::DatabasesV1::Database
Properties:
    <a href="#databasename" title="DatabaseName">DatabaseName</a>: <i>String</i>
    <a href="#region" title="Region">Region</a>: <i>String</i>
    <a href="#apicredentials" title="ApiCredentials">ApiCredentials</a>: <i><a href="apicredentials.md">APICredentials</a></i>
    <a href="#tls" title="Tls">Tls</a>: <i>Boolean</i>
    <a href="#multizone" title="Multizone">Multizone</a>: <i>Boolean</i>
    <a href="#consistent" title="Consistent">Consistent</a>: <i>Boolean</i>
    <a href="#forceupdate" title="ForceUpdate">ForceUpdate</a>: <i>Double</i>
</pre>

## Properties

#### DatabaseName

Name of the database

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Region

Region of the database

_Required_: Yes

_Type_: String

_Allowed Values_: <code>eu-west-1</code> | <code>us-east-1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ApiCredentials

_Required_: Yes

_Type_: <a href="apicredentials.md">APICredentials</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Tls

Whether tls is enabled

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Multizone

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Consistent

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ForceUpdate

Support random number (different to number used in the previous deploy) to force update and refreshment of GetAtt methods

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the DatabaseID.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### DatabaseID

ID of the database

#### Endpoint

Returns the <code>Endpoint</code> value.

#### Port

Database port for clients to connect

#### State

State of database (active or deleted)

#### CreationTime

Creation time of the database as Unix time

#### Password

Returns the <code>Password</code> value.

#### RestToken

Returns the <code>RestToken</code> value.

#### ReadOnlyRestToken

Returns the <code>ReadOnlyRestToken</code> value.

