var strings = {} ;
export default strings ;

strings.toDateObject = function( date ) {
	if ( ! ( date instanceof Date ) ) {
		if ( typeof date === 'string' ) {
			date = new Date( date ) ;
		}
	}
	return date ;
} ;
strings.dateYearUTC = function( date ) {
	if ( ! date ) return null ;
	date = strings.toDateObject( date ) ;
	return `${date.getUTCFullYear()}` ;
} ;
strings.dateUTC = function( date , separator = '-' ) {
	if ( ! date ) return null ;
	date = strings.toDateObject( date ) ;
	return `${date.getUTCFullYear()}${separator}${strings.pad( date.getUTCMonth() + 1 )}${separator}${strings.pad( date.getUTCDate() )}` ;
} ;
strings.timeUTC = function( date ) {
	if ( ! date ) return null ;
	date = strings.toDateObject( date ) ;
	return `${strings.pad( date.getUTCHours() )}:${strings.pad( date.getUTCMinutes() )}` ;
} ;
strings.datetimeUTC = function( date , separator = '-' ) {
	if ( ! date ) return null ;
	date = strings.toDateObject( date ) ;
	return `${date.getUTCFullYear()}${separator}${strings.pad( date.getUTCMonth() + 1 )}${separator}${strings.pad( date.getUTCDate() )} ${strings.pad( date.getUTCHours() )}:${this.pad( date.getUTCMinutes() )}` ;
} ;

strings.capitalize = function( name ) {
	return name.charAt( 0 ).toUpperCase() + name.slice( 1 ) ;
} ;
strings.unCapitalize = function( name ) {
	return name.charAt( 0 ).toLowerCase() + name.slice( 1 ) ;
} ;

strings.mapReplace = function( str , map ) {
	var i , keys , length , from , to ;

	keys = Object.keys( map ) ;
	length = keys.length ;

	for ( i = 0 ; i < length ; i++ ) {
		from = keys[ i ] ;
		to = map[ from ] ;
		str = str.replace( new RegExp( from , 'g' ) , to ) ;
	}

	return str ;
} ;

strings.isUpperCase = function( str ) {
	return str === str.toUpperCase() ;
} ;

strings.isLowerCase = function( str ) {
	return str === str.toLowerCase() ;
} ;

strings.dedupSlash = function( str ) {
	return str.replace( /\/+/g , '/' ) ;
} ;

strings.trimStart = function( str , char ) {
	while( str.charAt( 0 ) === char ) {
		str = str.substr( 1 ) ;
	}
	return str ;
} ;

strings.trimEnd = function( str , char ) {
	while( str.charAt( str.length - 1 ) === char ) {
		str = str.substr( 0 , str.length - 1 ) ;
	}
	return str ;
} ;

strings.trim = function( str , char ) {
	var trimStart = this.trimStart( str , char ) ;
	var trimEnd = this.trimEnd( trimStart , char ) ;
	return trimEnd ;
} ;
strings.pad = function( number ) {
	if ( number < 10 ) {
		return '0' + number ;
	}
	return number ;
} ;
