let assets = require( '../index' );
let chai = require( 'chai' );
let dirtyChai = require( 'dirty-chai' );
let Metalsmith = require( 'metalsmith' );
let path = require( 'path' );
let fs = require( 'fs-extra' );
let _ = require( 'lodash' );

let metalsmithReplacer = require( '../lib/utilities/metalsmithReplacer' );
let saveMetadata = require( '../lib/utilities/saveMetadata' );

chai.use( dirtyChai );
let expect = chai.expect;

describe( 'metalsmith-assets-improved', function() {
    const fixtureRoot = path.resolve( __dirname, 'fixtures' );

    before( function() {
        fs.removeSync( fixtureRoot + '/*/build' );
    } );

    let getExpected = function( fixturePath, options ) {
        // Set paths
        let defaults = {
            src: path.resolve( fixturePath, 'assets' ),
            dest: path.resolve( fixturePath, 'build' )
        };
        let expected = _.merge( {}, defaults, options );

        // Read file info
        let files = fs.readdirSync( expected.src );
        expected.files = _( files )
            .keyBy( file => file )
            .mapValues( ( value, key ) => {
                let file = path.resolve( expected.src, key );
                return fs.statSync( file );
            } )
            .pickBy( ( value, key ) => value.isFile() );

        return expected;
    };

    context( '(when given a configuration object)', function() {

        it( 'does something', function( done ) {
            let fixturePath = path.resolve( fixtureRoot, 'basic' );
            let metalsmith = Metalsmith( fixturePath );
            metalsmith
                .use( assets() )
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

        it( 'copies files from the default source directory to the default destination directory' );
        it( 'copies files from a configured source directory to a configured destination directory' );
        it( 'does not overwrite files when no "replace" option is given' );
        it( 'does not overwrite files when the "replace" option is set to "none"' );
        it( 'does copies new files when the "replace" option is set to "none"' );
        it( 'does overwrite files when the "replace" option is set to "all"' );
        it( 'only overwrites older files when the "replace" option is set to "old"' );
    } );

    context( '(when given an array of configuration objects)', function() {
        it( 'copies files from all configured source directories to all configured destination directories' );
        it( 'correctly observes the "replace" option of each config object' );
    } );

} );
