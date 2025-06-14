#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ThreeTierExample} from '../lib/three-tier-example';

const app = new cdk.App();

new ThreeTierExample(app, 'Tier3-DB-detailed',false);
new ThreeTierExample(app, 'Tier3-DB',true);