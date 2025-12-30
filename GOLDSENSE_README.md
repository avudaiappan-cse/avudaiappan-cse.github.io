# 🪙 GoldSense AI

**Track Gold. Think Smart. Act with AI.**

A production-ready web application that uses machine learning to analyze gold price trends and provide BUY/WAIT signals based on technical indicators.

![GoldSense AI](https://img.shields.io/badge/Status-Production%20Ready-success)
![TensorFlow.js](https://img.shields.io/badge/ML-TensorFlow.js-orange)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-blue)

---

## 🎯 Features

- **Best Time to Buy Analysis** - AI analyzes last 30 days to find optimal entry points with opportunity scoring (0-100)
- **Live Gold Price Data** - Fetches last 30 days of XAU/USD prices from Alpha Vantage API
- **Multi-Currency Support** - View prices in USD ($) or INR (₹) with automatic location detection
- **Machine Learning Predictions** - TensorFlow.js neural network classifies market conditions
- **Historical Price Analysis** - Identifies lowest prices, dips, and optimal buying windows
- **Interactive Charts** - Beautiful Chart.js visualizations with moving averages
- **Technical Analysis** - Momentum, volatility, moving averages, and trend analysis
- **Human-Readable Insights** - Clear explanations of why the AI made its recommendation
- **LocalStorage Caching** - Reduces API calls and improves performance
- **Mock Data Fallback** - Works offline with realistic simulated data
- **Responsive Design** - Mobile-first, dark theme UI with gold accents

---

## 🚀 Quick Start

### One-Click Run

Simply open `goldsense-ai.html` in your browser. That's it!

```bash
# Clone the repository (or download files)
cd goldsense-ai

# Open in browser
open goldsense-ai.html
# or
python3 -m http.server 8000
# Then visit: http://localhost:8000/goldsense-ai.html
```

---

## 📊 How It Works

### 1. **Data Collection**

- Fetches gold prices (XAU/USD) from **Alpha Vantage API**
- Falls back to realistic mock data if API fails
- Caches data in LocalStorage for 24 hours

### 2. **Feature Engineering**

The system calculates 5 key technical indicators:

| Feature | Description | Range |
|---------|-------------|-------|
| **Momentum** | 7-day price slope (linear regression) | Normalized 0-1 |
| **Volatility** | Standard deviation of daily returns | Normalized 0-1 |
| **Price vs MA7** | % distance from 7-day moving average | Normalized 0-1 |
| **Price vs MA14** | % distance from 14-day moving average | Normalized 0-1 |
| **Recent Trend** | Average change over last 3 days | Normalized 0-1 |

### 3. **Machine Learning Model**

**Architecture:**
```
Input Layer: 5 features
  ↓
Hidden Layer 1: 16 neurons (ReLU + Dropout 20%)
  ↓
Hidden Layer 2: 8 neurons (ReLU)
  ↓
Output Layer: 1 neuron (Sigmoid)
```

**Training:**
- Generates 100 synthetic samples based on technical rules
- 50 epochs with Adam optimizer
- Binary cross-entropy loss
- Learns patterns: positive momentum + low volatility + price above MA = BUY

**Output:**
- Probability score (0-1)
- **BUY** if probability > 65%
- **WAIT** otherwise

### 4. **Signal Generation**

```javascript
if (confidence >= 65%) {
  signal = "BUY"
} else {
  signal = "WAIT"
}
```

---

## 🎯 Best Time to Buy Analysis

GoldSense AI now includes an advanced **"Best Time to Buy"** algorithm that analyzes historical price patterns to identify optimal entry points.

### How It Works

The algorithm calculates an **Opportunity Score (0-100)** based on:

1. **Price Position (30 points)** - Where current price sits in 30-day range (lower = better)
2. **Distance from Weekly Low (25 points)** - How close to 7-day low (closer = better)
3. **Recent Momentum (20 points)** - Buying on dips when price is below 7-day average
4. **Volatility (15 points)** - Lower volatility = more stable entry point
5. **Dip Opportunities (10 points)** - Number of times price fell below MA14

### Scoring System

- **75-100**: 🎯 **EXCELLENT TIME TO BUY** - Near historical lows, strong entry conditions
- **60-74**: ✅ **GOOD TIME TO BUY** - Favorable price range, decent entry
- **45-59**: ⚖️ **MODERATE OPPORTUNITY** - Consider DCA or wait for better dip
- **0-44**: ⏳ **WAIT FOR BETTER OPPORTUNITY** - Price relatively high, patience recommended

### Analytics Provided

- **Lowest Price in 30 Days** - Shows when and what was the lowest price
- **Days Since Lowest** - How many days ago the best opportunity was
- **Current vs Lowest** - Percentage difference from 30-day low
- **7-Day Range** - Distance from recent low/high
- **Price Position** - Where current price sits (0% = lowest, 100% = highest)
- **Volatility Level** - Market stability indicator
- **Dip Count** - Number of buying opportunities in last 30 days

### Real-Time Updates

The analysis uses **live price data** from Alpha Vantage API (not mock data) and updates with each page refresh. The algorithm considers:

- Real historical gold prices (XAU/USD)
- Actual moving averages from live data
- True volatility calculations
- Genuine market patterns

### Example Insights

When you open GoldSense AI, you'll see insights like:

> *"Lowest price in last 30 days was $2,012.50 on Dec 15 (11 days ago). Current price is 1.9% above lowest."*

> *"Current price is 0.8% above the 7-day low. Price position in 30-day range: 23% (excellent buying zone)."*

> *"Market volatility: 1.2%. Found 8 dip opportunities in the last 30 days."*

---

## 💱 Multi-Currency Support

GoldSense AI supports both **USD** and **INR** currencies with smart defaults:

### Features
- **Automatic Location Detection** - Uses IP geolocation to detect your country
- **Smart Defaults** - Shows INR (₹) for users in India, USD ($) for others
- **Manual Toggle** - Switch between currencies with one click
- **Live Exchange Rates** - Fetches latest USD to INR conversion rates daily
- **LocalStorage Caching** - Remembers your currency preference
- **Real-time Updates** - All prices and charts update instantly when switching

### Currency Display Format
- **USD**: `$2,050.50` (2 decimal places)
- **INR**: `₹1,71,925` (no decimals, Indian number format)

### API Used
- **IP Geolocation**: ipapi.co/json (free, no API key required)
- **Exchange Rates**: exchangerate-api.com (free, no API key required)

### Cache Duration
- **Exchange Rate**: 24 hours
- **Location Data**: 24 hours
- **Currency Preference**: Indefinite (until cleared)

---

## 🧠 Technical Indicators Explained

### Momentum
Measures the **rate of price change** over 7 days using linear regression.
- **Positive**: Upward trend
- **Negative**: Downward trend

### Volatility
Standard deviation of daily returns. Indicates **price stability**.
- **Low (<1%)**: Stable, predictable
- **High (>2%)**: Risky, unpredictable

### Moving Averages (MA)
- **MA7**: Short-term trend (1 week)
- **MA14**: Medium-term trend (2 weeks)
- **Golden Cross**: When MA7 crosses above MA14 (bullish)
- **Death Cross**: When MA7 crosses below MA14 (bearish)

### Recent Trend
Average percentage change over last 3 days.
- **Positive**: Building momentum
- **Negative**: Losing steam

---

## 📁 Project Structure

```
goldsense-ai/
├── goldsense-ai.html       # Main HTML file (UI)
├── goldsense-ai.js         # JavaScript (ML + Logic)
└── README.md               # This file
```

**No build process required!** Pure HTML/CSS/JavaScript.

---

## 🔧 Configuration

Edit `goldsense-ai.js` to customize:

```javascript
const CONFIG = {
    API_KEY: 'YOUR_ALPHA_VANTAGE_KEY',  // Free from alphavantage.co
    CACHE_KEY: 'goldsense_data',        // LocalStorage key
    CACHE_DURATION: 24 * 60 * 60 * 1000,// 24 hours in ms
    MODEL_THRESHOLD: 0.65,              // 65% confidence for BUY
};
```

### Get Free API Key
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Request free API key
3. Replace `API_KEY` in config
4. Limit: 25 requests/day (cached for 24h)

---

## ⚠️ Limitations & Disclaimers

### Limitations

1. **Not Financial Advice**
   - This is an educational project
   - Do NOT use for real trading decisions
   - Always consult a financial advisor

2. **Model Simplicity**
   - Uses only 30 days of data
   - Does not consider:
     - Global economic events
     - Geopolitical factors
     - Inflation data
     - Central bank policies

3. **API Constraints**
   - Free tier: 25 requests/day
   - Data delayed (not real-time)
   - Fallback to mock data when limit reached

4. **Prediction Accuracy**
   - ML model is trained on synthetic data
   - Past performance ≠ future results
   - Confidence score is probabilistic, not guaranteed

### Legal Disclaimer

> **⚠️ IMPORTANT DISCLAIMER**
>
> Predictions are probabilistic and based only on historical price trends. This is NOT financial advice. This tool is for educational and informational purposes only.
>
> Gold prices are influenced by factors not considered by this model. Always do your own research and consult a qualified financial advisor before making investment decisions.
>
> The creators of GoldSense AI are not responsible for any financial losses incurred from using this tool.

---

## 🚀 Future Improvements

### Planned Features
- [ ] Real-time WebSocket data
- [ ] Multiple timeframes (1M, 3M, 6M, 1Y)
- [ ] Portfolio simulation (paper trading)
- [ ] Historical accuracy tracking
- [ ] Sentiment analysis from news
- [ ] Multi-asset support (silver, Bitcoin, etc.)
- [ ] Email/SMS alerts
- [ ] Dark/Light theme toggle
- [ ] Export analysis as PDF

### Model Enhancements
- [ ] LSTM for time series prediction
- [ ] Ensemble model (multiple algorithms)
- [ ] Fine-tune on real historical data
- [ ] Incorporate volume data
- [ ] Add technical pattern recognition (head & shoulders, etc.)

---

## 🧪 Testing

### Manual Testing

1. **Open `goldsense-ai.html`** in browser
2. **Check console** for logs
3. **Verify:**
   - ✅ Loading screen appears
   - ✅ Chart renders after ~3-5 seconds
   - ✅ Signal displays (BUY or WAIT)
   - ✅ Confidence score shown
   - ✅ Insights list populated
   - ✅ Chart range buttons work (7D/14D/30D)

### Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| First load | Fetch API → Train model → Show results |
| Refresh within 24h | Use cached data → Faster load |
| API failure | Fallback to mock data → Still works |
| Click 7D button | Chart updates to show 7 days |
| Mobile view | Responsive layout, readable text |

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **HTML5** | Structure | - |
| **CSS3** | Styling (Flexbox/Grid) | - |
| **JavaScript (ES6+)** | Logic & ML | - |
| **TensorFlow.js** | Machine Learning | 4.15.0 |
| **Chart.js** | Data Visualization | 4.4.1 |
| **Alpha Vantage API** | Gold Price Data | v1 |
| **LocalStorage** | Caching | - |
| **Space Grotesk Font** | Typography | - |

---

## 📚 Learning Resources

### Understanding Technical Analysis
- [Investopedia: Technical Analysis](https://www.investopedia.com/terms/t/technicalanalysis.asp)
- [Moving Averages Explained](https://www.investopedia.com/terms/m/movingaverage.asp)
- [RSI and Momentum Indicators](https://www.investopedia.com/terms/r/rsi.asp)

### Machine Learning Basics
- [TensorFlow.js Official Docs](https://www.tensorflow.org/js)
- [Neural Networks Explained](https://www.youtube.com/watch?v=aircAruvnKk)
- [Classification vs Regression](https://machinelearningmastery.com/classification-versus-regression-in-machine-learning/)

### Chart.js
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart.js Examples](https://www.chartjs.org/samples/latest/)

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Report bugs
- Suggest features
- Improve documentation
- Share feedback

---

## 📄 License

MIT License - Feel free to use this code for learning purposes.

---

## 👨‍💻 Author

Built by a Senior Full-Stack JavaScript Engineer as a demonstration of:
- Clean code architecture
- Machine learning in browser
- Real-world API integration
- Production-ready best practices

---

## 🙏 Acknowledgments

- **Alpha Vantage** for free financial data API
- **TensorFlow.js** team for bringing ML to JavaScript
- **Chart.js** for beautiful, responsive charts
- **Google Fonts** for Space Grotesk typography

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API key is valid
3. Try clearing LocalStorage: `localStorage.clear()`
4. Use mock data by disconnecting internet (fallback)

---

**Remember: This is NOT financial advice. Always do your own research!** 📈

---

Made with ❤️ and ☕ | Powered by AI & Data
