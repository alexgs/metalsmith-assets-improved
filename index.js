let debug = require( 'debug' )( 'metalsmith-assets-improved' );

/**
 * Include static assets in a Metalsmith build
 *
 * @param {Object | Array} [options] (optional) A configuration object with one
 * or more of the following fields (all are optional). To copy from more than
 * one source or to more than one destination, pass an array of configuration
 * objects.
 *   @property {String} [src] Directory to copy files _from_. Relative paths are
 *   resolved against the Metalsmith project directory (i.e. `src` can be a
 *   sibling to the directory used as Metalsmith's source). Defaults to
 *   `./assets`.
 *   @property {String} [dest] Directory to copy files _to_. Relative paths are
 *   resolved against the directory configured via's Metalsmith `destination`
 *   function. Defaults to `.` (i.e. the same as `destination`).
 *   @property {String} [replace] Which, if any, files in the `dest` folder
 *   should be overwritten during the build process. Possible values are
 *     - 'all' (all files will be overwritten)
 *     - 'old' (files in `dest` older than their counterparts in `src` will
 *       be overwritten)
 *     - 'none' (no files in `dest` will be overwritten, but files in `src`
 *       without a counterpart will be copied to `dest`.
 *   Defaults to 'none'.
 * @returns {Function} Worker for the Metalsmith build process
 */
let plugin = function plugin( options ) {

    return function( files, metalsmith, done ) {
        // Set the next function to run once we are done
        setImmediate( done );

    }
};

module.exports = plugin;
