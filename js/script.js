let apiQuotes = [];

const quoteContainer = document.getElementById("quote-container");
const quoteSpan = document.getElementById("quote");
const authorText = document.getElementById("author");
const twitterBtn = document.getElementById("twitter-button");
const newQuoteBtn = document.getElementById("new-quote");
const loader = document.getElementById("loader");

//show loading
function loading() {
  loader.hidden = false;
  quoteContainer.hidden = true;
}

//hide loading
function complete() {
  loader.hidden = true;
  quoteContainer.hidden = false;
}

//Updating UI with Quote
function updateUI(quote) {
  authorText.innerText = quote.author ? quote.author : "Unknown";
  if (quote.text.length > 120) {
    quoteSpan.classList.add("long-quote");
  } else {
    quoteSpan.classList.remove("long-quote");
  }
  quoteSpan.innerText = quote.text;
}

//show new quote
function newQuote() {
  //Pick a random quotes from API
  const limit = apiQuotes.length;
  const idx = Math.floor(Math.random() * limit);
  updateUI(apiQuotes[idx]);
}

//GET Quotes from API
async function getQuotes() {
  loading();
  const apiURL = "https://type.fit/api/quotes";
  try {
    const response = await fetch(apiURL);
    apiQuotes = await response.json();
    newQuote();
    complete();
  } catch (e) {
    //catch error here!
    alert(error.message);
  }
}

// Tweet Quote
function tweetQuote() {
  const twitterURL = `https://twitter.com/intent/tweet?text=${quoteSpan.textContent} - ${authorText.textContent}`;
  window.open(twitterURL, "_blank");
}

//Event Listeners
newQuoteBtn.addEventListener("click", newQuote);
twitterBtn.addEventListener("click", tweetQuote);

// On load
getQuotes();
