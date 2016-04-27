angular.module("app").factory('childSummaService', function () {
    var childSummaService = {};

    var recursiveSumma = function (array, i)
    {
        // Calculate company earnings with child companies earnings
        i = i || 0;
        var sumChild = parseFloat(array[i].ownMoney);
        for (var y = 0; y <= array.length - 1; y++) {
            if (array[y].parentId === array[i].id)
                sumChild += recursiveSumma(y);
        }
        return sumChild;
    };

    childSummaService.calculateChild = function (array)
    {
        if (array == null) return;
        for (var i = 0; i <= array.length - 1; i++)
        {
            var summaChildCompanies = recursiveSumma(array, i);

            if (moneyChildDict.contains(array[i].id)) {
                // if Company already exists
                moneyChildDict[i].childMoney = summaChildCompanies;
            }
            else {
                // Add new company to array
                moneyChildDict.push({ id: array[i].id, childMoney: summaChildCompanies });
            }
        };

        return moneyChildDict;
    };

    return childSummaService;
})