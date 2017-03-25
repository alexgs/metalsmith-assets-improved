let assets = require( '../index' );
let fs = require( 'fs-extra' );
let Metalsmith = require( 'metalsmith' );
let path = require( 'path' );

let metalsmithReplacer = require( '../lib/utilities/metalsmithReplacer' );
let saveMetadata = require( '../lib/utilities/saveMetadata' );

let files = require( './lib/file-helpers' );
let fn = require( './lib/test-functions' );

describe( 'metalsmith-assets-improved', function() {
    const fixtureRoot = path.resolve( __dirname, 'fixtures' );

    before( function() {
        files.purgeBuildDirs( fixtureRoot );
    } );

    context( '(when given a configuration object)', function() {

        after( function() {
            files.purgeTempFiles();
        } );

        it( 'copies files from the default source directory to the default destination directory', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'basic' );
            let metalsmith = Metalsmith( fixturePath );
            metalsmith
                .use( assets() )
                .build( function( err ) {
                    if ( err ) return done( err );

                    let expected = fn.getExpected( fixturePath );
                    let actualFiles = files.readFileStats( path.resolve( fixturePath, 'build', '.' ) );
                    fn.compareFileStats( expected.files, actualFiles );
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

                    let expected = fn.getExpected( fixturePath, assetOptions );
                    let actualFiles = files.readFileStats( path.resolve( fixturePath, 'build', assetOptions.dest ) );
                    fn.compareFileStats( expected.files, actualFiles );
                    done();
                } );
        } );

        it( 'does not overwrite files when no "replace" option is given', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'replace1' );

            // Create a set of duplicate files, one older and one newer
            files.createTempFilePair( fixturePath, null, true );
            files.createTempFilePair( fixturePath, null, false );

            let metalsmith = Metalsmith( fixturePath );
            metalsmith
                .clean( false )
                .use( assets() )
                .build( function( err ) {
                    if ( err ) return done( err );

                    let expected = fn.getExpected( fixturePath );
                    let actualFiles = files.readFileStats( path.resolve( fixturePath, 'build', '.' ) );
                    fn.compareFileStats( expected.files, actualFiles );

                    done();
                } );
        } );

        it( 'does not overwrite files when the "replace" option is set to "none"', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'replace2' );

            // Create a set of duplicate files, one older and one newer
            files.createTempFilePair( fixturePath, null, true );
            files.createTempFilePair( fixturePath, null, false );

            let metalsmith = Metalsmith( fixturePath );
            let assetOptions = {
                replace: 'none'
            };
            metalsmith
                .clean( false )
                .use( assets( assetOptions ) )
                .build( function( err ) {
                    if ( err ) return done( err );

                    let expected = fn.getExpected( fixturePath );
                    let actualFiles = files.readFileStats( path.resolve( fixturePath, 'build', '.' ) );
                    fn.compareFileStats( expected.files, actualFiles, assetOptions.replace );

                    done();
                } );
        } );
        it( 'copies only new files when the "replace" option is set to "none"' );
        it( 'overwrites files when the "replace" option is set to "all"' );
        it( 'only overwrites older files when the "replace" option is set to "old"' );
    } );

    context( '(when given an array of configuration objects)', function() {
        it( 'copies files from all configured source directories to all configured destination directories' );
        it( 'correctly observes the "replace" option of each config object' );
    } );

} );
