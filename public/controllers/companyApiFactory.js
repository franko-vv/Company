angular.module("app").factory('companyApiFactory', ['$http', function ($http) {

        var urlBase = "/companies";
        var companyApiFactory = {};

        companyApiFactory.getCompanies = function () {
            return $http.get(urlBase);
        };

        companyApiFactory.getCompany = function (id) {
            return $http.get(urlBase + '/' + id);
        };

        companyApiFactory.insertCompany = function (company) {
            return $http.post(urlBase, company);
        };

        companyApiFactory.updateCompany = function (company) {
            return $http.put(urlBase + '/' + company.id, company)
        };

        companyApiFactory.deleteCompany = function (id) {
            return $http.delete(urlBase + '/' + id);
        };

        return companyApiFactory;
    }]);