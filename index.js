var express = require('express');
var fs = require('fs');
const crypto = require('crypto');
var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded());

app.get('/', (req,res)=>{
	res.render('index');
});

app.post('/', (req,res)=>{
	var objectToWrite ={
		name: req.body.name,
		email: req.body.email,
		message: req.body.message,
		newsletter: req.body.newsletter
	}
crypto.randomBytes(35,(err, buf) => {
	fs.writeFile("./submissions/"+buf.toString('hex'), JSON.stringify(objectToWrite),function(err){
		if(err)
			console.log(err);

		res.render('index');

	});
});
});

app.get('/admin', (req,res)=>{
	//get all submissions from files and return list to a view
	res.render('admin');
});


app.listen(8080, ()=>{
	console.log("Running on port 8080");

})
