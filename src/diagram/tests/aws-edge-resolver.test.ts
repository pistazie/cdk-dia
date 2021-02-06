import {AwsEdgeResolver} from "../aws/aws-edge-resolver"

describe("candidate target edges are well scraped from any thing", () => {

    it(`sample no.1`, () => {

        const haystack = {
            "dimensions": [
                {
                    "name": "QueueName",
                    "value": {
                        "Fn::GetAtt": [
                            "mayQueue111",
                            "QueueName"
                        ]
                    }
                }
            ]
        }

        const targets = new AwsEdgeResolver().scrapePossibleEdgeTargets(haystack)

        expect(targets.has("mayQueue111")).toBeTruthy()
        expect(targets.has("QueueName")).toBeTruthy()
        expect(targets.size).toEqual(2)
    })

    it(`sample no.2`, () => {

        const haystack = {
            "policyDocument": {
                "Statement": [
                    {
                        "Action": [
                            "dynamodb:BatchGetItem",
                            "dynamodb:GetRecords",
                            "dynamodb:GetShardIterator",
                            "dynamodb:Query",
                            "dynamodb:GetItem",
                            "dynamodb:Scan",
                            "dynamodb:BatchWriteItem",
                            "dynamodb:PutItem",
                            "dynamodb:UpdateItem",
                            "dynamodb:DescribeTable"
                        ],
                        "Effect": "Allow",
                        "Resource": [
                            {
                                "Fn::GetAtt": [
                                    "table123",
                                    "Arn"
                                ]
                            },
                            {
                                "Fn::Join": [
                                    "",
                                    [
                                        {
                                            "Fn::GetAtt": [
                                                "table123",
                                                "Arn"
                                            ]
                                        },
                                        "/index/*"
                                    ]
                                ]
                            }
                        ]
                    },
                    {
                        "Action": [
                            "s3:GetObject*",
                            "s3:GetBucket*",
                            "s3:List*"
                        ],
                        "Effect": "Allow",
                        "Resource": [
                            {
                                "Fn::GetAtt": [
                                    "bkt1",
                                    "Arn"
                                ]
                            },
                            {
                                "Fn::Join": [
                                    "",
                                    [
                                        {
                                            "Fn::GetAtt": [
                                                "bkt1",
                                                "Arn"
                                            ]
                                        },
                                        "/*"
                                    ]
                                ]
                            }
                        ]
                    },
                    {
                        "Action": [
                            "s3:PutObject*",
                            "s3:Abort*"
                        ],
                        "Effect": "Allow",
                        "Resource": {
                            "Fn::Join": [
                                "",
                                [
                                    {
                                        "Fn::GetAtt": [
                                            "bkt1",
                                            "Arn"
                                        ]
                                    },
                                    "/*"
                                ]
                            ]
                        }
                    },
                    {
                        "Action": [
                            "sqs:ChangeMessageVisibility",
                            "sqs:DeleteMessage",
                            "sqs:ReceiveMessage",
                            "sqs:GetQueueAttributes",
                            "sqs:GetQueueUrl",
                            "sqs:SendMessage"
                        ],
                        "Effect": "Allow",
                        "Resource": {
                            "Fn::GetAtt": [
                                "queue123",
                                "Arn"
                            ]
                        }
                    },
                    {
                        "Action": "sns:Publish",
                        "Effect": "Allow",
                        "Resource": {
                            "Ref": "topic123"
                        }
                    },
                    {
                        "Action": [
                            "sqs:ChangeMessageVisibility",
                            "sqs:DeleteMessage",
                            "sqs:ReceiveMessage",
                            "sqs:GetQueueAttributes",
                            "sqs:GetQueueUrl",
                            "sqs:SendMessage"
                        ],
                        "Effect": "Allow",
                        "Resource": {
                            "Fn::GetAtt": [
                                "queue222",
                                "Arn"
                            ]
                        }
                    },
                    {
                        "Action": [
                            "sqs:ChangeMessageVisibility",
                            "sqs:DeleteMessage",
                            "sqs:ReceiveMessage",
                            "sqs:GetQueueAttributes",
                            "sqs:GetQueueUrl",
                            "sqs:SendMessage"
                        ],
                        "Effect": "Allow",
                        "Resource": {
                            "Fn::GetAtt": [
                                "queue333",
                                "Arn"
                            ]
                        }
                    }
                ],
                "Version": "2012-10-17"
            }
        }

        const targets = new AwsEdgeResolver().scrapePossibleEdgeTargets(haystack)

        expect(targets.has("queue333")).toBeTruthy()
        expect(targets.has("queue123")).toBeTruthy()
        expect(targets.has("topic123")).toBeTruthy()
        expect(targets.has("bkt1")).toBeTruthy()
        expect(targets.has("table123")).toBeTruthy()
        expect(targets.has("queue222")).toBeTruthy()
        expect(targets.size).toEqual(7)
    })

    it(`sample no.3`, () => {

        const haystack = {
            "policyDocument": {
                "Statement": [
                    {
                        "Action": "sqs:SendMessage",
                        "Condition": {
                            "ArnEquals": {
                                "aws:SourceArn": {
                                    "Ref": "TopicX"
                                }
                            }
                        },
                        "Effect": "Allow",
                        "Principal": {
                            "Service": "sns.amazonaws.com"
                        },
                        "Resource": {
                            "Fn::GetAtt": [
                                "queueX2",
                                "Arn"
                            ]
                        }
                    }
                ],
                "Version": "2012-10-17"
            }
        }

        const targets = new AwsEdgeResolver().scrapePossibleEdgeTargets(haystack)

        expect(targets.has("TopicX")).toBeTruthy()
        expect(targets.has("queueX2")).toBeTruthy()
        expect(targets.has("Arn")).toBeTruthy()
        expect(targets.size).toEqual(3)
    })
})