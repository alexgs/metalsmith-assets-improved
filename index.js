let debug = require( 'debug' )( 'metalsmith-nested-collections' );
let collections = require( 'metalsmith-collections' );
let addCollectionLinks = require( './lib/helpers/addCollectionLinks' );

let plugin = function plugin( options ) {

    /*
     * A Metalsmith plugin is basically a factory that returns a "worker"
     * function (for lack of a better term). Metalsmith calls the worker
     * function on its turn, and the worker modifies the files, metadata, etc.
     * These transformations happen in place and are available to the next
     * worker in the chain. Since this plugin is a drop-in replacement for
     * "metalsmith collections," we need to get the worker function from the
     * original plugin.
     */
    let oldWorker = collections( options );

    /*
     * This statement returns the default worker function for "nested
     * collections"
     */
    return function( files, metalsmith, done ) {
        /*
         * Set the next function to run once we are done
         */
        setImmediate( done );

        /*
         * Create a new worker function inside the default worker function.
         * We will pass this worker to the `oldWorker` function so that
         * `oldWorker` will call `newWorker` when `oldWorker` is done doing its
         * thing. The arguments to the default worker will be available to
         * `newWorker` and `oldWorker` thanks to the magic of closure.
         *
         * In fact, this magic will allow `oldWorker` to make changes to, e.g.,
         * the `files` argument. Then these changes will be available to
         * `newWorker` even though we are **NOT** passing any data between the
         * functions! See? Magic. <poof... disappears>
         */
        let newWorker = function() {
            let metadata = metalsmith.metadata();
            addCollectionLinks( metadata );
        };

        /*
         * Call the original worker function, and pass it the new worker. Oldie
         * will call this function when its done with its work.
         */
        oldWorker( files, metalsmith, newWorker );
    }
};

module.exports = plugin;
