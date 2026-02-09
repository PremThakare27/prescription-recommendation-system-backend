const express = require('express');
const app = express();
const PORT = 5000;

// Middleware: This allows your server to understand JSON sent in a request body
app.use(express.json());

// Default Route
app.get('/', (req, res) => {
    res.send('Prescription Recommendation API is running...');
});

// Example Route: A placeholder for your recommendation logic
app.post('/api/recommend', (req, res) => {
    const { symptoms } = req.body;
    
    // Logic will eventually go here
    console.log("Received symptoms:", symptoms);
    
    res.json({
        message: "Symptoms received!",
        recommendation: "Consult a specialist for: " + symptoms
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`--- Server active on http://localhost:${PORT} ---`);
});