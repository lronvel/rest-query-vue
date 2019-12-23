import strings from '../lib/strings' ;

export default {
	computed: {
		goUpUrl: function() {
			var route = this.$route.fullPath.split( '/' ) ;
			route.pop() ;
			return route.join( '/' ) ;
		}
	} ,
	methods: {
		navigationGoBack: function() {
			var route = this.$route.fullPath.split( '/' ) ;
			route.pop() ;
			this.$router.push( route.join( '/' ) ) ;
		} ,
		navigationToCollection: function( module ) {
			this.$router.push( { name: strings.capitalize( module ) } ) ;
		} ,
		navigationToDocument: function( module , documentId ) {
			this.$router.push( `/${strings.capitalize( module )}/${documentId}` ) ;
		} ,
		navigationToDocumentEdit: function( module , documentId ) {
			this.$router.push( `/${strings.capitalize( module )}/${documentId}/EDIT` ) ;
		} ,
		navigationToDocumentNew: function( module ) {
			this.$router.push( `/${strings.capitalize( module )}/CREATE` ) ;
		} ,
		navigationToDocumentMethod: function( module , documentId , method ) {
			this.$router.push( `/${strings.capitalize( module )}/${documentId}/${method}` ) ;
		} ,

		urlToDocument: function( module , documentId ) {
			return `/${strings.capitalize( module )}/${documentId}` ;
		}
	}
} ;
