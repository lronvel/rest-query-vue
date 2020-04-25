import { merge } from 'lodash-es' ;
import Vue from 'vue' ;

// FIXME:
// setDocument & setCollection:
// 		add quickMerge ?
//		possible corruption error if new document doesnt have populated

export default {
	setSchema( state , values ) {
		state.schema = Object.freeze( values ) ;
		state.ready = true ;
	} ,
	setMeta( state , { url , status , lastFetch } ) {
		Vue.set( state.meta , url , {
			status: status , // error | fetching | fetched | refreshing
			lastFetch: lastFetch || new Date()
		} ) ;
	} ,
	setCollection( state , { url , data } ) {
		var collection = data ,
			stateCollection = [] ,
			newDocuments = {} ,
			newDocumentsSlugs = {} ;

		for ( let document of collection ) {
			stateCollection.push( document._id ) ;
			// newDocuments[document._id] = { ...state.documents[document._id] , ...document } ;
			newDocuments[document._id] = merge( {} , state.documents[document._id] , document ) ;
			// newDocuments[document._id] = quickMerge( state.documents[document._id] , document ) ;
			newDocumentsSlugs[document.slugId] = document._id ;
		}

		state.documentsSlugs = { ...state.documentsSlugs , ...newDocumentsSlugs } ;
		state.documents = { ...state.documents , ...newDocuments } ;

		state.collections = {
			...state.collections ,

			[url]: stateCollection
		} ;
	} ,

	mergeDocument( state , { data } ) {
		var document = data ;
		document = merge( {} , state.documents[document._id] , document ) ;
		// document = quickMerge( state.documents[document._id] , document ) ;

		Vue.set( state.documentsSlugs , document.slugId , document._id ) ;
		Vue.set( state.documents , document._id , document ) ;
		// state.documentsSlugs[document.slugId] = document._id ;
		// state.documents[document._id] = document ;
	} ,

	setDocument( state , { data } ) {
		var document = data ;
		// document = cloneDeep( document ) ;
		Vue.set( state.documentsSlugs , document.slugId , document._id ) ;
		Vue.set( state.documents , document._id , document ) ;
		// state.documentsSlugs[document.slugId] = document._id ;
		// state.documents[document._id] = document ;
	} ,

	deleteDocument( state , id ) {
		delete state.documents[id] ;
		state.documents = { ...state.documents } ;

		delete state.state.documentsSlugs[id] ;
		state.documentsSlugs = { ...state.documentsSlugs } ;
	}
} ;

function quickMerge( newDoc , oldDoc ) {
	var finalDoc = Object.assign( {} , oldDoc , newDoc ) ;

	for ( let [key , value] of Object.entries( finalDoc ) ) {
		if ( Array.isArray( value ) && newDoc[key][0]._id ) {
			for( let i = 0 ; i < newDoc[key].length ; i++ ) {
				if ( ! oldDoc[key][i] ) continue ;

				if ( newDoc[key][i]._id === oldDoc[key][i]._id ) {
					finalDoc[key] = Object.assign( {} , oldDoc[key][i] , newDoc[key][i] ) ;
				}
			}
		}
		else if ( value._id ) {
			finalDoc[key] = Object.assign( {} , oldDoc[key] , finalDoc[key] ) ;
		}
	}
	return finalDoc ;
}
