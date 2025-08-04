import {
    coerceType,
    currentDebuggerState,
    loadProjectFromFile,
    runGraph
} from '@ironclad/rivet-node';

import { env } from 'process';

export async function runMessageGraph(input) {
    const outputs = await runRivetGraph('uLDGWIiCbhJiXnUV_JLQf', {
        messages: {
            type: 'object[]',
            value: input,
        },
    });

    return coerceType(outputs.output, 'string');
}

export async function runRivetGraph(graphId, inputs) {
    const project = currentDebuggerState.uploadedProject ?? await loadProjectFromFile('../../../rivet/ai.rivet-project');

    const outputs = await runGraph(project, {
        graph: graphId,
        openAiKey: env.OPENAI_API_KEY,
        inputs,
        remoteDebugger: undefined,
        externalFunctions: {
        },
    });

    return outputs;
}
