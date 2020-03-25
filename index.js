var express = require('express');
var fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({
   extended: true
}));

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/livestream.gq/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/livestream.gq/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/livestream.gq/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

app.use(function(req, res, next) {
  if(!req.secure) {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

app.get('/', (req, res) => {
   res.render('index');
});

app.post('/', (req, res, next) => {
   if (req.body.name2) {
      res.send('No bots allowed');
   } else {
      var objectToWrite = {
         name: req.body.name,
         email: req.body.email,
         message: req.body.message,
         newsletter: req.body.newsletter
      }
      crypto.randomBytes(35, (err, buf) => {
         fs.writeFile("./submissions/" + buf.toString('hex'), JSON.stringify(objectToWrite), function(err) {
            if (err) {
               console.log(err);
               next(new Error('Unexpected error'));
            } else {
               res.render('submitSuccess');
            }
         });
      });
   }
});



app.get('/admin', (req, res, next) => {
   let list = [];
   fs.readdir("./submissions", (err, files) => {
      if (err) {
         console.log(err);
         next(new Error('Unexpected error'));
      } else {
         //Create promise for each file to read
         let requests = files.map((file) => {
            return new Promise((resolve) => {
               fs.readFile("./submissions/" + file, "utf8", (err, data) => {
                  list.push(JSON.parse(data));
                  resolve();
               })
            });
         })

         Promise.all(requests).then(() => res.render('admin', {
            list: list
         }));

      }
   });
});


//Simple error handling
app.use((error, req, res, next) => {
   res.send(error.message);
});


// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(8080, () => {
	console.log('HTTP Server running on port 8080');
});

httpsServer.listen(8081, () => {
	console.log('HTTPS Server running on port 8081');
});