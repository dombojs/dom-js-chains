
var $ = require('dom');

$.use('js', function() {

    var set = [];

    this.forEach(function() {
        // include container if it has a data-js attribute
        if (this.getAttribute('data-js')) set.push(this);
        // grab descendants with data-js attributes
        $('[data-js]', this).forEach(function() {
            set.push(this);
        });
    });

    // execute js
    return $(set).forEach(function() {
        // expect data-js="[fn],[fn]"
        exec($(this), JSON.parse('['+this.getAttribute('data-js')+']'));
    });

});

// recursive exec
function exec(el, js) {
    // loop over function list
    for (var i = 0; i < js.length; i++) {

        // ban data-js='["fnA", "fnB"]', too ambiguous
        if (!Array.isArray(js[i])) throw new Error('Invalid call format');
        // assume 0th entry is function name, rest are args
        var plugin = js[i][0];
        // split into function | scope components
        var parts = plugin.replace(/ /g).split('|');
        // expect function to be on prototype
        var fn = $.List.prototype[parts[0]];

        // ignore non-existent functions
        if (!fn) continue;

        // build argument list
        var args = js[i].length > 1 ? js[i].slice(1) : [];
        // if selector was specified
        if (parts[1]) {
            // apply function to selector scope, don't chain result
            fn.apply(el.find(parts[1]), args);
        } else {
            // apply function to current scope, chain result
            el = fn.apply(el, args);
        }

    }
}
