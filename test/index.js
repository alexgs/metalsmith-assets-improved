let assets = require( '../index' );
let chai = require( 'chai' );
let dirtyChai = require( 'dirty-chai' );
let Metalsmith = require( 'metalsmith' );
let path = require( 'path' );
let fs = require('fs-extra');

let metalsmithReplacer = require( '../lib/utilities/metalsmithReplacer' );
let saveMetadata = require( '../lib/utilities/saveMetadata' );

chai.use( dirtyChai );
let expect = chai.expect;

describe( 'metalsmith-assets-improved', function() {
    const fixtureRoot = path.resolve( __dirname, 'fixtures' );

    before( function() {
        fs.removeSync( fixtureRoot + '/*/build' );
    } );

    context( '(when given a configuration object)', function(){

        it( 'does something', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'basic' );
            let metalsmith = Metalsmith( fixturePath );
            metalsmith
                .use( assets(  ) )
                .build( function( err, files ) {
                    if ( err ) return done( err );
                    //noinspection JSCheckFunctionSignatures
                    let metadata = metalsmith.metadata();

                    // Save file and collection metadata to JSON files
                    let metadataCollection = {
                        files: files,
                        collections: metadata
                    };
                    saveMetadata( fixturePath, metadataCollection );

                    // >>> TEST HERE << \\
                    expect( 1 + 1 ).to.equal( 3 );

                    done();
                } );
        } );

        it( 'copies files from the default source directory' );
        it( 'copies files to the default destination directory' );
        it( 'copies files from a configured source directory' );
        it( 'copies files to a configured destination directory' );
        it( 'does not overwrite files when no "replace" option is given' );
        it( 'does not overwrite files when the "replace" option is set to "none"' );
        it( 'does copies new files when the "replace" option is set to "none"' );
        it( 'does overwrite files when the "replace" option is set to "all"' );
        it( 'only overwrites older files when the "replace" option is set to "old"' );
    } );

    context( '(when given an array of configuration objects)', function() {
        it( 'copies files from all configured source directories' );
        it( 'copies files to all configured destination directories' );
        it( 'correctly observes the "replace" option of each config object' );
    } );

} );
