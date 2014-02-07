
var $ = module.exports = require('dom');

$.use({
    js: plugin,
    tree: require('dom-tree')
});

function plugin(load) {

    var tree = $('[data-bundle],[data-js]', this).tree();

    tree.visit(function(node) {

        var el = node.domNode,
            bundle = el.getAttribute('data-bundle'),
            js = el.getAttribute('data-js');

        node.execute = function() {
            if (node.executed) return true;
            if (js) exec($(el), JSON.parse('['+js+']'));
            node.executed = true;
        };

        if (bundle) {
            load(bundle, function() {
                node.loaded = true;
                treeExec();
            });
        } else {
            node.loaded = true;
        }

    });

    function treeExec() {
        tree.visit(function(node) {
            if (!node.loaded) return false;
            return node.execute();
        });
    }

    treeExec();

    return this;

}

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
