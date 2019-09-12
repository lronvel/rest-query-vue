import fetcher from '../../lib/fetcher.js' ;
import urls from '../../lib/urls.js' ;

export default {
	fetchSchema( context ) {
		return fetcher( `${context.state.path}/SCHEMA` )
			.then( schema => {
				context.commit( 'setSchema' , schema ) ;
				return schema ;
			} )
			.catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	fetchDocument( context , queryObject = {} ) {
		var url = [`${context.state.path}/${queryObject.id}`] ;

		var queryString = urls.queryObjectToQueryString( queryObject ) ;
		if ( queryString ) url.push( queryString ) ;

		return fetcher( url.join( '?' ) )
			.then( document => {
				context.commit( 'setDocument' , document ) ;
				return document ;
			} )
			.catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	fetchCollection( context , queryObject = {} ) {
		var url = [context.state.path] ;

		var queryString = urls.queryObjectToQueryString( queryObject ) ;
		if ( queryString ) url.push( queryString ) ;

		var collectionMeta = context.state.collections[queryString] ;
		var status = 'fetching' ;

		if ( collectionMeta ) {
			if ( collectionMeta.status === 'fetching' ) return false ;
			if ( ! queryObject.force && new Date() - collectionMeta.lastFetch < 10000 ) return false ;

			status = collectionMeta.status === 'fetched' ? 'refreshing' : 'fetching' ;
		}

		context.commit( 'setCollectionStatus' , { queryString , status: status } ) ;

		return fetcher( url.join( '?' ) )
			.then( collection => {
				context.commit( 'setCollection' , { queryString , collection } ) ;
				return collection ;
			} )
			.catch( error => {
				console.log( error ) ;
				context.commit( 'setCollectionStatus' , { queryString , status: 'error' } ) ;
			} ) ;
	} ,

	fetchNext( context , queryObject ) {
		queryObject.skip = queryObject.skip || 0 + queryObject.limit ;
		return context.dispatch( 'fetchCollection' , queryObject ) ;
	} ,

	create( context , document ) {
		document = unFlatten( document ) ;

		return fetcher( `${context.state.path}` , {
			method: 'POST' ,
			body: document
		} )
			.then( response => {
				context.commit( 'create' , { id: response.id , document: document } ) ;
				return response ;
			} ).catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	createIfNotExist( context , document ) {
		return fetcher( `${context.state.path}?.name.$eq=${document.name}` )
			.then( response => {
				context.dispatch( `create` , document ) ;
				return response ;
			} )
			.catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	update( context , document ) {
		// doormen.patch.report( context.state.schema , document ) ;

		return fetcher( `${context.state.path}/${document._id}` , {
			method: 'PATCH' ,
			body: flatten( document )
		} )
			.then( () => {
				context.commit( 'setDocument' , document ) ;
				return true ;
			} )
			.catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	delete( context , id ) {
		return fetcher( `${context.state.path}/${id}` , {
			method: 'DELETE'
		} )
			.then( () => {
				context.commit( 'deleteDocument' , id ) ;
				return true ;
			} )
			.catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	collectionMethod( context , options = {} ) {
		var url = [`${context.state.path}/${options.method}`] ;
		if ( options.query ) url.push( options.query ) ;

		var fetcherOptions = {
			method: 'GET'
		} ;

		if ( options.body ) {
			fetcherOptions.method = 'POST' ;
			fetcherOptions.body = options.body ;
		}
		return fetcher( url.join( '?' ) , fetcherOptions ) ;
	} ,
	documentMethod( context , options = {} ) {
		var url = [`${context.state.path}/${options.id}/${options.method}`] ;
		if ( options.query ) url.push( options.query ) ;

		var fetcherOptions = {
			method: 'GET'
		} ;

		if ( options.body ) {
			fetcherOptions.method = 'POST' ;
			fetcherOptions.body = options.body ;
		}
		return fetcher( url.join( '?' ) , fetcherOptions ) ;
	}
} ;


// INFO: Doesn't flatten anything other than Objects
function flatten( object , basePath = null , globalObject = {} ) {
	Object.entries( object ).forEach( function( [key , value] ) {
		let path = basePath ? `${basePath}.${key}` : key ;

		if ( value && value.constructor === Object ) {
			flatten( value , path , globalObject ) ;
			return ;
		}

		globalObject[ path ] = value ;
	} ) ;
	return globalObject ;
}

// INFO: Doesn't unFlatten anything other than Objects
function unFlatten( data ) {
	var object = {} ;
	Object.entries( data ).forEach( function( [key , value] ) {
		let keys = key.split( '.' ) ;

		let treeObject = object ;
		for ( let i = 0 ; i < keys.length ; i++ ) {
			if ( i === keys.length - 1 ) {
				treeObject[ keys[i] ] = value || null ;
			}
			else if ( ! treeObject[ keys[i] ] ) {
				treeObject[ keys[i] ] = {} ;
			}

			treeObject = treeObject[ keys[i] ] ;
		}
	} ) ;
	return object ;
}
