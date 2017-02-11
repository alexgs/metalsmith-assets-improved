'use strict';

module.exports = function( key, value ) {
    if ( key === 'contents' || key === 'stats' ) {
        return '...';
    }

    if ( key === 'next' ) {
        return ( value && value.title ) ? value.title : '[[ Next ]]';
    }

    if ( key === 'nextInCollection' ) {
        let result = { };
        Object.keys( value ).forEach( name => {
            result[ name ] = value[ name ].title || '[[ Next ]]';
        } );
        return result;
    }

    if ( key === 'previous' ) {
        return ( value && value.title ) ? value.title : '[[ Prev ]]';
    }

    if ( key === 'prevInCollection' ) {
        let result = { };
        Object.keys( value ).forEach( name => {
            result[ name ] = value[ name ].title || '[[ Prev ]]';
        } );
        return result;
    }

    // Default
    return value;
};
