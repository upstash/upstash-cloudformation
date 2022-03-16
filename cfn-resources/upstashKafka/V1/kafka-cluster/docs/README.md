# Upstash::KafkaV1::Cluster

Provisions Upstash Kafka cluster.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Upstash::KafkaV1::Cluster",
    "Properties" : {
        "<a href="#clustername" title="ClusterName">ClusterName</a>" : <i>String</i>,
        "<a href="#region" title="Region">Region</a>" : <i>String</i>,
        "<a href="#apicredentials" title="ApiCredentials">ApiCredentials</a>" : <i><a href="apicredentials.md">APICredentials</a></i>,
        "<a href="#multizone" title="Multizone">Multizone</a>" : <i>Boolean</i>,
        "<a href="#forceupdate" title="ForceUpdate">ForceUpdate</a>" : <i>Double</i>
    }
}
</pre>

### YAML

<pre>
Type: Upstash::KafkaV1::Cluster
Properties:
    <a href="#clustername" title="ClusterName">ClusterName</a>: <i>String</i>
    <a href="#region" title="Region">Region</a>: <i>String</i>
    <a href="#apicredentials" title="ApiCredentials">ApiCredentials</a>: <i><a href="apicredentials.md">APICredentials</a></i>
    <a href="#multizone" title="Multizone">Multizone</a>: <i>Boolean</i>
    <a href="#forceupdate" title="ForceUpdate">ForceUpdate</a>: <i>Double</i>
</pre>

## Properties

#### ClusterName

Name of the cluster

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Region

Region of the cluster

_Required_: Yes

_Type_: String

_Allowed Values_: <code>eu-west-1</code> | <code>us-east-1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ApiCredentials

_Required_: Yes

_Type_: <a href="apicredentials.md">APICredentials</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Multizone

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

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ClusterID.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ClusterID

ID of the cluster

#### TcpEndpoint

Returns the <code>TcpEndpoint</code> value.

#### RestEndpoint

Returns the <code>RestEndpoint</code> value.

#### Username

Returns the <code>Username</code> value.

#### State

State of cluster (active or deleted)

#### CreationTime

Creation time of the cluster as Unix time

#### Password

Returns the <code>Password</code> value.

