import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
export class SpaCdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
      const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, "RS-App-Task2-OAI");

      // Создание S3 бакета для SPA
      const spaBucket = new s3.Bucket(this, 'SpaBucket', {
        websiteIndexDocument: 'index.html',
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY
      });
  
      spaBucket.addToResourcePolicy(new iam.PolicyStatement({
        actions: ['S3:GetObject'],
        resources: [spaBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }));
  
      // Создание CloudFront дистрибутива
      const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SpaDistribution', {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: spaBucket,
              originAccessIdentity: cloudFrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      });
  
      // Деплой SPA в S3 бакет
      new s3deploy.BucketDeployment(this, 'DeploySpa', {
        sources: [s3deploy.Source.asset('../dist')],
        destinationBucket: spaBucket,
        distribution: distribution,
        distributionPaths: ['/*'],
      });
          // Вывод URL CloudFront дистрибутива
    new cdk.CfnOutput(this, 'SpaDistributionUrl', {
        value: distribution.distributionDomainName,
      });
    }
  }
  
  const app = new cdk.App();
  new SpaCdkStack(app, 'SpaCdkStack');  
