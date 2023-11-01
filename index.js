require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const shortid = require('shortid');
const dns = require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;
const urlDatabase = {};

app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();

});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req,res) => {
  const originalUrl = req.body.url;  
  if(originalUrl) {
    const urlObject = new URL(originalUrl);
    dns.lookup(urlObject.hostname, (err, address, family) => {
      if(err) {
        res.json({ error: 'invalid url' });
      } else {
        const shortUrl = shortid.generate();
        urlDatabase[shortUrl] = originalUrl;
        res.json({ original_url : originalUrl, short_url : shortUrl});
      }
    });
  
  } else {
    res.json({ error: 'invalid url' });
  }
});

  



// app.post('/api/shorturl', async (req, res) => {
//   const originalUrl = req.body.url;

//   if (!originalUrl) {
//     res.status(400).json({ error: 'Invalid URL provided' });
//     return;
//   }

//   try {
//     const urlParts = new URL(originalUrl);
//     const hostname = urlParts.hostname;

//     await new Promise((resolve, reject) => {
//       dns.lookup(hostname, (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });

//     const shortUrl = shortid.generate();
//     urlDatabase[shortUrl] = originalUrl;
//     res.json({ original_url: originalUrl, short_url: shortUrl });
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid host or host does not exist' });
//   }
// });


app.get('/api/shorturl/:shortUrl', (req,res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];
  
  if(originalUrl){
    res.redirect(originalUrl);
  
  } else {
    res.json({ error: 'invalid url' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
