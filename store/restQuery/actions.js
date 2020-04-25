import urls from '../../lib/urls' ;
import formData from '../../lib/formData' ;

var requests = {} ;

export default {
	fetchSchema( context ) {
		return this._vm.$fetch( `${context.state.path}/SCHEMA` )
			.then( schema => {
				context.commit( 'setSchema' , schema ) ;
				return schema ;
			} )
			.catch( error => {
				console.log( error ) ;
			} )
			.finally( ()=> {
			} ) ;
	} ,

	fetch( context , { type , queryObject } ) {
		var url = context.state.path ;
		var queryString = urls.queryObjectToQueryString( queryObject , true ) ;

		if ( queryObject.id ) url += `/${queryObject.id}` ;
		if ( queryString ) url += `?${queryString}` ;

		var meta = context.state.meta[url] ;
		var status = 'fetching' ;

		if ( meta ) {
			var isExpired = new Date() - new Date( meta.lastFetch ) < context.rootState.config.FETCH_CACHE_TIME * 1000 ;

			if ( meta.status === 'fetching' || meta.status === 'refreshing' ) {
				return requests[url] ;
			}
			// meta.lastFetch need to be instanciated as date in case state is from server
			// and meta.lastFetch is a string
			else if ( ! queryObject.forceFetch && isExpired ) {
				if ( queryObject.id ) {
					return Promise.resolve( context.state.documents[queryObject.id] ) ;
				}
				return Promise.resolve( context.state.collections[url] ) ;
			}

			status = meta.status === 'fetched' ? 'refreshing' : 'fetching' ;
		}

		context.commit( 'setMeta' , { url , status: status } ) ;

		requests[url] = this._vm.$fetch( url )
			.then( data => {
				context.commit( type , { url , data } ) ;
				context.commit( 'setMeta' , { url , status: 'fetched' } ) ;
				return data ;
			} )
			.catch( error => {
				context.commit( 'setMeta' , { url , status: 'error' } ) ;
				console.log( error ) ;
			} ).finally( () => {
				delete requests[url] ;
			} ) ;


		return requests[url] ;
	} ,

	fetchDocument( context , queryObject = {} ) {
		return context.dispatch( 'fetch' , {
			type: 'mergeDocument' ,
			queryObject
		} ) ;
	} ,

	fetchCollection( context , queryObject = {} ) {
		return context.dispatch( 'fetch' , {
			type: 'setCollection' ,
			queryObject
		} ) ;
	} ,

	fetchNext( context , queryObject ) {
		queryObject.skip = queryObject.skip || 0 + queryObject.limit ;
		return context.dispatch( 'fetchCollection' , queryObject ) ;
	} ,

	create( context , document ) {
		document = formData.unFlatten( document ) ;

		return this._vm.$fetch( `${context.state.path}` , {
			method: 'POST' ,
			body: document
		} ).then( response => {
			context.dispatch( 'fetchDocument' , { id: response.id } ) ;
			return response ;
		} ).catch( error => {
			console.log( error ) ;
		} ) ;
	} ,

	createIfNotExist( context , document ) {
		alert( 'Do not use this function without review' ) ;

		return this._vm.$fetch( `${context.state.path}?.name.$eq=${document.name}` )
			.then( response => {
				context.dispatch( 'create' , document ) ;
				return response ;
			} )
			.catch( error => {
				console.log( error ) ;
			} ) ;
	} ,

	update( context , patch ) {
		// doormen.patch.report( context.state.schema , document ) ;

		return this._vm.$fetch( `${context.state.path}/${patch.id}` , {
			method: 'PATCH' ,
			body: formData.flatten( patch.body )
		} ).then( () => {
			return context.dispatch( 'fetchDocument' , { id: patch.id , forceFetch: true } ) ;
		} ).catch( error => {
			console.log( error ) ;
		} ) ;
	} ,

	delete( context , id ) {
		return this._vm.$fetch( `${context.state.path}/${id}` , {
			method: 'DELETE'
		} ).then( () => {
			context.commit( 'deleteDocument' , id ) ;
			return true ;
		} ).catch( error => {
			console.log( error ) ;
		} ) ;
	} ,

	collectionMethod( context , options = {} ) {
		// FIXME:
		/* USE POST INSTEAD OF GET CAUSE GET GET CACHED */
		/* MAYBE ADD API */
		var url = [`${context.state.path}/${options.method}`] ;
		if ( options.query ) url.push( options.query ) ;

		var fetcherOptions = {
			method: 'POST'
		} ;

		if ( options.body ) {
			fetcherOptions.method = 'POST' ;
			fetcherOptions.body = options.body ;
		}
		return this._vm.$fetch( url.join( '?' ) , fetcherOptions ) ;
	} ,
	documentMethod( context , options = {} ) {
		// FIXME:
		/* USE POST INSTEAD OF GET CAUSE GET GET CACHED */
		/* MAYBE ADD API */
		var url = [`${context.state.path}/${options.id}/${options.method}`] ;
		if ( options.query ) url.push( options.query ) ;

		var fetcherOptions = {
			method: 'POST'
		} ;

		if ( options.body ) {
			fetcherOptions.method = 'POST' ;
			fetcherOptions.body = options.body ;
		}
		return this._vm.$fetch( url.join( '?' ) , fetcherOptions ) ;
	}
} ;
