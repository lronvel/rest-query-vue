import urls from '../../lib/urls' ;
import doormen from '../../lib/doormen' ;
import { cloneDeep } from 'lodash-es' ;


export default {
	hasInit: () => {
		return true ;
	} ,

	getMeta: ( state ) => ( queryObject ) => {
		var url = state.path ;
		var queryString = urls.queryObjectToQueryString( queryObject , true ) ;

		if ( queryObject.id ) url += `/${queryObject.id}` ;
		if ( queryString ) url += `?${queryString}` ;

		return state.meta[ url ] || false ;

		// var queryString = urls.queryObjectToQueryString( queryObject , true ) ;
		// return state.meta[ queryString ] || false ;
	} ,

	collection: ( state ) => ( queryObject ) => {
		var url = state.path ;
		var queryString = urls.queryObjectToQueryString( queryObject , true ) ;

		if ( queryString ) url += `?${queryString}` ;

		var collection = state.collections[ url ] || [] ;

		return collection.map( id => state.documents[ id ] ) ;
	} ,

	document: ( state ) => ( idOrSlug ) => {
		var id = state.documentsSlugs[ idOrSlug ] || idOrSlug ;
		return state.documents[ id ] || null ;
	} ,

	validateDocument: ( state ) => ( values ) => {
		return doormen.report( state.schema , cloneDeep( values ) ) ;
		// return doormen.export( state.schema , values ) ;
	} ,

	validatePatch: ( state ) => ( values ) => {
		return doormen.patch.report( state.schema , cloneDeep( values ) ) ;
		// return doormen.patch.export( state.schema , values ) ;
	}
} ;
