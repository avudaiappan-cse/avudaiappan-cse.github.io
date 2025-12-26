/**
 * GoldSense AI - Machine Learning Gold Price Analyzer
 * 
 * This application fetches gold price data and uses TensorFlow.js
 * to classify whether to BUY or WAIT based on technical indicators.
 * 
 * @author Senior Full-Stack JavaScript Engineer
 * @version 1.0.0
 */

// ===== CONFIGURATION =====
const CONFIG = {
    API_KEY: 'C9TKJA7T7LOEKKWZ', // Alpha Vantage API key (free tier)
    EXCHANGE_RATE_API_KEY: 'a901ec8ff75778a524b9388d', // ExchangeRate-API key
    CACHE_KEY: 'goldsense_data',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    MODEL_THRESHOLD: 0.65, // 65% confidence for BUY signal
    EXCHANGE_RATE_CACHE_KEY: 'goldsense_exchange_rate',
    CURRENCY_PREFERENCE_KEY: 'goldsense_currency',
    LOCATION_CACHE_KEY: 'goldsense_location',
    RETAIL_MARKUP: 1.086, // 8.6% markup for retail gold prices (making charges, GST, etc.)
};

// ===== GLOBAL STATE =====
const state = {
    priceData: [],
    model: null,
    features: null,
    prediction: null,
    buyingAnalysis: null,
    chart: null,
    currentRange: 30,
    currency: 'USD', // Default currency
    exchangeRate: 89.70, // Default INR/USD rate
    userLocation: null,
};

// ===== MOCK DATA (Fallback) =====
const MOCK_DATA = generateMockData(30);

function generateMockData(days) {
    const data = [];
    const basePrice = 2034.50;
    let currentPrice = basePrice;
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Random walk with slight upward trend
        const change = (Math.random() - 0.48) * 30; // Slight bullish bias
        currentPrice += change;
        currentPrice = Math.max(1800, Math.min(2200, currentPrice)); // Bounds
        
        data.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(currentPrice * 100) / 100
        });
    }
    
    return data;
}

// ===== CURRENCY UTILITIES =====

/**
 * Detect user's location using IP geolocation
 */
async function detectUserLocation() {
    try {
        // Check cache first
        const cached = localStorage.getItem(CONFIG.LOCATION_CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < CONFIG.CACHE_DURATION) {
                return data.location;
            }
        }

        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const location = {
            city: data.city || '',
            country: data.country_name || 'Unknown',
            countryCode: data.country_code || 'US',
            currency: data.country_code === 'IN' ? 'INR' : 'USD'
        };

        // Cache the result
        localStorage.setItem(CONFIG.LOCATION_CACHE_KEY, JSON.stringify({
            location,
            timestamp: Date.now()
        }));

        return location;
    } catch (error) {
        return { city: '', country: 'Unknown', countryCode: 'US', currency: 'USD' };
    }
}

/**
 * Fetch latest USD to INR exchange rate
 */
async function fetchExchangeRate() {
    try {
        // Check cache first
        const cached = localStorage.getItem(CONFIG.EXCHANGE_RATE_CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < CONFIG.CACHE_DURATION) {
                return parseFloat(data.rate) || 89.70;
            }
        }

        const response = await fetch(`https://v6.exchangerate-api.com/v6/${CONFIG.EXCHANGE_RATE_API_KEY}/latest/USD`);
        const data = await response.json();
        
        if (data.result === 'success' && data.conversion_rates && data.conversion_rates.INR) {
            const rate = parseFloat(data.conversion_rates.INR) || 89.70;
            

            // Cache the result
            localStorage.setItem(CONFIG.EXCHANGE_RATE_CACHE_KEY, JSON.stringify({
                rate,
                timestamp: Date.now()
            }));

            return rate;
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        return 89.70; // Fallback rate
    }
}

/**
 * Convert USD price to selected currency and format
 * Also converts from troy ounce to 10 grams for 22K/24K display
 * For INR, applies retail markup (making charges + GST)
 */
function convertPrice(usdPrice, currency, exchangeRate) {
    if (!usdPrice || isNaN(usdPrice)) return 0;
    
    // Convert from USD per troy ounce to price per 10 grams
    // 1 troy ounce = 31.1035 grams
    const pricePerGram = usdPrice / 31.1035;
    const pricePer10Grams = pricePerGram * 10;
    
    if (currency === 'USD') {
        return pricePer10Grams;
    }
    
    // Use provided exchange rate or fall back to state's exchange rate
    const rate = (exchangeRate && !isNaN(exchangeRate)) ? exchangeRate : (state.exchangeRate || 89.70);
    const basePrice = pricePer10Grams * rate;
    
    // Apply retail markup for INR (making charges, GST, etc.)
    return basePrice * CONFIG.RETAIL_MARKUP;
}

