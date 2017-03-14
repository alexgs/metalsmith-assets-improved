let fs = require( 'fs-extra' );
let moment = require( 'moment' );
let path = require( 'path' );
let simpsonIpsum = require( './simpson-ipsum' );
let _ = require( 'lodash' );

let tempFilesInUse = new Set();
let tempFileRegex = /^sample-\d\d\d-?(OLD|NEW)?.txt$/;

let createTempFilePair = function( workingDirectory, options, old ) {
    let srcPath = null, destPath = null;
    ( { srcPath, destPath } = getTempPaths( workingDirectory, options, old ) );

    // Write data to the files
    let simpson = simpsonIpsum.get();
    fs.outputFileSync( srcPath, simpson );
    fs.outputFileSync( destPath, simpson );

    // Set file timestamps
    if ( _.isBoolean( old ) ) {
        let srcTime = moment( getRandomTimestamp() );
        let duration = getRandomDuration();
        let destTime = srcTime.clone();
        if ( old ) {
            destTime.subtract( duration );
        } else {
            destTime.add( duration );
        }
        fs.utimesSync( srcPath, srcTime.unix(), srcTime.unix() );
        fs.utimesSync( destPath, destTime.unix(), destTime.unix() );
    }
    return [ srcPath, destPath ];
};

let doTimestampComparison = function( filename ) {
    let regexResult = tempFileRegex.exec( filename );
    if ( _.isNull( regexResult ) ) {
        return undefined;
    }

    let tag = regexResult[1];   // is 'OLD' or 'NEW'
    if ( tag === 'OLD' ) {
        return true;
    } else if ( tag === 'NEW' ) {
        return false;
    } else {
        throw new Error( 'Unknown sample file pattern ' + filename );
    }
};

let getFileModifiedTime = function( file ) {
    let stat = fs.statSync( file );
    return stat.mtime.clone();
};

let getPaths = function( workingDirectory, options ) {
    // Set default paths
    let defaults = {
        src: path.resolve( workingDirectory, 'assets' ),
        dest: path.resolve( workingDirectory, 'build', '.' )
    };

    // Resolve paths in `options`, if any
    let optionPaths = {};
    if ( _.has( options, 'src' ) ) {
        optionPaths.src = path.resolve( workingDirectory, options.src );
    }
    if ( _.has( options, 'dest' ) ) {
        optionPaths.dest = path.resolve( workingDirectory, 'build', options.dest );
    }

    // Merge objects
    return _.merge( {}, defaults, options, optionPaths );
};

/**
 * Returns a [MomentJS Duration object][1] with a length between 1 and 8 days.
 *
 * [1]: https://momentjs.com/docs/#/durations/
 * @returns {moment.Duration} A Duration object
 */
let getRandomDuration = function() {
    return moment.duration( {
        seconds: getRandomInt( 0, 60 ),
        minutes: getRandomInt( 0, 60),
        hours: getRandomInt( 0, 24 ),
        days: getRandomInt( 1, 8 )
    } );
};

/**
 * Returns a random integer between the specified values.
 * @param {Number} min Minimum value for the random integer (or the next integer greater than min if min isn't an integer)
 * @param {Number} max Maximum value for the random integer. The random integer is less than (but not equal to) `max`
 * @returns {Number} A random integer `x` such that `min` <= `x` < `max`.
 */
let getRandomInt = function( min, max ) {
    min = Math.ceil( min );
    max = Math.floor( max );
    return Math.floor( Math.random() * (max - min) ) + min;
};

/**
 * Returns a random time (in milliseconds since Unix Epoch) between
 * 1 January 2017 and the present time.
 * @returns {Number} Random number of milliseconds
 */
let getRandomTimestamp = function() {
    let earliest = moment( '2017-01-01' ).valueOf();
    let latest = moment( Date.now() ).valueOf();
    return getRandomInt( earliest, latest );
};

