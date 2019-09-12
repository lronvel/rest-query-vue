export default {
	computed: {
		goBackUrl: function() {
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
			this.$router.push( { name: module } ) ;
		} ,
		navigationToDocument: function( module , documentId ) {
			this.$router.push( `/${module}/${documentId}` ) ;
		} ,
		navigationToDocumentEdit: function( module , documentId ) {
			this.$router.push( `/${module}/${documentId}/EDIT` ) ;
		} ,
		navigationToDocumentNew: function( module ) {
			this.$router.push( `/${module}/CREATE` ) ;
		}
	}
} ;
