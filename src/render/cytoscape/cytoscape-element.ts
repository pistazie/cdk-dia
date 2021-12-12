
// https://js.cytoscape.org/#notation/elements-json

export interface CytoscapeElementNode {
    data: {
        id: string,
        [x: string]: any;
    }
    [x: string]: any;
}

export interface CytoscapeElementEdge {
    data: {
        source: string,
        target: string,
        [x: string]: any;
    }

    [x: string]: any;
}

export type CytoscapeElement = CytoscapeElementNode | CytoscapeElementEdge