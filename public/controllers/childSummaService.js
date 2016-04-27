angular.module("app").factory('childSummaService', function () {
    var childSummaService = {};

    var recursiveSumma = function (array, i)
    {
        // Calculate company earnings with child companies earnings
        i = i || 0;
        var sumChild = parseFloat(array[i].OwnMoney);
        for (var y = 0; y <= array.length - 1; y++) {
            if (array[y].ParentId === array[i]._id)
                sumChild += recursiveSumma(array, y);
        }
        return sumChild;
    };

    childSummaService.calculateChild = function (outArray, array)
    {
        if (array == null) return;

        for (var i = 0; i <= array.length - 1; i++)
        {
            var summaChildCompanies = recursiveSumma(array, i);

            if (outArray.contains(array[i]._id)) {
                // if Company already exists
                outArray[i].ChildMoney = summaChildCompanies;
            }
            else {
                // Add new company to array
                outArray.push({ _id: array[i]._id, ChildMoney: summaChildCompanies });
            }
        };

        return outArray;
    };

    return childSummaService;
})