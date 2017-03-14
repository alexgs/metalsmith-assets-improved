let assets = require( '../index' );
let chai = require( 'chai' );
let chaiMoment = require( 'chai-moment-js' );
let dirtyChai = require( 'dirty-chai' );
let fs = require( 'fs-extra' );
let Metalsmith = require( 'metalsmith' );
let path = require( 'path' );
let _ = require( 'lodash' );

let metalsmithReplacer = require( '../lib/utilities/metalsmithReplacer' );
let saveMetadata = require( '../lib/utilities/saveMetadata' );

let helpers = require( '../lib/file-test-helpers' );

chai.use( chaiMoment );
chai.use( dirtyChai );
let expect = chai.expect;

let noOverwriteComparison = function( expectedStat, actualStat, destFileIsOlder, filename ) {
    if ( destFileIsOlder ) {
        // expect( expectedStat.mtime ).is.before.moment( actualStat.mtime, 'second' );
        expect( expectedStat.mtime, `<<< ${filename} >>>` ).is.after.moment( actualStat.mtime, 'second' );
    } else {
        // expect( expectedStat.mtime ).is.after.moment( actualStat.mtime, 'second' );
        expect( expectedStat.mtime, `<<< ${filename} >>>` ).is.before.moment( actualStat.mtime, 'second' );
    }
};

let compareFileStats = function( expected, actual, replace ) {
    let expectedFiles = _.keys( expected );
    let actualFiles = _.keys( actual );
    // console.log( '>>> Expected <<<\n', JSON.stringify( expectedFiles, null, 2 ) );
    // console.log( '>>> Actual <<<\n', JSON.stringify( actualFiles, null, 2 ) );

    expect( actualFiles ).to.include.members( expectedFiles );

    expectedFiles.forEach( file => {
        let actualStat = actual[ file ];
        let expectedStat = expected[ file ];
        expect( expectedStat.size ).to.equal( actualStat.size );

        // Compare sample files differently than regular files
        let compareTimestamps = helpers.doTimestampComparison( file );
        if ( _.isBoolean( compareTimestamps ) ) {
            switch( replace ) {
                case 'all':
                    throw new Error( 'Unimplemented method' );
                    break;
                case 'old':
                    throw new Error( 'Unimplemented method' );
                    break;
                case 'none':
                    throw new Error( 'Unimplemented method' );
                    break;
                default: noOverwriteComparison( expectedStat, actualStat, compareTimestamps, file );
            }
        } else {
            /**
             * Because copying the time stamps only works to the second and
             * drops milliseconds, we need a little fudge factor here
             */
            expect( expectedStat.mtime ).is.same.moment( actualStat.mtime, 'second' );
        }

    } );
};

/**
 * Gets an object containing the expected results of executing the "assets
 * improved" plugin.
 * @param {String} fixturePath The path to the test fixture
 * @param {Object} [options] The options object as passed to the `assets`
 * function. Unlike that function, this test helper does **not** accept an
 * array of configuration objects.
 * @returns {Object} An "expected properties" object with the following
 * properties:
 *   @property {String} src Absolute path to the source directory for the
 *   test.
 *   @property {String} dest Absolute path to destination directory for the
 *   test.
 *   @property {Object} files An object having filenames from `src` as its
 *   keys and corresponding `fs.Stats` objects for values.
 * Any additional properties on the optional `options` object will be
 * copied to this object.
 */
let getExpected = function( fixturePath, options ) {
    let expected = helpers.getPaths( fixturePath, options );
    expected.files = helpers.readFileStats( expected.src );
    return expected;
};

describe( 'metalsmith-assets-improved', function() {
    const fixtureRoot = path.resolve( __dirname, 'fixtures' );

    before( function() {
        helpers.purgeBuildDirs( fixtureRoot );
    } );

    context( '(when given a configuration object)', function() {

        after( function() {
            helpers.purgeTempFiles();
        } );

        it( 'copies files from the default source directory to the default destination directory', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'basic' );
            let metalsmith = Metalsmith( fixturePath );
            metalsmith
                .use( assets() )
                .build( function( err ) {
                    if ( err ) return done( err );

                    let expected = getExpected( fixturePath );
                    let actualFiles = helpers.readFileStats( path.resolve( fixturePath, 'build', '.' ) );
                    compareFileStats( expected.files, actualFiles );
                    done();
                } );
        } );

        it( 'copies files from a configured source directory to a configured destination directory', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'custom' );
            let metalsmith = Metalsmith( fixturePath );
            let assetOptions = {
                src: 'static',
                dest: 'static'
            };
            metalsmith
                .use( assets( assetOptions ) )
                .build( function( err ) {
                    if ( err ) return done( err );

                    let expected = getExpected( fixturePath, assetOptions );
                    let actualFiles = helpers.readFileStats( path.resolve( fixturePath, 'build', assetOptions.dest ) );
                    compareFileStats( expected.files, actualFiles );
                    done();
                } );
        } );

        it( 'does not overwrite files when no "replace" option is given', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'replace1' );

            // Create a set of duplicate files, one older and one newer
            helpers.createTempFilePair( fixturePath, null, true );
            helpers.createTempFilePair( fixturePath, null, false );

            // let srcPath, destPath;
            // [ srcPath, destPath ] = helpers.createTempFilePair( fixturePath, null, true );
            // expect( fs.existsSync( srcPath ) ).to.equal( true );
            // expect( fs.existsSync( destPath ) ).to.equal( true );
            // [ srcPath, destPath ] = helpers.createTempFilePair( fixturePath, null, false );
            // expect( fs.existsSync( srcPath ) ).to.equal( true );
            // expect( fs.existsSync( destPath ) ).to.equal( true );

            let metalsmith = Metalsmith( fixturePath );
            metalsmith
                .clean( false )
                .use( assets() )
                .build( function( err ) {
                    if ( err ) return done( err );

                    let expected = getExpected( fixturePath );
                    let actualFiles = helpers.readFileStats( path.resolve( fixturePath, 'build', '.' ) );
                    compareFileStats( expected.files, actualFiles );

                    done();
                } );
            // done();
        } );

        it( 'does not overwrite files when the "replace" option is set to "none"' );
        it( 'copies only new files when the "replace" option is set to "none"' );
        it( 'overwrites files when the "replace" option is set to "all"' );
        it( 'only overwrites older files when the "replace" option is set to "old"' );
    } );

    context( '(when given an array of configuration objects)', function() {
        it( 'copies files from all configured source directories to all configured destination directories' );
        it( 'correctly observes the "replace" option of each config object' );
    } );

} );
