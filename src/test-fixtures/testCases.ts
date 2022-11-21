
export const testCases: TestConf[] = [
    {
        id:`collapsed`,
        jsonTreeFile: "multiple-similar-stacks",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "multiple-similar-stacks",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "multiple-similar-stacks-with-usage-of-collapsing-customizer",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "multiple-similar-stacks-with-usage-of-collapsing-customizer",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "function-and-queue",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "function-and-queue",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "the-eventbridge-etl",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "the-eventbridge-etl",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "2_queues-are-subscribed-to-a-topic",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "2_queues-are-subscribed-to-a-topic",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "fargate-service-with-vpc",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "fargate-service-with-vpc",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "cloudstructs-static-website",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "cloudstructs-static-website",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "ec-loadbalancer-rds",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "ec-loadbalancer-rds",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "cdk_pipeline_with_stages_stacks_and_construct_infos",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`non-collapsed`,
        jsonTreeFile: "custom-resource",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed`,
        jsonTreeFile: "custom-resource",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    },
    {
        id:`collapsed-dontRemoveCrossStackEdges`,
        jsonTreeFile: "two-stack-with-a-relationship",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    },
]

export interface TestConf {
    id: string
    jsonTreeFile: string
    cdkTreePath: string
    collapsed: boolean
    collapsedDoubleClusters: boolean
}
