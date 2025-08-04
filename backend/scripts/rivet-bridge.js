#!/usr/bin/env node

const express = require('express');
const { runGraphInFile } = require('@ironclad/rivet-node');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        openAiKeySet: !!process.env.OPENAI_API_KEY
    });
});

/**
 * Execute Rivet workflow endpoint
 */
app.post('/execute', async (req, res) => {
    try {
        const { graphId, inputs } = req.body;
        
        console.log('[Rivet Bridge] Received request:', { graphId, inputs });
        
        if (!graphId) {
            return res.status(400).json({ error: 'graphId is required' });
        }
        
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'OPENAI_API_KEY environment variable is not set' });
        }
        
        const projectPath = path.join(__dirname, '../../rivet/ai.rivet-project');
        console.log('[Rivet Bridge] Project path:', projectPath);
        
        const startTime = Date.now();
        
        // Execute the Rivet workflow
        const result = await runGraphInFile(projectPath, {
            graphId,
            inputs: inputs || {},
            openAiKey: process.env.OPENAI_API_KEY
        });
        
        const executionTime = Date.now() - startTime;
        
        console.log('[Rivet Bridge] Execution completed in', executionTime, 'ms');
        console.log('[Rivet Bridge] Result:', JSON.stringify(result, null, 2));
        
        // Extract the output value if it exists
        let output = result;
        if (result && result.output && result.output.value) {
            output = result.output.value;
        }
        
        res.json({
            success: true,
            output: output,
            executionTime: executionTime,
            graphId: graphId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[Rivet Bridge] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(PORT, () => {
    console.log(`[Rivet Bridge] Server running on http://localhost:${PORT}`);
    console.log(`[Rivet Bridge] OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
});
