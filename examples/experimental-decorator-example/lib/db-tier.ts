import {Construct } from "constructs"
import * as rds from "aws-cdk-lib/aws-rds"
import * as ec2 from "aws-cdk-lib/aws-ec2"

import { DiagramOptions, CollapseTypes } from "cdk-dia"

export class Db extends rds.DatabaseCluster {
    constructor(scope: Construct, id: string, vpc: ec2.Vpc) {
        super(scope, id, dbProps(vpc));
    }
}

@DiagramOptions({ collapse: CollapseTypes.FORCE_NON_COLLAPSE })
export class DbWithDiagramDecorator extends rds.DatabaseCluster {
    constructor(scope: Construct, id: string, vpc: ec2.Vpc) {
        super(scope, id, dbProps(vpc));
    }
}

function dbProps(vpc: ec2.Vpc): rds.DatabaseClusterProps {
    return {
        engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_08_1 }),
        credentials: rds.Credentials.fromGeneratedSecret('clusteradmin'),
        instanceProps: { vpc: vpc }
    }
}
