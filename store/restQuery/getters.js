import urls from '../../lib/urls.js' ;
import doormen from 'doormen/lib/browser.js' ;

doormen.setClientMode( true ) ;

export default {
	collection: ( state ) => ( queryObject ) => {
		var queryString = urls.queryObjectToQueryString( queryObject ) ,
			collection = state.collections[ queryString ] ;

		if ( ! collection || ! collection.data ) return [] ;

		var data = collection.data.filter( id => state.documents[ id ] ) ;
		return data.map( id => state.documents[ id ] ) ;
	} ,

	document: ( state ) => ( idOrSlug ) => {
		var id = state.documentsSlugs[ idOrSlug ] || idOrSlug ;
		return state.documents[ id ] || null ;
	} ,

	validateDocument: ( state ) => ( values ) => {
		return doormen.report( state.schema , values ) ;
	} ,

	validatePatch: ( state ) => ( values ) => {
		return doormen.patch.report( state.schema , values ) ;
	}
} ;
