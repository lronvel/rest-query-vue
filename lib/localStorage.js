export default {
	detect: function() {
		return ! ( typeof window === 'undefined' || typeof window.localStorage === 'undefined' ) ;
	} ,
	getItem: function( key ) {
		if ( this.detect() ) {
			return window.localStorage.getItem( key ) ;
		}
		return false ;
	} ,
	setItem: function( key , value ) {
		if ( this.detect() ) {
			return window.localStorage.setItem( key , value ) ;
		}
		return false ;
	}
} ;
