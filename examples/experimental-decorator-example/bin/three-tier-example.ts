#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {ThreeTierExample} from '../lib/three-tier-example';
import { Db, DbWithDiagramDecorator, DbWithDiagramSimpleDecorator, DbWithDiagramExplicitDecorator } from '../lib/db-tier';

const app = new cdk.App();

new ThreeTierExample(app, 'Tier3-DB-detailed3', DbWithDiagramDecorator);
new ThreeTierExample(app, 'Tier3-DB-detailed2', DbWithDiagramSimpleDecorator);
new ThreeTierExample(app, 'Tier3-DB-detailed1', DbWithDiagramExplicitDecorator);
new ThreeTierExample(app, 'Tier3-DB-default', Db);
