#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8091;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Proxy endpoint that forwards requests to Rivet bridge
app.post('/proxy/rivet', async (req, res) => {
    console.log('[Proxy] Received request:', req.body);
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch('http://localhost:3001/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
            timeout: 60000
        });
        
        const data = await response.json();
        console.log('[Proxy] Bridge response received');
        
        res.json(data);
        
    } catch (error) {
        console.error('[Proxy] Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`[Proxy] Server running on http://localhost:${PORT}`);
});
