import store from '@/store' ;
const nodeFetch = require( 'node-fetch' ) ;

const basePath = process.env.VUE_APP_API ;

function fetcher( path , options = {} ) {
	var headers = {
		'content-type': 'application/json'
	} ;

	if ( typeof Headers !== 'undefined' ) {
		headers = new Headers( headers ) ;
	}

	var requestOptions = {
		headers: headers ,
		mode: 'cors' ,
		method: 'GET'
	} ;

	if ( store.state.session.session && store.state.session.session.token ) {
		requestOptions.headers.append( 'x-token' , store.state.session.session.token ) ;
	}

	if ( options.type === 'file' ) {
		requestOptions.headers.set( 'content-type' , 'application/octet-stream' ) ;
		requestOptions.headers.set( 'content-disposition' , `attachment; filename="${options.body.name}"` ) ;
	}
	else if ( options.body && typeof options.body !== 'string' ) {
		options.body = JSON.stringify( options.body ) ;
	}

	if ( ! path.startsWith( '/' ) ) {
		path = '/' + path ;
	}

	return ( options.progress ? futch : nodeFetch )( `${basePath}${path}` , Object.assign( {} , requestOptions , options ) )
		.then( function( response ) {
			if ( response.ok || response.statusText === 'OK' ) {
				if ( response.status !== 204 ) {
					// console.log( `requestOk: ${path}` ) ;
					return response.json() ;
				}
				return {} ;
			}
			throw Error( `RestQuery Error: ${response.headers.get( 'X-Error-Message' )}` ) ;
		} )
		.then( function( data ) {
			return data ;
		} ) ;
	/* Prefer to Catch inside useland
		.catch( ( error ) => {
			console.log( `requestError: ${path}` ) ;
			console.log( error ) ;
		} ) ;
		*/
}

export default fetcher ;
window.fetcher = fetcher ;

function futch( path , options ) {
	return new Promise( function( resolve , reject ) {
		console.log( `it's a futch` ) ;

		var xhr = new XMLHttpRequest() ,
			response = {
				ok: false ,
				text: function() {
					return xhr.response ;
				} ,
				json: function() {
					return JSON.parse( xhr.response || null ) ;
				}
			} ;

		xhr.open( options.method , path ) ;

		for ( var header of options.headers.entries() ) {
			xhr.setRequestHeader( header[0] , header[1] ) ;
		}

		xhr.send( options.body ) ;

		xhr.onprogress = options.progress ;

		xhr.onload = function() {
			if ( this.status >= 200 && this.status < 300 ) {
				response.ok = true ;

				options.progress &&	options.progress( { loaded: 100 , total: 100 , finished: true } ) ;

				resolve( response ) ;
			}
		} ;
		xhr.onerror = function() {
			reject( {
				xhr: xhr ,
				status: this.status ,
				statusText: xhr.statusText
			} ) ;
		} ;
	} ) ;
}
