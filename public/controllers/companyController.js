var myApp = angular.module('app',[]);

myApp.controller("companyController", companyController);

function companyController($scope, $http, arrayService, companyApiFactory, childSummaService) {

	var arrayCompanies = [];			// FOR GET REQUEST
	var moneyChildDict = [];			// ARRAY FOR CHILD MONEY -- Company ID - CHILD MONEY
	$scope.companiesAllInfo = [];		// ARRAYCOMPANIES + CHILD MONEY
	var currentParentTable = [];		// arrayCompanies - DUPLICATE (for table view)
	$scope.roots = [];					// MULTIARRAY WITH CHILDREN

	$scope.isLoading = true;			// To show text 'Loading' in view
	$scope.errorMessage = "";

	// REFRESH VIEW
	// GET ARRAY COMPANIES AND COPY TO TEMPORARY ARRAY TO DELETE ROOT COMPANY
	var refresh = function(){
		companyApiFactory.getCompanies()
			.then(function(response) {
				console.log("Get companies array"); console.log(response);
				arrayCompanies = response.data;
				currentParentTable = response.data.slice();				
				calculateChildMoney();
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
	var buildTree = function(){
		$scope.roots = arrayService.createMultiArray($scope.companiesAllInfo);
	};

	var calculateChildMoney = function(){
		moneyChildDict = childSummaService.calculateChild(moneyChildDict, arrayCompanies);
	};

	var concat = function() {
		$scope.companiesAllInfo = arrayService.concatTwoArray(arrayCompanies, moneyChildDict, "_id", "_id", function (a, b){
	    return {
	            _id: a._id,
	            Name: a.Name,
	            OwnMoney: a.OwnMoney,
	            ParentId: a.ParentId,
	            ChildMoney: b.ChildMoney
		    };
		});
	};

	// API GET:{id} FOR TABLE VIEW GET COMPANY BY ID TO INSERT INTO INPUT BOXES
	$scope.editCompany = function(id) {
		$scope.isLoading = true;
		console.log('GET ID COMPANY:' + id);
		companyApiFactory.getCompany(id)
			.then(function(response){
				// success
				$scope.company = response.data;
		}, function(err){
			// error
			$scope.errorMessage = err.data;
		}).finally(function(){
			$scope.isLoading = false;
		});
	};

		// API POST
	$scope.addChildCompany = function(id, company){
		$scope.isLoading = true;
		if(id == undefined) id = 0;
		
		var childCompany = company || {};
		childCompany.ParentId = id;

		companyApiFactory.insertCompany(childCompany)
			.then(function(response){
				console.log('Added new company');
				//Add to collection
				$scope.companiesAllInfo.push(response.data);
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

	// API PUT EDIT COMPANY --- FROM TABLE
	$scope.updateCompany = function(id){
		$scope.isLoading = true;
		//ADD ID TO SCOPE COMPANY MB
		//$http.put('/companies/' + id, $scope.company)
		companyApiFactory.updateCompany($scope.company)
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

	// API PUT --- FROM TREE
	$scope.submitChange = function(id){
		$scope.isLoading = true;
		console.log('PUT IN ID:' + id);
		console.log($scope.changedCompany);

		//Get current item
		var item = getItemByIdFromArray(arrayCompanies, id); 	
		var index = arrayCompanies.indexOf(item);

		//$http.put('/companies/' + id, $scope.changedCompany)
		companyApiFactory.updateCompany($scope.changedCompany)
			.then(function(response){
				console.log('Company has been updated.');
				closeEditMode(id);
				arrayCompanies[index].OwnMoney = $scope.changedCompany.OwnMoney;
				arrayCompanies[index].Name = $scope.changedCompany.Name;
				calculateChild();
				concat();
				$scope.buildTree();
				$scope.changedCompany = {};
			}, function(err){
				$scope.errorMessage = err.data;
			}).finally(function(){
				$scope.isLoading = false;
			});		
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
			var newItem = arrayService.getItem(arrayCompanies, _id, childElement[i]);
			newItem.ParentId = parentId;
			// Update child
			//$http.put('/companies/' + newItem._id, newItem)
			companyApiFactory.updateCompany(newItem)
				.then(function(response){
					console.log('Updated child company ' + newItem._id);
				}, function(err){
					console.log("Can't edit company" + err);
				});
		};
	};

	// API DELETE COMPANY BY ID
	$scope.deleteCompany = function(id, parentId){	

		$scope.isLoading = true;
		updateChildCompanies(id, parentId);

		console.log('DELETE COMPANY BY ID:' + id);
		//$http.delete('/companies/' + id)
		companyApiFactory.deleteCompany(id)
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
        buildTree();
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
	var closeEditMode = function(id){
		$scope.editedItems[id] = !$scope.editedItems[id];
	};
	
//////////////////////////////////////////////////////////////////////////////////////////


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