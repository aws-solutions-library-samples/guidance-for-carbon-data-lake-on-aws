import { Match, Template } from "aws-cdk-lib/assertions";
import { App, Stack } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';

import { CarbonlakeQuickstartStatemachineStack } from "../../../lib/pipeline/statemachine/carbonlake-qs-statemachine-stack";

describe('test statemachine stack', () => {
    let template: Template | null;

    beforeEach(() => {
        /* ====== SETUP ====== */
        const app = new App();

        // Statemachine stack requires the following props, create a dummy stack
        // to provide suitable inputs:
        //   - dataLineageFunction
        //   - dataQualityJob => this is a dummy placeholder until the data quality job is ready
        //   - s3copierFunction => stand-in lambda function for the dataQualityJob
        //   - glueTransformJobName
        //   - batchEnumLambda
        //   - calculationJob
        const dummyInputsStack = new Stack(app, "DummyInputsStack");
        const dummyLambda = new lambda.Function(dummyInputsStack, "dummyLambda", {
            runtime: lambda.Runtime.PYTHON_3_9,
            code: lambda.Code.fromInline("def lambda_handler(): pass"),
            handler: "lambda_handler"
        });

        // statemachineStack is a nested stack, so create a parent placeholder
        const parentStack = new Stack(app, "ParentPipelineStack", {})

        // create the pipeline stack with the required props
        const statemachineStack = new CarbonlakeQuickstartStatemachineStack(parentStack, "PipelineStack", {
            dataLineageFunction: dummyLambda,
            dataQualityJob: "abc",
            s3copierLambda: dummyLambda,
            glueTransformJobName: "xyz",
            batchEnumLambda: dummyLambda,
            calculationJob: dummyLambda,
        });

        // synth a cloudformation template from the stack
        template = Template.fromStack(statemachineStack);
    });

    afterEach(() => { template = null })

    test("synthesises as expected", () => {
        /* ====== ASSERTIONS ====== */
        template?.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
        template?.resourceCountIs("AWS::IAM::Role", 1);
        template?.resourceCountIs("AWS::IAM::Policy", 1);
    });
})