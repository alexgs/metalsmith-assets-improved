let debug = require( 'debug' )( 'metalsmith-assets-improved' );
let fs = require( 'fs-extra' );
let path = require( 'path' );
let _ = require( 'lodash' );

// let metalsmithReplacer = require( './lib/utilities/metalsmithReplacer' );

let getFilter = function( replace, src, dest ) {
    let filter = null;
    // console.log( `~~~ ${replace} ~~~` );
    switch ( replace ) {
        case 'all':
            filter = function() {
                // To overwrite everything, return `true` always
                return true;
            };
            break;
        case 'none':
            // fall through
        case undefined:
            // Do not copy if destination file exists, regardless of modification time
            filter = function( file ) {
                let destFile = resolveDestFile( file, dest );
                //noinspection RedundantIfStatementJS
                if ( fs.existsSync( destFile ) ) {
                    return false;
                } else {
                    return true;
                }
            };
            break;
        default:
            throw new Error( 'Unknown value for `replace` property: ' + replace );
    }
    return filter;
};

let resolveDestFile = function( file, dest ) {
    let base = path.basename( file );
    return path.resolve( dest, base );
};

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
    // Make sure there is an `options` object with a `replace` property
    options = _.merge( {}, options );
    if ( !_.has( options, 'replace' ) ) {
        options.replace = undefined;
    }

    return function( files, metalsmith, done ) {
        // Set the next function to run once we are done
        setImmediate( done );

        // Default paths, relative to Metalsmith working directory
        let defaults = {
            src: 'assets',
            dest: '.'
        };

        // Merge options and resolve src/dest paths
        let config = _.merge( { }, defaults, options );
        config.src = metalsmith.path( config.src );
        config.dest = metalsmith.path( metalsmith.destination(), config.dest );

        // Set options for `fs-extra` copy operation--options set to default are marked
        let copyOptions = {
            overwrite: true,                // default
            errorOnExist: false,            // default
            dereference: false,             // default
            preserveTimestamps: true,
            filter: getFilter( config.replace, config.src, config.dest )
        };

        // Make it so!
        fs.copySync( config.src, config.dest, copyOptions );
    }

};

module.exports = plugin;
