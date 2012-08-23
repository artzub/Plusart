var plusar = plusar || {};

plusar.asyncForEach = function(items, fn) {
    var workArr = items.concat();

    setTimeout(function() {
        if (workArr.length > 0)
            fn(workArr.pop(), workArr);
        if (workArr.length > 0)
            setTimeout(arguments.callee, 12);

    }, 12);
}

plusar.Count = 50;
plusar.Depth = 1;
plusar.useKey = true;