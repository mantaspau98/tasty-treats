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
	if(req.body.name2){
		res.write('No bots allowed');
		res.end();
}else{
	var objectToWrite ={
		name: req.body.name,
		email: req.body.email,
		message: req.body.message,
		newsletter: req.body.newsletter
	}

crypto.randomBytes(35,(err, buf) => {
	fs.writeFile("./submissions/"+buf.toString('hex'), JSON.stringify(objectToWrite),function(err){
		if(err)
			return console.log(err);

		res.render('submitSucess');

	});
});
}
});



app.get('/admin', (req,res)=>{
	let list = [];
	fs.readdir("./submissions", function (err, files) {
    if (err)
        return console.log(err);


		  let requests = files.map((file) => {
		      return new Promise((resolve) => {
					fs.readFile("./submissions/"+file, "utf8", (err, data) => {
						list.push(JSON.parse(data));
					 resolve();
				})
		      });
		  })

Promise.all(requests).then(() => res.render('admin',{list:list}));


});

});


app.listen(8080, ()=>{
	console.log("Running on port 8080");

})
