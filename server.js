var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://root:1@ds011231.mlab.com:11231/companydb');
var db = mongoose.connection;

var CompanySchema = mongoose.Schema({ 
	Name: String, 
	OwnMoney: Number, 
	ParentId: String
});
var Company = mongoose.model('Company', CompanySchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Wooho');
});

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//------------------------API--------------------------//
app.get('/companies', function (req,res) {	
	Company.find(function (err,docs){
		if(err) console.log(err);
		console.log("API GET ALL");
		res.json(docs);
	});
});

app.get('/companies/:id', function (req,res) {	
	var id = req.params.id;
	//Find by id
	Company.findById(id, function (err, docs){
		console.log("API GET BY ID");
		res.json(docs);
	});
});

app.post('/companies', function (req,res){
	var newCompany = new Company({
		ParentId: req.body.ParentId,
		Name: req.body.Name || "New Company",
		OwnMoney: req.body.OwnMoney || 0
	});
	console.log(newCompany);
	//Add do Db
	newCompany.save(function (err,doc){
		console.log("API POST");
		res.json(doc);
	});
});

app.put('/companies/:id', function (req,res){
	var id = req.params.id;
	console.log('PUT req');
	//Update do Db
	Company.findByIdAndUpdate(id,
			    {$set: 	{
							ParentId: req.body.ParentId,
							Name: req.body.Name,
							OwnMoney: req.body.OwnMoney
							}
				}, {new: true }, 
		function(err, doc){
		console.log("API PUT");
		console.log(doc);
		res.json(doc);
	});
});

app.delete('/companies/:id', function (req,res){
	var id = req.params.id;
	//Delete from Db
	Company.findByIdAndRemove({_id:id}, function(err, doc){
		console.log("API DELETE");
		res.json(doc);
	});
});

app.listen(process.env.PORT || 3000);
console.log("Server running on port ");