let getTempPaths = function( workingDirectory, options, old ) {
    let srcPath = null, destPath = null;
    let paths = getPaths( workingDirectory, options );

    let done = false;
    while ( !done ) {
        let filename = makeTempFileName( old );
        srcPath = path.resolve( paths.src, filename );
        destPath = path.resolve( paths.dest, filename );
        if ( !tempFilesInUse.has( srcPath ) && !tempFilesInUse.has( destPath ) ) {
            tempFilesInUse.add( srcPath );
            tempFilesInUse.add( destPath );
            done = true;
        }
    }

    return { srcPath: srcPath, destPath: destPath };
};

let makeTempFileName = function( old ) {
    let randomFiller = _.padStart( Math.floor( Math.random() * 1000 ), 3, 0 );
    let filenameParts = [ 'sample', randomFiller ];
    if ( _.isBoolean( old ) ) {
        let age = old ? 'OLD' : 'NEW';
        filenameParts = _.concat( filenameParts, age );
    }
    return _.join( filenameParts, '-' ) + '.txt';
};

let readFileStats = function( directory ) {
    let fileList = fs.readdirSync( directory );
    return _( fileList )
        .keyBy( file => file )
        .mapValues( ( value, key ) => {
            let file = path.resolve( directory, key );
            return fs.statSync( file );
        } )
        .pickBy( ( value, key ) => value.isFile() )
        .value();
};

let purgeBuildDirs = function( fixtureRoot ) {
    _( fs.readdirSync( fixtureRoot ) )
        .pickBy( value => {
            let file = path.resolve( fixtureRoot, value );
            let stat = fs.statSync( file );
            return stat.isDirectory();
        } )
        .forEach( directory => {
            let build = path.resolve( fixtureRoot, directory, 'build' );
            if ( fs.existsSync( build ) ) {
                fs.removeSync( build );
            }
        } );
};

let purgeTempFiles = function() {
    tempFilesInUse.forEach( filename => fs.removeSync( filename ) );
    tempFilesInUse.clear();
};

module.exports = {
    /**
     * Creates a file in both the source and destination directories. The file name
     * is `sample-XXX.txt` (where XXX is a random integer) and contains some lorem
     * ipsum text. If the destination and source files have differing timestamps,
     * then the name will be `sample-XXX-YYY.txt`, where YYY indicates whether the
     * **destination** file is OLD or NEW relative to the source file.
     * @param {String} workingDirectory The root directory of the Metalsmith
     * project.
     * @param {Object} [options] The options object as passed to the `assets`
     * function. Unlike that function, this test helper does **not** accept an
     * array of configuration objects.
     * @param {Boolean} [old] A flag to indicate whether the destination file
     * should be older (`true`), newer (`false`), or have the same timestamp
     * (`undefined`) as the source file
     */
    createTempFilePair: createTempFilePair,

    doTimestampComparison: doTimestampComparison,

    /**
     * Gets the last-modified timestamp (mtime) of a file
     * @param {String} file An absolute path to a file
     * @returns {Date} The mtime of the file specified in the argument
     */
    getFileModifiedTime: getFileModifiedTime,

    /**
     * Given a directory and an `options` object, returns the `src` and `dest`
     * paths correctly resolved relative to the directory.
     * @param {String} workingDirectory The Metalsmith working directory
     * @param {Object} [options] The options object as passed to the `assets`
     * function. Unlike that function, this test helper does **not** accept an
     * array of configuration objects.
     * @returns {Object} An object with `src` and `dest` fields, containing the
     * resolved paths. Any additional fields on the `options` argument object
     * are also present on the returned object; the `options` argument is
     * **not** mutated.
     */
    getPaths: getPaths,

    purgeBuildDirs: purgeBuildDirs,

    purgeTempFiles: purgeTempFiles,

    /**
     * Returns an array of fsStat objects for all of the files in the specified
     * directory. Subdirectories are ignored; they are not traversed and are
     * excluded from the array of fsStat objects.
     */
    readFileStats: readFileStats
};
