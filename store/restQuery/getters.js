import urls from '../../lib/urls' ;
import doormen from '../../lib/doormen' ;
import { cloneDeep } from 'lodash-es' ;


export default {
	hasInit: () => {
		return true ;
	} ,
	collection: ( state ) => ( queryObject ) => {
		var queryString = urls.queryObjectToQueryString( queryObject , true ) ,
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
		// return doormen.report( state.schema , values ) ;
		return doormen.report( state.schema , cloneDeep( values ) ) ;
		// return doormen.export( state.schema , values ) ;
	} ,

	validatePatch: ( state ) => ( values ) => {
		// return doormen.patch.report( state.schema , values ) ;
		return doormen.patch.report( state.schema , cloneDeep( values ) ) ;
		// return doormen.patch.export( state.schema , values ) ;
	}
} ;
