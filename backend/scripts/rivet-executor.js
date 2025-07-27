#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Execute Rivet CLI and return JSON result
 */
async function executeRivet(graphId, inputs) {
    return new Promise((resolve, reject) => {
        const projectPath = path.join(__dirname, '../../rivet/ai.rivet-project');
        
        // Build command arguments
        const args = ['@ironclad/rivet-cli', 'run', projectPath];
        
        if (graphId) {
            args.push(graphId);
        }
        
        // Add inputs
        for (const [key, value] of Object.entries(inputs || {})) {
            args.push('--input');
            args.push(`${key}=${value}`);
        }
        
        console.log('[Rivet Executor] Running command:', 'npx', args.join(' '));
        
        // Spawn the process
        const child = spawn('npx', args, {
            cwd: path.join(__dirname, '../..'),
            env: {
                ...process.env,
                OPENAI_API_KEY: process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY || ''
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            console.log('[Rivet Executor] Command finished with code:', code);
            console.log('[Rivet Executor] Stdout:', stdout);
            if (stderr) console.log('[Rivet Executor] Stderr:', stderr);
            
            if (code !== 0) {
                reject(new Error(`Rivet CLI exited with code ${code}: ${stderr || stdout}`));
                return;
            }
            
            try {
                // Try to parse as JSON
                const result = JSON.parse(stdout.trim());
                resolve(result);
            } catch (parseError) {
                console.log('[Rivet Executor] Failed to parse JSON, returning raw output');
                resolve({ output: stdout.trim(), raw: true });
            }
        });
        
        child.on('error', (error) => {
            console.log('[Rivet Executor] Spawn error:', error);
            reject(error);
        });
        
        // Set timeout
        setTimeout(() => {
            child.kill('SIGTERM');
            reject(new Error('Rivet execution timed out'));
        }, 60000); // 60 second timeout
    });
}

// If called directly from command line
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node rivet-executor.js <graphId> [inputs-json]');
        process.exit(1);
    }
    
    const graphId = args[0];
    const inputs = args[1] ? JSON.parse(args[1]) : {};
    
    executeRivet(graphId, inputs)
        .then(result => {
            console.log(JSON.stringify(result, null, 2));
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
} else {
    module.exports = { executeRivet };
}
