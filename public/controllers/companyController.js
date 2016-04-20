var myApp = angular.module('app',[]);

myApp.controller("companyController", companyController);

function companyController($scope, $http) {

	var array = [];
	var temparr = [];

	// REFRESH VIEW
	// GET ARRAY COMPANIES AND COPY TO TEMPORARY ARRAY TO DELETE ROOT COMPANY
	var refresh = function(){
		$http.get('/companiesTree')
			.then(function(response) {
				console.log("Get companies array"); console.log(response);
				array = response.data;
				temparr = array.slice();
				temparr.splice(0,1);
				console.log('temparr');console.log(temparr);
				$scope.companies = array;		
				calculateChild();	
		});
	};
	// CALL METHOD WHEN FIRST TIME RUN
	refresh();

	// BUILT TREE COMPANY WORK OK
	$scope.buildTree  = function(){
		//if (array == null) return;
		var map = {}, node, roots = [];
		for (var i = 0; i < array.length; i += 1) 
		{
		    node = array[i];
		    node.children = [];
		    map[node._id] = i;
		    if (node.ParentId !== "0") 
		        array[map[node.ParentId]].children.push(node);
		    else 
		        roots.push(node);
		}
		$scope.roots = roots;
		console.log('roots');console.log(roots);		
	};

	// FOR TABLE VIEW GET COMPANY BY ID TO INSERT INTO INPUT BOXES
	$scope.editCompany = function(id) {
		console.log('GET ID COMPANY:' + id);
		$http.get('/companies/' + id)
			.then(function(response){
				$scope.company = response.data;
		});
	};

	// EDIT COMPANY
	$scope.updateCompany = function(id){
		$http.put('/companies/' + id, $scope.company)
			.then(function(response){
				console.log('Updated company');
				refresh();
				//clear input fields
				$scope.company = {};
			}, function(err){
				console.log("Can't edit company" + err);
			});
	};

	// DELETE COMPANY BY ID
	$scope.deleteCompany = function(id){
		console.log('DELETE COMPANY BY ID:' + id);
		$http.delete('/companies/' + id)
			.then(function(response){
				console.log('Delete successful.');
				//Delete company from collection
				//$scope.companies.splice(id, 1);
				refresh();
			}, function(err){
				console.log("Can't delete company");console.log(err.data);
		});
	};

	// Value into input forms
	$scope.changedCompany = {};
	$scope.openEditMode = function(company){
		$scope.changedCompany = company;
		// If some item in edit mode reset changes
		$scope.editedItems = {};
    	$scope.editedItems[company._id] = !$scope.editedItems[company._id];
	};

	var closeEditMode = function(company){
		$scope.editedItems[company._id] = !$scope.editedItems[company._id];
	};
	
	$scope.submitChange = function(company){
		console.log('PUT IN ID:' + company._id);
		console.log($scope.changedCompany);
		$http.put('/companies/' + company._id, $scope.changedCompany)
			.then(function(response){
				console.log('Company has been updated.');
				refresh();				
				closeEditMode(company);
				//$scope.changedCompany = {};
			}, function(err){
				console.log("Can't edit company" + err);
			});		
	};

	$scope.addChildCompany = function(id){
		console.log(id);
		if(id == undefined) id = 0;
		console.log(id);
		var childCompany = {};
		childCompany.ParentId = id;

		console.log('childCompany');console.log(childCompany);

		$http.post('/companies', childCompany)
			.then(function(response){
				console.log('Added new company');
				console.log(response.data);
				//Add to collection
				$scope.companies.push(response.data);
				//clear input fields
				$scope.company = {};
			}, function(err){
				console.log("Can't add company" + err);
			});
		refresh();
	};

	var moneyDict = [];

	var calculateChild = function()
	{

		for (var i = 0; i <= array.length-1; i++) 
		{
			var s = recursiveSumma(i);
			console.log(s);
		};

		$scope.childCompanyMoney = moneyDict;
		console.log('moneyDict'); console.log(moneyDict);
	};

	var aaaaa = [];
	var recursiveSumma = function(i)
	{
		i = i || 0;
		var sumChild = parseFloat(array[i].OwnMoney);
		var count = array.length-1;
		for (var y = 0; y <= count; y++) 
		{
			if ((array[y].ParentId).toString() === (array[i]._id).toString())
			{
				sumChild += recursiveSumma(y);
			}
		}
		// CHECK IF KEY ALREADY EXIST
		{
			moneyDict.push({
			key: array[i]._id,
			value: sumChild
			});	
		}
		return sumChild;
	};

	$scope.toggleTable = true;
	$scope.toggleTree = false;
    $scope.textToggleBtn = "Show tree";
    $scope.showTable = function () {
            $scope.toggleTable = true;
            $scope.toggleTree = false;
    }; 

    $scope.showTree = function () {
    	if($scope.toggleTree) return;
        $scope.toggleTable = false;
        $scope.toggleTree = true;
        $scope.buildTree();
    }; 


};