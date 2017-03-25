let quotes = require( './simpson-ipsum.json' ).data;
let _ = require( 'lodash' );

let get = function() {
    let minQuotes = 1;
    let maxQuotes = 6;
    let minParagraphs = 3;
    let maxParagraphs = 8;
    let numPara = getRandomInt( minParagraphs, maxParagraphs );
    return makeSimpsonIpsum( minQuotes, maxQuotes, numPara );
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

let makeParagraph = function( quoteCount ) {
    return _.times( quoteCount, () => {
        let index = getRandomInt( 0, quotes.length );
        return quotes[ index ];
    } ).join( ' ' );
};

let makeSimpsonIpsum = function( minQuotesPerPara, maxQuotesPerPara, numOfParagraphs ) {
    return _.times( numOfParagraphs, () => {
        let size = getRandomInt( minQuotesPerPara, maxQuotesPerPara );
        return makeParagraph( size );
    } ).join( '\n\n' );
};

module.exports = {
    get: get
};
