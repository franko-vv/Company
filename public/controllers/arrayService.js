angular.module("app").factory('arrayService', function()
{
    var arrayService = {};

    // Concatinate two array - primary with foreign
    // by key primaryKey = foreignKey
    arrayService.concatTwoArray = function (primary, foreign, primaryKey, foreignKey, select)
    {
        var m = primary.length, n = foreign.length, index = [], c = [];
        for (var i = 0; i < m; i++)
        {
            var row = primary[i];
            index[row[primaryKey]] = row;
        };

        for (var j = 0; j < n; j++)
        {
            var y = foreign[j];
            var x = index[y[foreignKey]];
            c.push(select(x, y));
        };
        return c;
    };

    // Create multidimensional array from inline self-referencing array-arrayInline
    arrayService.createMultiArray = function (arrayInline)
    {
        if (arrayInline == null) return;
        var map = {}, node, roots = [];
        for (var i = 0; i < arrayInline.length; i += 1) {
            node = arrayInline[i];
            node.children = [];
            map[node.id] = i;
            if (node.parentId !== 0)
                arrayInline[map[node.parentId]].children.push(node);
            else
                roots.push(node);
        };
        return roots;
    };

    // Get Item from array-globalArr with prop = toFind
    arrayService.getItem = function (globalArr, prop, toFind)
    {
        for (var i = globalArr.length - 1; i >= 0; i--) {
            if (globalArr[i].prop === toFind)
                return globalArr[i];
        };
    }

    return arrayService;
})