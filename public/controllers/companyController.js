var myApp = angular.module('app',[]);

myApp.controller("companyController", companyController);

function companyController($scope, $http) {

	var arrayCompanies = [];			// FOR GET REQUEST
	var moneyChildDict = [];			// ARRAY FOR CHILD MONEY -- Company ID - CHILD MONEY
	$scope.companiesAllInfo = [];		// ARRAYCOMPANIES + CHILD MONEY
	var currentParentTable = [];		// arrayCompanies - DUPLICATE
	$scope.roots = [];					// MULTIARRAY WITH CHILDREN

	$scope.isLoading = true;			// To show text 'Loading' in view
	$scope.errorMessage = "";

	// REFRESH VIEW
	// GET ARRAY COMPANIES AND COPY TO TEMPORARY ARRAY TO DELETE ROOT COMPANY
	var refresh = function(){
		$http.get('/companies')
			.then(function(response) {
				console.log("Get companies array"); console.log(response);
				arrayCompanies = response.data;
				currentParentTable = response.data.slice();				
				calculateChild();
				concat();
		}, function(err) {
			//error
			console.log(err);
			$scope.errorMessage = err.data;
		}).finally(function(){
			$scope.isLoading = false;
		});	
	};
	// CALL METHOD WHEN FIRST TIME RUN
	refresh();

	
	// BUILT COMPANY TREE
	$scope.buildTree  = function(){
		if ($scope.companiesAllInfo == null) return;
		var map = {}, node, roots = [];
		for (var i = 0; i < $scope.companiesAllInfo.length; i += 1) 
		{
		    node = $scope.companiesAllInfo[i];
		    node.children = [];
		    map[node._id] = i;
		    if (node.ParentId !== "0") 
		        $scope.companiesAllInfo[map[node.ParentId]].children.push(node);
		    else 
		        roots.push(node);
		}
		$scope.roots = roots;
		console.log('roots');console.log(roots);		
	};

	var calculateChild = function(){
		for (var i = 0; i <= arrayCompanies.length-1; i++) 
		{
			var summaChildCompanies = recursiveSumma(i);
			summaChildCompanies -= parseFloat(arrayCompanies[i].OwnMoney);			// HARDCODING
			
			var findKey = arrayCompanies[i]._id;
			if (moneyChildDict.contains(findKey))
			{
				// if Company already exists
				moneyChildDict[i].ChildMoney = summaChildCompanies;
			}
			else
			{
				// Add new company to array
				moneyChildDict.push({_id: arrayCompanies[i]._id, ChildMoney: summaChildCompanies});
			}
		};
	};

	var recursiveSumma = function(i)
	{
		i = i || 0;
		var sumChild = parseFloat(arrayCompanies[i].OwnMoney);
		for (var y = 0; y <= arrayCompanies.length - 1; y++) 
		{
			if (arrayCompanies[y].ParentId === arrayCompanies[i]._id)
				sumChild += recursiveSumma(y);
		}
		return sumChild;
	};

	var concat = function(){
		// Concatinate ChildMoney from moneyChildDict to Companies Array from GET req 
		$scope.companiesAllInfo = concatToArraysByKey(arrayCompanies, moneyChildDict, "_id", "_id", function (a, b) 
		{
		    return {
		            _id: a._id,
		            Name: a.Name,
		            OwnMoney: a.OwnMoney,
		            ParentId: a.ParentId,
		            ChildMoney: b.ChildMoney
		    };
		});
		$scope.companies = $scope.companiesAllInfo;
	};

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////API//////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
		// API GET:{id} FOR TABLE VIEW GET COMPANY BY ID TO INSERT INTO INPUT BOXES
	$scope.editCompany = function(id) {
		$scope.isLoading = true;
		console.log('GET ID COMPANY:' + id);
		$http.get('/companies/' + id)
			.then(function(response){
				// success
				$scope.company = response.data;
		}, function(err){
			// error
			console.log(err);
			$scope.errorMessage = err.data;
		}).finally(function(){
			$scope.isLoading = false;
		});
	};

		// API POST
	$scope.addChildCompany = function(id){
		$scope.isLoading = true;
		if(id == undefined) id = 0;

		var childCompany = {};
		childCompany.ParentId = id;

		$http.post('/companies', childCompany)
			.then(function(response){
				console.log('Added new company');
				//Add to collection
				$scope.companies.push(response.data);
				currentParentTable.push(response.data);
				//clear input fields
				$scope.company = {};
				// build tree
				refresh();
				$scope.buildTree();
			}, function(err){
				$scope.errorMessage = err.data;
			}).finally(function(){
				$scope.isLoading = false;
			});
	};

		// API PUT EDIT COMPANY
	$scope.updateCompany = function(id){
		$scope.isLoading = true;
		$http.put('/companies/' + id, $scope.company)
			.then(function(response){
				console.log('Updated company');
				refresh();
				//clear input fields
				$scope.company = {};
			}, function(err){
				$scope.errorMessage = err.data;
			}).finally(function(){
				$scope.isLoading = false;
			});
	};

		// API PUT
	$scope.submitChange = function(company){
		console.log('PUT IN ID:' + company._id);
		console.log($scope.changedCompany);
		$http.put('/companies/' + company._id, $scope.changedCompany)
			.then(function(response){
				console.log('Company has been updated.');
				closeEditMode(company);		

//HARDCODING	

				$scope.roots = [];	
				$http.get('/companies')
					.then(function(response) {
						console.log("Get companies array"); console.log(response);
						arrayCompanies = response.data;			
						calculateChild();
						concat();
						$scope.buildTree();
				}, function(err) {
					//error
					console.log(err);
				});	
				//refresh();
				//$scope.buildTree();

				//$scope.changedCompany = {};
			}, function(err){
				console.log("Can't edit company" + err);
			});		
	};

	var getItemByIdFromArray = function (globalArr, id) 
	{
		for (var i = globalArr.length - 1; i >= 0; i--) {
			if (globalArr[i]._id === id)
				return globalArr[i];
		};
	};


	var updateChildCompanies = function(id, parentId) {
		// IF DELETED ELEMENT HAS CHILDREN SET THEIR PARENTID TO LEVEL UP (DELETED ELEMENT PARENTID)
		var childElement = [];
		for (var i = currentParentTable.length - 1; i >= 0; i--) 
		{
			// find children
			if (currentParentTable[i].ParentId === id)
				childElement.push(currentParentTable[i]._id);
		};
		for (var i = childElement.length - 1; i >= 0; i--) 
		{
			// Set new parentId for child companies
			var newItem = getItemByIdFromArray(arrayCompanies, childElement[i]);
			newItem.ParentId = parentId;
			

//HARDCODING


			// Update child
			$http.put('/companies/' + newItem._id, newItem)
				.then(function(response){
					console.log('Updated child company ' + newItem._id);
				}, function(err){
					console.log("Can't edit company" + err);
				});
		};
	};

		// API PUT DELETE COMPANY BY ID
	$scope.deleteCompany = function(id, parentId){	

		$scope.isLoading = true;
		updateChildCompanies(id, parentId);

		console.log('DELETE COMPANY BY ID:' + id);
		$http.delete('/companies/' + id)
			.then(function(response){
				console.log('Delete successful.');
				location.reload();
			}, function(err){
				$scope.errorMessage = err.data;
		}).finally(function(){
			$scope.isLoading = false;
		});
	};



//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
	// SHOW TABLE OR TREE TOGGLE
	// DEFAULT: SHOW TABLE
	$scope.toggleTable = true;
	$scope.toggleTree = false;
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

    	// Value into input forms
	$scope.changedCompany = {};
	// OPEN EDIT MODE FOR COMPANY
	$scope.openEditMode = function(company){
		$scope.changedCompany = company;
		// If some item in edit mode reset changes
		$scope.editedItems = {};
    	$scope.editedItems[company._id] = !$scope.editedItems[company._id];
	};

	// CLOSE EDIT MODE FOR COMPANY
	var closeEditMode = function(company){
		$scope.editedItems[company._id] = !$scope.editedItems[company._id];
	};
	
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
    // CONCAT TWO ARRAYS
	function concatToArraysByKey (primary, foreign, primaryKey, foreignKey, select) 
	{
	    var m = primary.length, n = foreign.length, index = [], c = [];

	    for (var i = 0; i < m; i++) {
	        var row = primary[i];
	        index[row[primaryKey]] = row;
	    };
	    for (var j = 0; j < n; j++) {
	        var y = foreign[j];
	        var x = index[y[foreignKey]];
	        c.push(select(x, y));         
	    };
	    return c;
	};

	// Check if array contains element by _id
	Array.prototype.contains = function(obj) 
	{
	    var i = this.length;
	    while (i--) {
	        if (this[i]._id === obj) {
	            return true;
	        }
	    }
	    return false;
	}
};