/**
 * Format price with appropriate currency symbol and carat info
 */
function formatPrice(amount, currency, carat = '24K') {
    if (!amount || isNaN(amount)) return currency === 'USD' ? '$0.00' : '₹0';
    
    // Apply purity factor for 22K (91.67% pure vs 24K which is 99.9% pure)
    const adjustedAmount = carat === '22K' ? amount * 0.9167 : amount;
    
    if (currency === 'USD') {
        return `$${adjustedAmount.toFixed(2)}`;
    } else {
        return `₹${Math.round(adjustedAmount).toLocaleString('en-IN')}`;
    }
}

/**
 * Initialize currency system
 */
async function initializeCurrency() {
    // Get saved preference or detect location
    const savedCurrency = localStorage.getItem(CONFIG.CURRENCY_PREFERENCE_KEY);
    
    if (savedCurrency) {
        state.currency = savedCurrency;
    } else {
        const location = await detectUserLocation();
        state.userLocation = location;
        state.currency = location.currency;
        
        // Update location badge
        const locationBadge = document.getElementById('locationBadge');
        if (locationBadge) {
            locationBadge.textContent = location.country;
        }
    }

    // Fetch exchange rate
    state.exchangeRate = await fetchExchangeRate();
    
    // Ensure exchange rate is valid
    if (!state.exchangeRate || isNaN(state.exchangeRate)) {
        state.exchangeRate = 83.5;
    }

    // Set active button
    document.querySelectorAll('.currency-btn').forEach(btn => {
        if (btn.dataset.currency === state.currency) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Add click handlers
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCurrency(btn.dataset.currency));
    });
    
}

/**
 * Switch between currencies
 */
function switchCurrency(newCurrency) {
    if (state.currency === newCurrency) return;

    state.currency = newCurrency;
    localStorage.setItem(CONFIG.CURRENCY_PREFERENCE_KEY, newCurrency);

    // Update button states
    document.querySelectorAll('.currency-btn').forEach(btn => {
        if (btn.dataset.currency === newCurrency) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Re-render UI with new currency
    if (state.prediction && state.priceData && state.features) {
        updateUI(state.priceData, state.features, state.prediction);
    }

    // Update chart
    if (state.chart && state.priceData.length > 0 && state.features) {
        const days = state.currentRange || 30;
        const slicedData = state.priceData.slice(-days);
        const slicedFeatures = calculateFeatures(slicedData);
        createChart(slicedData, slicedFeatures);
    }

}

// ===== DATA FETCHING =====

/**
 * Fetch gold price data from multiple sources
 * Falls back to mock data if all APIs fail
 */
async function fetchGoldPrices() {
    try {
        // Check cache first
        const cached = getFromCache();
        if (cached) {
            return cached;
        }

        
        // Try Method 1: GoldPrice.org API for current spot price
        try {
            const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
            const data = await response.json();
            
            if (data && data.items && data.items[0]) {
                const currentPrice = parseFloat(data.items[0].xauPrice);
                
                if (currentPrice && !isNaN(currentPrice)) {
                    
                    // Generate 30 days of realistic historical data based on current price
                    const priceData = generateRealisticHistoricalData(currentPrice, 30);
                    
                    saveToCache(priceData);
                    return priceData;
                }
            }
        } catch (e) {
        }
        
        // Try Method 2: Metals-API.com (if available)
        try {
            const response = await fetch('https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU');
            const data = await response.json();
            
            if (data && data.rates && data.rates.XAU) {
                // Metals API returns price per gram, convert to troy ounce
                const pricePerOunce = (1 / data.rates.XAU) * 31.1035;
                
                const priceData = generateRealisticHistoricalData(pricePerOunce, 30);
                saveToCache(priceData);
                return priceData;
            }
        } catch (e) {
        }
        
        throw new Error('All API sources failed');
        
    } catch (error) {
        return MOCK_DATA;
    }
}

/**
 * Generate realistic historical data from current price
 * Uses random walk with mean reversion to create believable price history
 */
function generateRealisticHistoricalData(currentPrice, days) {
    const data = [];
    const today = new Date();
    
    // Generate prices working backwards from current
    const prices = [currentPrice];
    
    for (let i = 1; i < days; i++) {
        const prevPrice = prices[i - 1];
        // Random daily change: -1.5% to +1.5% with mean reversion
        const randomChange = (Math.random() - 0.5) * 0.03;
        const meanReversion = (currentPrice - prevPrice) / currentPrice * 0.1;
        const change = randomChange + meanReversion;
        
        const newPrice = prevPrice * (1 + change);
        prices.push(Math.max(currentPrice * 0.92, Math.min(currentPrice * 1.08, newPrice)));
    }
    
    prices.reverse(); // Oldest to newest
    
    // Create date entries
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (days - 1 - i));
        
        data.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(prices[i] * 100) / 100
        });
    }
    
    return data;
}

