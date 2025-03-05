import {Construct } from "constructs"
import * as ec2 from "aws-cdk-lib/aws-ec2"

export class WebTier extends Construct {

    readonly instances: ec2.Instance[] = []

    constructor(scope: Construct, id: string, vpc: ec2.Vpc) {
        super(scope, id)

        this.instances.push(this.webInstance("Web1", vpc))
        this.instances.push(this.webInstance("Web2", vpc))
    }

    private webInstance(id: string, vpc: ec2.Vpc): ec2.Instance {
        return new ec2.Instance(this, id, {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.C5, ec2.InstanceSize.LARGE),
            machineImage: ec2.MachineImage.latestAmazonLinux(),
            vpc: vpc
        })
    }
}