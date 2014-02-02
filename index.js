
var $ = module.exports = require('dom');

$.use({
    tree: require('dom-tree'),
    js: js
});

function js(options) {
    var tree = $('[data-lib],[data-js]', this).tree();
    // execute js
    tree.visit(function(node) {
        // expect data-js="[fn],[fn]"
        exec($(node), JSON.parse('['+node.getAttribute('data-js')+']'));
    });
    return this;
}

// recursive exec
function exec(el, js) {
    // loop over function list
    for (var i = 0; i < js.length; i++) {

        // ban data-js='["fnA", "fnB"]', too ambiguous
        if (!Array.isArray(js[i])) throw new Error('Invalid call format');
        // assume 0th entry is function name, rest are args
        var plugin = js[i][0];
        // split into function | scope components
        var parts = plugin.replace(/ /g, '').split('|');
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