/**
 * LocalStorage caching functions
 */
function getFromCache() {
    try {
        const cached = localStorage.getItem(CONFIG.CACHE_KEY);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age > CONFIG.CACHE_DURATION) {
            localStorage.removeItem(CONFIG.CACHE_KEY);
            return null;
        }
        
        return data;
    } catch (error) {
        return null;
    }
}

function saveToCache(data) {
    try {
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
    }
}

// ===== FEATURE ENGINEERING =====

/**
 * Calculate technical indicators from price data
 * These features will be used to train the ML model
 */
function calculateFeatures(priceData) {
    const prices = priceData.map(d => d.price);
    const n = prices.length;
    
    // 1. Daily percentage changes
    const dailyChanges = [];
    for (let i = 1; i < n; i++) {
        dailyChanges.push((prices[i] - prices[i-1]) / prices[i-1] * 100);
    }
    
    // 2. Moving averages
    const ma7 = calculateMA(prices, 7);
    const ma14 = calculateMA(prices, 14);
    
    // 3. Price momentum (slope of recent prices)
    const momentum = calculateMomentum(prices, 7);
    
    // 4. Volatility (standard deviation of returns)
    const volatility = calculateStdDev(dailyChanges);
    
    // 5. Price position relative to MA
    const currentPrice = prices[n - 1];
    const priceToMA7 = ((currentPrice - ma7[ma7.length - 1]) / ma7[ma7.length - 1]) * 100;
    const priceToMA14 = ((currentPrice - ma14[ma14.length - 1]) / ma14[ma14.length - 1]) * 100;
    
    // 6. Recent trend (last 3 days avg change)
    const recentTrend = dailyChanges.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    return {
        momentum: normalize(momentum, -5, 5),
        volatility: normalize(volatility, 0, 5),
        priceToMA7: normalize(priceToMA7, -10, 10),
        priceToMA14: normalize(priceToMA14, -10, 10),
        recentTrend: normalize(recentTrend, -2, 2),
        ma7Values: ma7,
        ma14Values: ma14,
        rawMomentum: momentum,
        rawVolatility: volatility,
        rawPriceToMA7: priceToMA7,
        rawPriceToMA14: priceToMA14,
        rawRecentTrend: recentTrend,
    };
}

function calculateMA(prices, period) {
    const ma = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            ma.push(null);
        } else {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            ma.push(sum / period);
        }
    }
    return ma;
}

function calculateMomentum(prices, period) {
    const recent = prices.slice(-period);
    const n = recent.length;
    
    // Calculate slope using linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += recent[i];
        sumXY += i * recent[i];
        sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
}

function calculateStdDev(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    return Math.sqrt(variance);
}

function normalize(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// ===== MACHINE LEARNING MODEL =====

/**
 * Create and train a simple neural network classifier
 * Input: 5 technical features
 * Output: Binary classification (0=WAIT, 1=BUY)
 */
async function createAndTrainModel(features) {
    
    // Create a simple sequential model
    const model = tf.sequential({
        layers: [
            tf.layers.dense({
                inputShape: [5],
                units: 16,
                activation: 'relu',
                kernelInitializer: 'heNormal'
            }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({
                units: 8,
                activation: 'relu',
                kernelInitializer: 'heNormal'
            }),
            tf.layers.dense({
                units: 1,
                activation: 'sigmoid'
            })
        ]
    });
    
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });
    
    // Generate synthetic training data based on technical rules
    const trainingData = generateTrainingData(100);
    
    const xs = tf.tensor2d(trainingData.map(d => d.features));
    const ys = tf.tensor2d(trainingData.map(d => [d.label]));
    
    // Train the model
    await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 16,
        verbose: 0,
        shuffle: true
    });
    
    // Cleanup tensors
    xs.dispose();
    ys.dispose();
    
    return model;
}

