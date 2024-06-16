#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SpaCdkStack } from '../lib/cdk-stack';

class AwsHostingStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string) {
    super(parent, name);

    new SpaCdkStack(this, 'AWSRSStack');
  }
}
const app = new cdk.App();

new AwsHostingStack(app, 'AWSRSStack');

app.synth();