const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    query: {
        type: String,
        required: [true, 'Arama sorgusu gereklidir'],
        trim: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    results: [{
        url: String,
        title: String,
        snippet: String,
        source: String,
        rank: Number
    }],
    resultCount: {
        type: Number,
        default: 0
    },
    source: {
        type: String,
        enum: ['newsapi', 'yandex', 'internal', 'demo', 'braver'],
        default: 'braver'
    },
    searchType: {
        type: String,
        enum: ['web', 'images', 'news', 'maps'],
        default: 'web'
    },
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    ipAddress: String,
    userAgent: String,
    responseTime: Number, // ms cinsinden
    isSuccessful: { type: Boolean, default: true }
});

// Text index for search
searchHistorySchema.index({ query: 'text' });
searchHistorySchema.index({ userId: 1, timestamp: -1 });
searchHistorySchema.index({ sessionId: 1, timestamp: -1 });

// Sanal alan: arama süresi
searchHistorySchema.virtual('searchDuration').get(function() {
    return this.responseTime ? `${this.responseTime}ms` : 'Bilinmiyor';
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);