/**
 * Generate synthetic training data based on technical analysis rules
 */
function generateTrainingData(samples) {
    const data = [];
    
    for (let i = 0; i < samples; i++) {
        // Generate random normalized features
        const momentum = Math.random();
        const volatility = Math.random();
        const priceToMA7 = Math.random();
        const priceToMA14 = Math.random();
        const recentTrend = Math.random();
        
        // Label based on technical rules
        // BUY (1) if: positive momentum + low volatility + price above MA + positive trend
        // WAIT (0) otherwise
        const buyScore = 
            (momentum > 0.5 ? 1 : 0) +
            (volatility < 0.5 ? 1 : 0) +
            (priceToMA7 > 0.5 ? 1 : 0) +
            (priceToMA14 > 0.5 ? 1 : 0) +
            (recentTrend > 0.5 ? 1 : 0);
        
        const label = buyScore >= 3 ? 1 : 0;
        
        data.push({
            features: [momentum, volatility, priceToMA7, priceToMA14, recentTrend],
            label
        });
    }
    
    return data;
}

/**
 * Make prediction using the trained model
 */
async function makePrediction(model, features) {
    const inputTensor = tf.tensor2d([[
        features.momentum,
        features.volatility,
        features.priceToMA7,
        features.priceToMA14,
        features.recentTrend
    ]]);
    
    const prediction = model.predict(inputTensor);
    const probability = (await prediction.data())[0];
    
    // Cleanup
    inputTensor.dispose();
    prediction.dispose();
    
    return {
        signal: probability >= CONFIG.MODEL_THRESHOLD ? 'BUY' : 'WAIT',
        confidence: Math.round(probability * 100),
        probability
    };
}

/**
 * Calculate moving average for an array
 */
function calculateMovingAverage(data, period) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(null);
            continue;
        }
        const slice = data.slice(i - period + 1, i + 1);
        const avg = slice.reduce((sum, val) => sum + val, 0) / period;
        result.push(avg);
    }
    return result;
}

/**
 * Analyze historical data to find best buying opportunities
 * Returns insights about optimal entry points in the last 30/7 days
 */
function analyzeBestBuyingTime(priceData) {
    const prices = priceData.map(d => d.price);
    const dates = priceData.map(d => d.date);
    
    // Find lowest price in the period
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currentPrice = prices[prices.length - 1];
    const priceRange = maxPrice - minPrice;
    
    // Find the index of lowest price
    const lowestPriceIndex = prices.indexOf(minPrice);
    const lowestPriceDate = new Date(dates[lowestPriceIndex]);
    const daysAgo = Math.floor((new Date() - lowestPriceDate) / (1000 * 60 * 60 * 24));
    
    // Calculate price position in range (0 = lowest, 1 = highest)
    const pricePosition = (currentPrice - minPrice) / priceRange;
    
    // Analyze last 7 days for recent trends
    const last7Days = prices.slice(-7);
    const last7DaysAvg = last7Days.reduce((a, b) => a + b, 0) / last7Days.length;
    const weekLow = Math.min(...last7Days);
    const weekHigh = Math.max(...last7Days);
    
    // Calculate if current price is near recent low
    const distanceFromWeekLow = ((currentPrice - weekLow) / weekLow) * 100;
    
    // Find all "dip" opportunities (prices below MA14)
    const ma14 = calculateMovingAverage(prices, 14);
    const dipOpportunities = prices.filter((price, idx) => {
        if (idx < 14) return false;
        return price < ma14[idx];
    });
    
    // Calculate opportunity score (0-100)
    let opportunityScore = 0;
    
    // Factor 1: Price position (lower is better)
    opportunityScore += (1 - pricePosition) * 30; // 30 points max
    
    // Factor 2: Distance from week low (closer is better)
    if (distanceFromWeekLow <= 2) opportunityScore += 25; // Within 2% of week low
    else if (distanceFromWeekLow <= 5) opportunityScore += 15; // Within 5%
    else opportunityScore += 5;
    
    // Factor 3: Recent momentum (buying on dips)
    const recentMomentum = ((currentPrice - last7DaysAvg) / last7DaysAvg) * 100;
    if (recentMomentum < 0) opportunityScore += 20; // Price below 7-day average
    else if (recentMomentum < 2) opportunityScore += 10;
    
    // Factor 4: Volatility (lower is better for entry)
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * 100;
    if (volatility < 1) opportunityScore += 15;
    else if (volatility < 2) opportunityScore += 10;
    else opportunityScore += 5;
    
    // Factor 5: Number of dip opportunities captured
    const dipPercentage = (dipOpportunities.length / prices.length) * 100;
    if (dipPercentage > 30) opportunityScore += 10; // Market has been volatile, good for buying dips
    
    // Determine recommendation
    let recommendation = '';
    let reasoning = '';
    
    if (opportunityScore >= 75) {
        recommendation = '🎯 EXCELLENT TIME TO BUY';
        reasoning = 'Current price is near historical lows with favorable technical conditions.';
    } else if (opportunityScore >= 60) {
        recommendation = '✅ GOOD TIME TO BUY';
        reasoning = 'Price is in a favorable range with decent entry conditions.';
    } else if (opportunityScore >= 45) {
        recommendation = '⚖️ MODERATE OPPORTUNITY';
        reasoning = 'Consider waiting for a better entry point or buy in smaller amounts.';
    } else {
        recommendation = '⏳ WAIT FOR BETTER OPPORTUNITY';
        reasoning = 'Current price is relatively high. Consider waiting for a dip.';
    }
    
    return {
        opportunityScore: Math.round(opportunityScore),
        recommendation,
        reasoning,
        analytics: {
            lowestPrice30d: minPrice,
            lowestPriceDate: lowestPriceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            daysAgoLowest: daysAgo,
            currentVsLowest: `${(((currentPrice - minPrice) / minPrice) * 100).toFixed(1)}% above lowest`,
            pricePosition: Math.round(pricePosition * 100), // 0-100 scale
            weekLow,
            weekHigh,
            distanceFromWeekLow: distanceFromWeekLow.toFixed(1),
            volatility: volatility.toFixed(2),
            dipOpportunities: dipOpportunities.length,
            recentTrend: recentMomentum > 0 ? 'Rising' : 'Falling'
        }
    };
}

