let chai = require( 'chai' );
let chaiMoment = require( 'chai-moment-js' );
let dirtyChai = require( 'dirty-chai' );
let _ = require( 'lodash' );

let files = require( './file-helpers' );

chai.use( chaiMoment );
chai.use( dirtyChai );
let expect = chai.expect;

let noOverwriteComparison = function( expectedStat, actualStat, destFileIsOlder, filename ) {
    if ( destFileIsOlder ) {
        expect( expectedStat.mtime, `<<< ${filename} >>>` ).is.after.moment( actualStat.mtime, 'second' );
    } else {
        expect( expectedStat.mtime, `<<< ${filename} >>>` ).is.before.moment( actualStat.mtime, 'second' );
    }
};

let overwriteAllComparison = function( expectedStat, actualStat, destFileIsOlder, filename ) {
    // We don't need no stinkin' `destFileIsOlder` argument here!
    expect( expectedStat.mtime, `<<< ${filename} >>>` ).is.same.moment( actualStat.mtime, 'second' );
};

let functions = {

    compareFileStats: function( expected, actual, replace ) {
        let expectedFiles = _.keys( expected );
        let actualFiles = _.keys( actual );

        expect( actualFiles ).to.include.members( expectedFiles );

        expectedFiles.forEach( file => {
            let actualStat = actual[ file ];
            let expectedStat = expected[ file ];
            expect( expectedStat.size ).to.equal( actualStat.size );

            // Compare sample files differently than regular files
            let compareTimestamps = files.doTimestampComparison( file );
            if ( _.isBoolean( compareTimestamps ) ) {
                switch( replace ) {
                    case 'all':
                        // throw new Error( 'Unimplemented method' );
                        overwriteAllComparison( expectedStat, actualStat, compareTimestamps, file );
                        break;
                    case 'old':
                        throw new Error( 'Unimplemented method' );
                        break;
                    case 'none':
                        noOverwriteComparison( expectedStat, actualStat, compareTimestamps, file );
                        break;
                    case undefined:
                        noOverwriteComparison( expectedStat, actualStat, compareTimestamps, file );
                        break;
                    default:
                        throw new Error( 'Unknown comparison value: ' + replace );
                }
            } else {
                /**
                 * Because copying the time stamps only works to the second and
                 * drops milliseconds, we need a little fudge factor here
                 */
                expect( expectedStat.mtime ).is.same.moment( actualStat.mtime, 'second' );
            }

        } );
    },

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
    getExpected: function( fixturePath, options ) {
        let expected = files.getPaths( fixturePath, options );
        expected.files = files.readFileStats( expected.src );
        return expected;
    }

};

module.exports = functions;
