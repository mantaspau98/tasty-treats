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


// http server
const httpServer = http.createServer(app);

httpServer.listen(8080, () => {
    console.log('HTTP Server running on port 8080');
});

