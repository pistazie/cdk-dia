
export const testCases: TestConf[] = [
    {
        id:`collapsed`,
        jsonTreeFile: "multiple-similar-stacks",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "multiple-similar-stacks",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "multiple-similar-stacks-with-usage-of-collapsing-customizer",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "multiple-similar-stacks-with-usage-of-collapsing-customizer",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "function-and-queue",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "function-and-queue",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "the-eventbridge-etl",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "the-eventbridge-etl",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "2_queues-are-subscribed-to-a-topic",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "2_queues-are-subscribed-to-a-topic",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "fargate-service-with-vpc",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "fargate-service-with-vpc",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "cloudstructs-static-website",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "cloudstructs-static-website",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "ec-loadbalancer-rds",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "ec-loadbalancer-rds",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "cdk_pipeline_with_stages_stacks_and_construct_infos",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "custom-resource",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false
    },
    {
        id:`collapsed`,
        jsonTreeFile: "custom-resource",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true
    }
]

export interface TestConf {
    id: string
    jsonTreeFile: string
    cdkTreePath: string
    collapsed: boolean
}
