let assets = require( '../index' );
let chai = require( 'chai' );
let chaiDatetime = require( 'chai-datetime' );
let dirtyChai = require( 'dirty-chai' );
let fs = require( 'fs-extra' );
let Metalsmith = require( 'metalsmith' );
let path = require( 'path' );
let _ = require( 'lodash' );

let metalsmithReplacer = require( '../lib/utilities/metalsmithReplacer' );
let saveMetadata = require( '../lib/utilities/saveMetadata' );

chai.use( chaiDatetime );
chai.use( dirtyChai );
let expect = chai.expect;

let readFileStats = function( directory ) {
    let fileList = fs.readdirSync( directory );
    return _( fileList )
        .keyBy( file => file )
        .mapValues( ( value, key ) => {
            let file = path.resolve( directory, key );
            return fs.statSync( file );
        } )
        .pickBy( ( value, key ) => value.isFile() );
};

let compareFileStats = function( expected, actual ) {
    let expectedFiles = _.keys( expected );
    let actualFiles = _.keys( actual );
    expect( actualFiles ).to.include( expectedFiles );
    // expect( actual ).to.contain.all.keys( expectedFiles );

    expectedFiles.forEach( ( expectedStat, file ) => {
        let actualStat = actual[ file ];
        expect( expectedStat.size ).to.equal( actualStat.size );
        expect( expectedStat.mtime ).to.equalDate( actualStat.mtime );
        expect( expectedStat.mtime ).to.equalTime( actualStat.mtime );
    } );
};

describe( 'metalsmith-assets-improved', function() {
    const fixtureRoot = path.resolve( __dirname, 'fixtures' );

    before( function() {
        fs.removeSync( fixtureRoot + '/*/build' );
    } );

    /**
     * Gets an object containing the expected results of executing the "assets
     * improved" plugin.
     * @param {String} fixturePath The path to the test fixture
     * @param {Object} [options] The options object as passed to the `assets` function.
     * Unlike that function, this test helper does **not** accept n array of
     * configuration objects.
     * @returns {Object} A "expected properties" object with the following
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
        // Set default paths
        let defaults = {
            src: path.resolve( fixturePath, 'assets' ),
            dest: path.resolve( fixturePath, 'build', '.' )
        };

        // Resolve paths in `options`, if any
        let optionPaths = { };
        if ( options ) {
            [ 'src', 'dest' ].forEach( prop => {
                if ( options[ prop ] ) {
                    let target = options[ prop ];
                    optionPaths[ prop ] = path.resolve( fixturePath, target );
                }
            } );
        }

        // Merge objects
        let expected = _.merge( {}, defaults, options, optionPaths );

        // Read file info
        expected.files = readFileStats( expected.src );

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
