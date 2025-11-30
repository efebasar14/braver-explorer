// backend/routes/ariesAI.js
const express = require('express');
const AriesAI = require('../ai/ariesAI');
const router = express.Router();

const ariesAI = new AriesAI();

// AI Health Check
router.get('/status', (req, res) => {
    res.json({
        status: ariesAI.isInitialized ? 'active' : 'initializing',
        model: 'Aries AI Engine v1.0',
        capabilities: [
            'coordinate_prediction',
            'geodetic_parameter_estimation', 
            'coordinate_transformation',
            'topographic_analysis'
        ],
        timestamp: new Date().toISOString()
    });
});

// Koordinat Kestirimi
router.post('/predict-coordinates', async (req, res) => {
    try {
        const { partialData } = req.body;
        
        if (!partialData) {
            return res.status(400).json({ error: 'partialData gereklidir' });
        }

        const prediction = await ariesAI.predictCoordinates(partialData);
        res.json(prediction);
    } catch (error) {
        console.error('Koordinat kestirim hatası:', error);
        res.status(500).json({ error: 'AI kestirim hatası' });
    }
});

// Jeodezik Parametre Kestirimi
router.post('/estimate-parameters', async (req, res) => {
    try {
        const { surveyData } = req.body;
        
        const estimation = await ariesAI.estimateGeodeticParameters(surveyData || {});
        res.json(estimation);
    } catch (error) {
        console.error('Parametre kestirim hatası:', error);
        res.status(500).json({ error: 'Parametre kestirim hatası' });
    }
});

// Koordinat Dönüşümü
router.post('/transform-coordinates', async (req, res) => {
    try {
        const { coordinates, fromSystem, toSystem } = req.body;
        
        if (!coordinates || !fromSystem || !toSystem) {
            return res.status(400).json({ 
                error: 'coordinates, fromSystem ve toSystem gereklidir' 
            });
        }

        const transformation = await ariesAI.transformCoordinates(
            coordinates, 
            fromSystem, 
            toSystem
        );
        
        res.json(transformation);
    } catch (error) {
        console.error('Koordinat dönüşüm hatası:', error);
        res.status(500).json({ error: 'Dönüşüm hatası' });
    }
});

// Topoğrafik Analiz
router.post('/analyze-topography', async (req, res) => {
    try {
        const { areaData } = req.body;
        
        const analysis = await ariesAI.analyzeTopography(areaData || {});
        res.json(analysis);
    } catch (error) {
        console.error('Topoğrafik analiz hatası:', error);
        res.status(500).json({ error: 'Analiz hatası' });
    }
});

// AI Chat - Mühendislik Sohbeti
router.post('/chat', async (req, res) => {
    try {
        const { message, context = 'geospatial' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Mesaj gereklidir' });
        }

        // Basit AI yanıtı (gerçek AI entegre edilecek)
        const responses = {
            geospatial: [
                "Harita projeniz için koordinat dönüşümü öneriyorum.",
                "Jeodezik parametrelerinizi optimize edebilirim.",
                "Bu bölge için topoğrafik analiz yapalım mı?",
                "Koordinat kestirimi ile eksik verileri tamamlayabilirim."
            ],
            cadastral: [
                "Kadastro verilerinizi AI ile analiz edebilirim.",
                "Parselasyon optimizasyonu için yardımcı olabilirim.",
                "Sınır anlaşmazlıklarında veri analizi yapabilirim."
            ],
            general: [
                "Aries AI olarak harita mühendisliği konusunda yardımcı olabilirim.",
                "Koordinat sistemleri hakkında sorularınızı yanıtlayabilirim.",
                "Jeodezik hesaplamalar için buradayım!"
            ]
        };

        const categoryResponses = responses[context] || responses.general;
        const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

        res.json({
            response,
            context,
            confidence: 0.85 + Math.random() * 0.1,
            suggestions: [
                'Koordinat kestirimi yap',
                'Parametreleri optimize et',
                'Topoğrafik analiz yap'
            ]
        });
    } catch (error) {
        console.error('AI chat hatası:', error);
        res.status(500).json({ error: 'Chat hatası' });
    }
});

module.exports = router;