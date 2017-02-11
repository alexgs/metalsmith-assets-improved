let assets = require( '../index' );
let chai = require( 'chai' );
let dirtyChai = require( 'dirty-chai' );
let Metalsmith = require( 'metalsmith' );
let path = require( 'path' );
let rimraf = require( 'rimraf' ); // TODO: replace with node-fs-extra

let metalsmithReplacer = require( '../lib/utilities/metalsmithReplacer' );
let saveMetadata = require( '../lib/utilities/saveMetadata' );

chai.use( dirtyChai );
let expect = chai.expect;

describe( 'metalsmith-assets-improved', function() {
    const fixtures = path.resolve( __dirname, 'basic-fixtures' );

        before( function( done ) {
            rimraf( fixtures + '/*/build', done );
        } );

    it( 'does something', function() {
        let fixturePath = path.resolve( fixtureRoot, 'basic' );
        let metalsmith = Metalsmith( fixturePath );
        metalsmith
            .use( collections( collectionsConfig ) )
            .build( function( err, files ) {
                if ( err ) return done( err );
                let metadata = metalsmith.metadata();

                // Save file and collection metadata to JSON files
                let metadataCollection = {
                    files: files,
                    collections: metadata
                };
                saveMetadata( fixturePath, metadataCollection );

                // >>> TEST HERE << \\

                done();
            } );
        } );

    } );
