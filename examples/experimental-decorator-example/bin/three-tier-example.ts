#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ThreeTierExample} from '../lib/three-tier-example';
import { Db, DbWithDiagramDecorator } from '../lib/db-tier';

const app = new cdk.App();

new ThreeTierExample(app, 'Tier3-DB-detailed', DbWithDiagramDecorator);
new ThreeTierExample(app, 'Tier3-DB', Db);
