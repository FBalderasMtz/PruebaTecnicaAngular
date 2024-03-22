const express = require('express');
const axios = require('axios');

const router = express.Router();
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const API_KEY = 'f9792168b84f41d0a1a7b94d1d02e203';

// Ruta para obtener las noticias
router.get('/news', async (req, res) => {
    try {
        const response = await axios.get(NEWS_API_URL, {
            params: {
                country: 'us', // Cambia esto según el país que desees obtener las noticias
                apiKey: API_KEY
            }
        });
        const news = response.data.articles;
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Error fetching news' });
    }
});

module.exports = router;
