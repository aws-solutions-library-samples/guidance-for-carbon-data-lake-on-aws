import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_glue as glue } from 'aws-cdk-lib';

export class CarbonLakeGlueCompactionJobStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
    }
}