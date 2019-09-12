export default {
	setSchema( state , values ) {
		state.schema = Object.freeze( values ) ;
		state.ready = true ;
	} ,
	setCollectionStatus( state , { queryString , status } ) {
		// status = error | fetching | fetched | refreshing
		var collection = Object.assign( {} , state.collections[ queryString ] || {} , { status: status } ) ;

		state.collections = { ...state.collections , [queryString]: collection } ;
	} ,
	setCollection( state , { queryString , collection } ) {
		var stateCollection = [] ;

		var newDocuments = {} , newDocumentsSlugs = {} ;
		for ( let document of collection ) {
			stateCollection.push( document._id ) ;
			newDocuments[document._id] = document ;
			newDocumentsSlugs[document.slugId] = document._id ;
		}

		state.documentsSlugs = { ...state.documentsSlugs , ...newDocumentsSlugs } ;
		state.documents = { ...state.documents , ...newDocuments } ;

		state.collections = { ...state.collections ,
			[queryString]: {
				status: 'fetched' ,
				lastFetch: new Date() ,
				data: stateCollection
			} } ;
	} ,

	setDocument( state , document ) {
		state.documentsSlugs = { ...state.documentsSlugs , [document.slugId]: document._id } ;
		state.documents = { ...state.documents , [document._id]: document } ;
	} ,

	deleteDocument( state , id ) {
		delete state.documents[id] ;
		state.documents = { ...state.documents } ;
	}
} ;
