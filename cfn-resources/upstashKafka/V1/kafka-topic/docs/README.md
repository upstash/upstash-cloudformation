# Upstash::KafkaV1::Topic

Provisions Upstash Kafka topic.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Upstash::KafkaV1::Topic",
    "Properties" : {
        "<a href="#topicname" title="TopicName">TopicName</a>" : <i>String</i>,
        "<a href="#clusterid" title="ClusterID">ClusterID</a>" : <i>String</i>,
        "<a href="#apicredentials" title="ApiCredentials">ApiCredentials</a>" : <i><a href="apicredentials.md">APICredentials</a></i>,
        "<a href="#partitions" title="Partitions">Partitions</a>" : <i>Double</i>,
        "<a href="#retentiontime" title="RetentionTime">RetentionTime</a>" : <i>Double</i>,
        "<a href="#retentionsize" title="RetentionSize">RetentionSize</a>" : <i>Double</i>,
        "<a href="#maxmessagesize" title="MaxMessageSize">MaxMessageSize</a>" : <i>Double</i>,
        "<a href="#cleanuppolicy" title="CleanupPolicy">CleanupPolicy</a>" : <i>String</i>,
        "<a href="#forceupdate" title="ForceUpdate">ForceUpdate</a>" : <i>Double</i>
    }
}
</pre>

### YAML

<pre>
Type: Upstash::KafkaV1::Topic
Properties:
    <a href="#topicname" title="TopicName">TopicName</a>: <i>String</i>
    <a href="#clusterid" title="ClusterID">ClusterID</a>: <i>String</i>
    <a href="#apicredentials" title="ApiCredentials">ApiCredentials</a>: <i><a href="apicredentials.md">APICredentials</a></i>
    <a href="#partitions" title="Partitions">Partitions</a>: <i>Double</i>
    <a href="#retentiontime" title="RetentionTime">RetentionTime</a>: <i>Double</i>
    <a href="#retentionsize" title="RetentionSize">RetentionSize</a>: <i>Double</i>
    <a href="#maxmessagesize" title="MaxMessageSize">MaxMessageSize</a>: <i>Double</i>
    <a href="#cleanuppolicy" title="CleanupPolicy">CleanupPolicy</a>: <i>String</i>
    <a href="#forceupdate" title="ForceUpdate">ForceUpdate</a>: <i>Double</i>
</pre>

## Properties

#### TopicName

Name of the topic

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ClusterID

ID of the cluster to which this topic is associated

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ApiCredentials

_Required_: Yes

_Type_: <a href="apicredentials.md">APICredentials</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Partitions

Number of partitions the topic will have

_Required_: Yes

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RetentionTime

Retention time of messages in the topic (in ms)

_Required_: Yes

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RetentionSize

Retention size of the messages in the topic (in bytes)

_Required_: Yes

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### MaxMessageSize

Max message size in the topic (in bytes)

_Required_: Yes

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### CleanupPolicy

Cleanup policy will be used in the topic(compact or delete)

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ForceUpdate

Support random number (different to number used in the previous deploy) to force update and refreshment of GetAtt methods

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the TopicID.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### TopicID

ID of the topic

#### Region

Region of the topic

#### TcpEndpoint

Returns the <code>TcpEndpoint</code> value.

#### RestEndpoint

Returns the <code>RestEndpoint</code> value.

#### Username

Returns the <code>Username</code> value.

#### State

State of topic (active or deleted)

#### CreationTime

Creation time of the topic as Unix time

#### Password

Returns the <code>Password</code> value.

#### Multizone

Returns the <code>Multizone</code> value.

