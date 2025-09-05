require('dotenv').config();
const express = require("express");
const router = express.Router();
const products = require('./data/prodotti.json');
const port = process.env.PORT || 3000;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const minifyHTML = require('express-minify-html-terser');

const app = express();
app.set('trust proxy', 1);
app.use(minifyHTML({
  override: true,
  htmlMinifierOptions: {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
  }
}));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://maps.google.com",
          "https://maps.gstatic.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://kit.fontawesome.com",  // Font Awesome kit
          "https://cdnjs.cloudflare.com", // Font Awesome CDN fallback
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://kit-free.fontawesome.com",
          "https://cdnjs.cloudflare.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://kit-free.fontawesome.com",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://maps.gstatic.com",
          "https://maps.googleapis.com",
          "https://maps.google.com",
          "https://cdnjs.cloudflare.com",
          "https://www.google-analytics.com",
        ],
        connectSrc: [
          "'self'",
          "https://maps.googleapis.com",
          "https://kit.fontawesome.com",
          "https://www.google-analytics.com",
          "https://region1.google-analytics.com",
          "https://*.google-analytics.com",
          "https://*.analytics.google.com",
        ],
      },
    },
  })
);
app.use(helmet.noSniff());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // massimo 100 richieste per IP in 15 minuti
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(limiter);

app.get("/", function(req, res){
    res.render("index", {
    showLogoText: true,
    showExtraMenu: false,
    activePage: 'home'
  });
});

app.get("/chisiamo", function(req, res){
    res.render("chisiamo", {
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'chisiamo'
  });
});

app.get("/servizi", function(req, res){
    res.render("servizi", {
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'servizi'
  });
});

app.get("/vendita", function(req, res){
    res.render("vendita", {
    showLogoText: false,
    showExtraMenu: true,
    activePage: 'vendita'
  });
});

app.get("/assistenza", function(req, res){
    res.render("assistenza", {
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'assistenza'
  });
});

app.get("/ricondizionamento", function(req, res){
    res.render("ricondizionamento", {
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'none'
  });
});
// app.get("/contatti", function(req, res){
//     res.render("contatti", {
//     showLogoText: false,
//     showExtraMenu: false,
//     activePage: 'none'
//   });
// });


app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const product = products[productId];

  if (!product) return res.status(404).send("Product not found");

  const typeColors = {
    wine: '#733151',
    beverages: '#2ec3e7',
    'ice cream': '#2484c6',
    market: '#faa61a',
    catering: '#00663a'
  };

  const typeColor = typeColors[product.type] || '#000'; // fallback color

  res.render('product', { 
    product,
    typeColor,
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'none'
  });
});


app.use((req, res, next) => {
  const q = req.query;

  const suspiciousParams = ['v', 'channel', 'from', 'id', 'name'];

  const foundSuspicious = suspiciousParams.some(param => q[param]);

  if (foundSuspicious) {
    console.warn(`🔒 Blocchi URL sospetto: ${req.originalUrl}`);
    return res.status(403).send('Accesso negato');
  }

  next();
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server started on port ${port}`);
});