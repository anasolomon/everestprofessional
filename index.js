require('dotenv').config();
const express = require("express");
const products = require('./data/prodotti.json');
const port = process.env.PORT || 3000;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const minifyHTML = require('express-minify-html-terser');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

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
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get("/contatti", function(req, res){
  res.render("contatti", {
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'contatti'
  });
});

app.get("/grazie", function(req, res){
    res.render("grazie", {
    showLogoText: false,
    showExtraMenu: false,
    activePage: 'none'
  });
});

app.post("/send-email", async (req, res) => {
  const {
    nome,
    cognome,
    email,
    paese,
    ragione_sociale,
    telefono,
    regione,
    tipo_cliente,
    dipartimento,
    messaggio
  } = req.body;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Corpo dell'email
  let mailOptions = {
    from: `"Everest Sito Web" <${process.env.EMAIL_USER}>`,
    replyTo: email,
    to: process.env.EMAIL_USER,
    subject: `Nuovo messaggio dal sito - Dipartimento: ${dipartimento}`,
    text: `
Hai ricevuto un nuovo messaggio dal form contatti:

👤 Nome: ${nome} ${cognome}
📧 Email: ${email}
📞 Telefono: ${telefono || "Non fornito"}
🏢 Ragione Sociale: ${ragione_sociale || "Non fornita"}
🌍 Paese: ${paese}
🏠 Regione: ${regione}
👥 Tipologia Cliente: ${tipo_cliente}
🏢 Dipartimento richiesto: ${dipartimento}

📝 Messaggio:
${messaggio || "Nessun messaggio inserito"}
    `
  };

  console.log("📧 Tentativo invio email con dati:", mailOptions);

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).redirect("/grazie");
  } catch (err) {
    console.error("Errore invio email:", err);
    res.status(500).send("❌ Errore nell'invio dell'email.");
  }
});

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
}).on('error', (err) => {
  console.error('Server error:', err);
});