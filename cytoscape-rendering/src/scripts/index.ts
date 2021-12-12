import * as cytoscape from 'cytoscape';
import '../styles/index.scss';

cytoscape.use(require('cytoscape-elk'));

const initCytoscape =   async () => {

    const elements = await fetch('cy-elements.json')
    const styles = await fetch('cy-styles.json')

    const cy: cytoscape.Core = cytoscape({
        container: document.getElementById('cy'), // container to render in
        elements: await elements.json(),
        style: await styles.json(),
        layout: {
            name: 'elk',
            // @ts-ignore
            nodeDimensionsIncludeLabels: true, // Boolean which changes whether label dimensions are included when calculating node dimensions
            fit: true, // Whether to fit
            padding: 30, // Padding on fit
            // @ts-ignore
            priority: () => undefined,
            // @ts-ignore
            elk: {
                'algorithm': 'layered', // best found: rectpacking, layered, box
                // supported options for algorithm:layered https://www.eclipse.org/elk/reference/algorithms/org-eclipse-elk-layered.html
                'elk.direction': 'UNDEFINED',
                'elk.layered.wrapping.additionalEdgeSpacing': 30,
                'elk.alignment': 'UNDEFINED',
                'elk.layered.spacing.nodeNodeBetweenLayers': 50, // default: 20
                'elk.layered.spacing.edgeEdgeBetweenLayers': 50, // default: 10
                'elk.layered.considerModelOrder.strategy': 'NONE', // NONE / NODES_AND_EDGES / PREFER_EDGES, default: NONE
            }
        }
    });
    cy.resize();
    cy.zoom(1);
    cy.center();
}

initCytoscape()