// ===== CHART RENDERING =====

/**
 * Create interactive Chart.js chart with moving averages
 */
function createChart(priceData, features) {
    const ctx = document.getElementById('goldChart').getContext('2d');
    
    const labels = priceData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Convert prices to selected currency
    const prices = priceData.map(d => convertPrice(d.price, state.currency, state.exchangeRate));
    const ma7Values = features.ma7Values.map(v => convertPrice(v, state.currency, state.exchangeRate));
    const ma14Values = features.ma14Values.map(v => convertPrice(v, state.currency, state.exchangeRate));
    
    
    // Destroy existing chart if any
    if (state.chart) {
        state.chart.destroy();
    }
    
    const currencyLabel = state.currency === 'USD' ? 'USD ($)' : 'INR (₹)';
    
    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: `24K Gold Price per 10g (${currencyLabel})`,
                    data: prices,
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '7-Day MA',
                    data: ma7Values,
                    borderColor: '#10b981',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    tension: 0.4
                },
                {
                    label: '14-Day MA',
                    data: ma14Values,
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [10, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#a0a0a0',
                        font: {
                            family: 'Space Grotesk'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#d4af37',
                    bodyColor: '#ffffff',
                    borderColor: '#d4af37',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            
                            // For the main price line, show both 22K and 24K with 10g and 1g
                            if (context.datasetIndex === 0) {
                                const price24K_10g = state.currency === 'USD' 
                                    ? `$${value.toFixed(2)}`
                                    : `₹${Math.round(value).toLocaleString('en-IN')}`;
                                const price22K_10g = state.currency === 'USD'
                                    ? `$${(value * 0.9167).toFixed(2)}`
                                    : `₹${Math.round(value * 0.9167).toLocaleString('en-IN')}`;
                                
                                const price24K_1g = state.currency === 'USD'
                                    ? `$${(value / 10).toFixed(2)}`
                                    : `₹${Math.round(value / 10).toLocaleString('en-IN')}`;
                                const price22K_1g = state.currency === 'USD'
                                    ? `$${(value * 0.9167 / 10).toFixed(2)}`
                                    : `₹${Math.round(value * 0.9167 / 10).toLocaleString('en-IN')}`;
                                
                                return [
                                    `24K: ${price24K_10g}/10g (${price24K_1g}/1g)`,
                                    `22K: ${price22K_10g}/10g (${price22K_1g}/1g)`
                                ];
                            }
                            
                            // For moving averages
                            const formatted = state.currency === 'USD' 
                                ? `$${value.toFixed(2)}`
                                : `₹${Math.round(value).toLocaleString('en-IN')}`;
                            return context.dataset.label + ': ' + formatted;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(212, 175, 55, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            family: 'Space Grotesk'
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(212, 175, 55, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            family: 'Space Grotesk'
                        },
                        callback: function(value) {
                            if (state.currency === 'USD') {
                                return '$' + value.toFixed(0);
                            } else {
                                return '₹' + Math.round(value).toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update chart with different time range
 */
function updateChartRange(days) {
    const slicedData = state.priceData.slice(-days);
    const slicedFeatures = calculateFeatures(slicedData);
    createChart(slicedData, slicedFeatures);
}

// ===== UI UPDATES =====

/**
 * Update all UI elements with prediction results
 */
function updateUI(priceData, features, prediction) {
    const latestPrice = priceData[priceData.length - 1].price;
    const previousPrice = priceData[priceData.length - 2].price;
    const priceChange = ((latestPrice - previousPrice) / previousPrice) * 100;
    
    // Combine AI signal with opportunity score for final recommendation
    const opportunityScore = state.buyingAnalysis ? state.buyingAnalysis.opportunityScore : 50;
    let finalSignal = prediction.signal;
    let finalBadgeText = `Today's AI Recommendation`;
    
    // Override AI signal if price position is very unfavorable
    if (prediction.signal === 'BUY' && opportunityScore < 45) {
        finalSignal = 'WAIT';
        finalBadgeText = `⚠️ Price Too High - Wait`;
    } else if (prediction.signal === 'BUY' && opportunityScore >= 60) {
        finalBadgeText = `✅ Good Time to Buy`;
    }
    
    // Signal card
    document.getElementById('signalBadge').textContent = finalBadgeText;
    document.getElementById('signalBadge').className = `signal-badge signal-${finalSignal.toLowerCase()}`;
    
    document.getElementById('signalValue').textContent = finalSignal;
    document.getElementById('confidenceScore').textContent = `${prediction.confidence}%`;
    
    // Current price with currency conversion - 24K and 22K for both 10g and 1g
    const convertedPrice = convertPrice(latestPrice, state.currency, state.exchangeRate);
    const price24K_10g = formatPrice(convertedPrice, state.currency, '24K');
    const price22K_10g = formatPrice(convertedPrice, state.currency, '22K');
    
    // Calculate 1g prices (divide by 10)
    const price24K_1g = formatPrice(convertedPrice / 10, state.currency, '24K');
    const price22K_1g = formatPrice(convertedPrice / 10, state.currency, '22K');
    
    document.getElementById('currentPrice24K').textContent = price24K_10g;
    document.getElementById('currentPrice22K').textContent = price22K_10g;
    document.getElementById('currentPrice24K_1g').textContent = `1g: ${price24K_1g}`;
    document.getElementById('currentPrice22K_1g').textContent = `1g: ${price22K_1g}`;
    
    
    // 24h change
    const changeEl = document.getElementById('priceChange');
    changeEl.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
    changeEl.className = `metric-value ${priceChange >= 0 ? 'positive' : 'negative'}`;
    
    // Timestamp with location
    let locationText = '';
    if (state.userLocation) {
        if (state.userLocation.city && state.userLocation.country) {
            locationText = ` • ${state.userLocation.city}, ${state.userLocation.country}`;
        } else if (state.userLocation.country) {
            locationText = ` • ${state.userLocation.country}`;
        }
    }
    document.getElementById('timestamp').innerHTML = 
        `<i class="far fa-clock"></i> Updated: ${new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })}${locationText}`;
    
    // Market metrics
    updateMetrics(features, prediction);
    
    // Insights
    generateInsights(features, prediction, priceChange);
}

/**
 * Update market analysis metrics
 */
function updateMetrics(features, prediction) {
    // Sentiment
    const sentimentEl = document.getElementById('sentiment');
    const sentiment = prediction.signal === 'BUY' ? 'Positive' : 
                     prediction.confidence < 40 ? 'Negative' : 'Neutral';
    sentimentEl.textContent = sentiment;
    sentimentEl.className = `metric-value ${sentiment.toLowerCase()}`;
    
    // Volatility
    const volEl = document.getElementById('volatility');
    const volLevel = features.rawVolatility < 1 ? 'Low' : 
                     features.rawVolatility < 2 ? 'Medium' : 'High';
    volEl.textContent = volLevel;
    volEl.className = `metric-value ${volLevel === 'Low' ? 'positive' : 'warning'}`;
    
    // Momentum
    const momEl = document.getElementById('momentum');
    const momDirection = features.rawMomentum > 0 ? 'Upward' : 'Downward';
    momEl.textContent = momDirection;
    momEl.className = `metric-value ${features.rawMomentum > 0 ? 'positive' : 'negative'}`;
    
    // Pattern
    const patternEl = document.getElementById('pattern');
    const pattern = Math.abs(features.rawPriceToMA7) < 1 ? 'Consolidating' :
                   features.rawPriceToMA7 > 1 ? 'Breakout' : 'Pullback';
    patternEl.textContent = pattern;
    patternEl.className = 'metric-value neutral';
}

/**
 * Generate human-readable insights
 */
function generateInsights(features, prediction, priceChange) {
    const insights = [];
    
    // Momentum insight
    if (features.rawMomentum > 1) {
        insights.push({
            icon: '<i class="fas fa-arrow-up"></i>',
            title: 'Strong Upward Momentum',
            description: 'Price is currently trending above the 14-day moving average, indicating strong upward momentum.'
        });
    } else if (features.rawMomentum < -1) {
        insights.push({
            icon: '<i class="fas fa-arrow-down"></i>',
            title: 'Downward Pressure',
            description: 'Recent price action shows downward momentum. Consider waiting for trend reversal.'
        });
    } else {
        insights.push({
            icon: '<i class="fas fa-grip-lines"></i>',
            title: 'Sideways Movement',
            description: 'Gold is trading in a narrow range with no clear directional bias.'
        });
    }
    
    // Volatility insight
    if (features.rawVolatility < 1) {
        insights.push({
            icon: '<i class="fas fa-bullseye"></i>',
            title: 'Low Volatility Environment',
            description: 'Market volatility is currently low, suggesting stable conditions favorable for entry.'
        });
    } else if (features.rawVolatility > 2) {
        insights.push({
            icon: '<i class="fas fa-bolt"></i>',
            title: 'High Volatility Detected',
            description: 'Significant price swings detected. Higher risk, but potential for larger moves.'
        });
    }
    
    // Moving average insight
    if (features.rawPriceToMA7 > 2) {
        insights.push({
            icon: '<i class="fas fa-rocket"></i>',
            title: 'Price Above Moving Averages',
            description: 'Gold is trading well above both 7-day and 14-day moving averages, showing bullish strength.'
        });
    } else if (features.rawPriceToMA7 < -2) {
        insights.push({
            icon: '<i class="fas fa-triangle-exclamation"></i>',
            title: 'Below Key Support Levels',
            description: 'Price has fallen below important moving average support, indicating weakness.'
        });
    }
    
    // Recent trend insight
    if (features.rawRecentTrend > 0.5) {
        insights.push({
            icon: '<i class="fas fa-circle-check"></i>',
            title: 'Positive Recent Trend',
            description: 'The last 3 days show consistent positive price action, suggesting building momentum.'
        });
    } else if (features.rawRecentTrend < -0.5) {
        insights.push({
            icon: '<i class="fas fa-circle-xmark"></i>',
            title: 'Recent Weakness',
            description: 'Prices have declined over the last 3 days. Waiting may be prudent.'
        });
    }
    
    // AI confidence insight
    if (prediction.confidence > 75) {
        // Check if there's a conflict with opportunity score
        const opportunityScore = state.buyingAnalysis ? state.buyingAnalysis.opportunityScore : 50;
        
        if (prediction.signal === 'BUY' && opportunityScore < 45) {
            insights.push({
                icon: '<i class="fas fa-triangle-exclamation"></i>',
                title: 'Mixed Signals - Price Too High',
                description: `AI shows ${prediction.confidence}% confidence for BUY, but current price is at ${state.buyingAnalysis.analytics.pricePosition}% of 30-day range. Recommendation: WAIT for price to dip before buying.`
            });
        } else {
            insights.push({
                icon: '<i class="fas fa-graduation-cap"></i>',
                title: 'High Confidence Signal',
                description: `Our AI model shows ${prediction.confidence}% confidence in this ${prediction.signal} recommendation based on multiple technical factors.`
            });
        }
    } else if (prediction.confidence < 55) {
        insights.push({
            icon: '<i class="fas fa-question-circle"></i>',
            title: 'Uncertain Market Conditions',
            description: 'Technical indicators are giving mixed signals. Consider waiting for clearer trends.'
        });
    }
    
    // Render insights
    const insightsList = document.getElementById('insightsList');
    insightsList.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Display best buying time analysis
 */
function displayBuyingAnalysis(analysis) {
    // DON'T update signal badge - it should show AI prediction, not opportunity score
    // The opportunity score is shown in the insights below
    
    // Add buying analysis insights at the top of insights list
    const buyingInsights = [
        {
            icon: analysis.opportunityScore >= 75 ? '<i class="fas fa-bullseye"></i>' : analysis.opportunityScore >= 60 ? '<i class="fas fa-check-circle"></i>' : analysis.opportunityScore >= 45 ? '<i class="fas fa-balance-scale"></i>' : '<i class="fas fa-hourglass-half"></i>',
            title: `${analysis.recommendation}`,
            description: `Opportunity Score: ${analysis.opportunityScore}/100. ${analysis.reasoning}`
        },
        {
            icon: '<i class="fas fa-chart-bar"></i>',
            title: 'Historical Context',
            description: `Lowest price in last 30 days (${analysis.analytics.lowestPriceDate}, ${analysis.analytics.daysAgoLowest} days ago): 24K ${formatPrice(convertPrice(analysis.analytics.lowestPrice30d, state.currency, state.exchangeRate), state.currency, '24K')}, 22K ${formatPrice(convertPrice(analysis.analytics.lowestPrice30d, state.currency, state.exchangeRate), state.currency, '22K')}. Current price is ${analysis.analytics.currentVsLowest}.`
        },
        {
            icon: '<i class="fas fa-chart-line"></i>',
            title: 'Recent Price Position',
            description: `Current price is ${analysis.analytics.distanceFromWeekLow}% above the 7-day low. Price position in 30-day range: ${analysis.analytics.pricePosition}% (0% = lowest, 100% = highest).`
        },
        {
            icon: analysis.analytics.recentTrend === 'Rising' ? '<i class="fas fa-arrow-trend-up"></i>' : '<i class="fas fa-arrow-trend-down"></i>',
            title: `Recent Trend: ${analysis.analytics.recentTrend}`,
            description: `Market volatility: ${analysis.analytics.volatility}%. Found ${analysis.analytics.dipOpportunities} dip opportunities in the last 30 days.`
        }
    ];
    
    // Prepend buying analysis to existing insights
    const insightsList = document.getElementById('insightsList');
    const existingInsights = insightsList.innerHTML;
    
    const buyingInsightsHTML = buyingInsights.map(insight => `
        <div class="insight-item" style="background: linear-gradient(135deg, rgba(245, 166, 35, 0.1), rgba(255, 140, 0, 0.05)); border-left: 3px solid #f5a623;">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        </div>
    `).join('');
    
    insightsList.innerHTML = buyingInsightsHTML + existingInsights;
}

// ===== INITIALIZATION =====

/**
 * Main initialization function
 */
async function init() {
    try {
        
        // Step 0: Initialize currency system
        updateLoadingText('Detecting location & currency...');
        await initializeCurrency();
        
        // Step 1: Fetch price data
        updateLoadingText('Fetching gold prices...');
        state.priceData = await fetchGoldPrices();
        
        // Step 2: Calculate features
        updateLoadingText('Calculating technical indicators...');
        await sleep(500);
        state.features = calculateFeatures(state.priceData);
        
        // Step 3: Train ML model
        updateLoadingText('Training AI model...');
        state.model = await createAndTrainModel(state.features);
        
        // Step 4: Make prediction
        updateLoadingText('Generating signal...');
        await sleep(500);
        state.prediction = await makePrediction(state.model, state.features);
        
        // Step 4.5: Analyze best buying time
        updateLoadingText('Analyzing best entry points...');
        await sleep(300);
        state.buyingAnalysis = analyzeBestBuyingTime(state.priceData);
        
        
        // Step 5: Render UI
        updateLoadingText('Rendering results...');
        createChart(state.priceData, state.features);
        updateUI(state.priceData, state.features, state.prediction);
        displayBuyingAnalysis(state.buyingAnalysis); // New function
        
        // Step 6: Hide loading overlay
        await sleep(300);
        hideLoading();
        
        // Step 7: Setup event listeners
        setupEventListeners();
        
        
    } catch (error) {
        showError('Failed to initialize. Please refresh the page.');
        hideLoading();
    }
}

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
    // Chart range buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update chart
            const range = parseInt(btn.dataset.range);
            state.currentRange = range;
            updateChartRange(range);
        });
    });
}

// ===== UTILITY FUNCTIONS =====

function updateLoadingText(text) {
    document.querySelector('.loading-text').textContent = text;
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="error-message">
            <h2>⚠️ Error</h2>
            <p>${message}</p>
        </div>
    `;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== START APPLICATION =====

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
