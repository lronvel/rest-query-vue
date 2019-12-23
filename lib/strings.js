import charmap from 'rest-query-shared/lib/charmap' ;

export default {
	localeDate( date ) {
		if ( ! date ) return '' ;

		if ( typeof date === 'string' ) {
			date = new Date( date ) ;
		}
		return date.toISOString().slice( 0 , 10 ) ;
	} ,

	capitalize( name ) {
		return name.charAt( 0 ).toUpperCase() + name.slice( 1 ) ;
	} ,
	unCapitalize( name ) {
		return name.charAt( 0 ).toLowerCase() + name.slice( 1 ) ;
	} ,

	mapReplace( str , map ) {
		var i , keys , length , from , to ;

		keys = Object.keys( map ) ;
		length = keys.length ;

		for ( i = 0 ; i < length ; i++ ) {
			from = keys[ i ] ;
			to = map[ from ] ;
			str = str.replace( new RegExp( from , 'g' ) , to ) ;
		}

		return str ;
	} ,

	arabic2latin( str ) {
		if ( typeof str !== 'string' ) return '' ;

		str = str.normalize( 'NFKD' ) ;
		str = this.mapReplace( str , charmap.asciiMapWorldAlpha ) ;
		return str ;
	} ,

	isUpperCase( str ) {
		return str === str.toUpperCase() ;
	} ,

	isLowerCase( str ) {
		return str === str.toLowerCase() ;
	} ,

	dedupSlash( str ) {
		return str.replace( /\/+/g , '/' ) ;
	} ,

	trimStart( str , char ) {
		while( str.charAt( 0 ) === char ) {
			str = str.substr( 1 ) ;
		}
		return str ;
	} ,

	trimEnd( str , char ) {
		while( str.charAt( str.length - 1 ) === char ) {
			str = str.substr( 0 , str.length - 1 ) ;
		}
		return str ;
	} ,

	trim( str , char ) {
		var trimStart = this.trimStart( str , char ) ;
		var trimEnd = this.trimEnd( trimStart , char ) ;
		return trimEnd ;
	}
} ;
