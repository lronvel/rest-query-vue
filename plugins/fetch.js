const fetchLib = require( 'node-fetch' ) ;

export default {
	install( Vue , pluginOptions ) {
		Vue.prototype.$fetch = function( path , options = {} ) {
			var domain = options.domain ? options.domain : process.env.VUE_APP_API ;

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

			// console.log( pluginOptions.store.getters.connected ) ;
			if ( pluginOptions.store.state.session && pluginOptions.store.state.session.session && pluginOptions.store.state.session.session.token ) {
				requestOptions.headers.append( 'x-token' , pluginOptions.store.state.session.session.token ) ;
			}

			if ( options.type === 'file' ) {
				requestOptions.headers.set( 'content-type' , 'application/octet-stream' ) ;
				try {
					requestOptions.headers.set( 'content-disposition' , `attachment; filename="${options.body.name}"; filename*=utf-8''${encodeURI( options.body.name )}` ) ;
				}
				catch( e ) {
					let name = 'unknow.' + options.body.name.split( '.' ).pop() ;
					requestOptions.headers.set( 'content-disposition' , `attachment; filename="${name}"; filename*=utf-8''${encodeURI( options.body.name )}` ) ;
				}
			}
			else if ( options.body && typeof options.body !== 'string' ) {
				options.body = JSON.stringify( options.body ) ;
			}

			if ( ! path.startsWith( '/' ) ) {
				path = '/' + path ;
			}
			path = path.split( '?' ) ;
			path[0] = encodeURI( path[0] ) ;
			path = path.join( '?' ) ;


			var time = Date.now() ;
			return ( options.progress ? classicXHR : fetchLib )( `${domain}${path}` , Object.assign( {} , requestOptions , options ) )
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
					/*
					let timeDiff = Date.now() - time ;
					if ( timeDiff > 200 ) {
						console.log( `${timeDiff}: ${path}` ) ;
					}
					*/

					return data ;
				} )
				.catch( error => {
					console.log( error ) ;
					console.log( `requestError: ${path}` ) ;
					console.log( error ) ;
					throw Error( error ) ;
				} ) ;

		} ;
	}
} ;

function classicXHR( path , options ) {
	return new Promise( function( resolve , reject ) {
		console.log( `classicXHR mode` ) ;

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


		xhr.upload.addEventListener( 'progress' , options.progress ) ;

		xhr.upload.addEventListener( 'load' , function( event ) {
			response = {
				...response ,

				ok: true ,
				status: xhr.status ,
				statusText: xhr.statusText
			} ;

			if ( options.progress ) {
				options.progress( { loaded: event.loaded , total: event.total , finished: true } ) ;
			}
			resolve( response ) ;
		} ) ;

		xhr.upload.addEventListener( 'error' , function() {
			response = {
				...response ,

				ok: true ,
				status: xhr.status ,
				statusText: xhr.statusText
			} ;
			reject( response ) ;
		} ) ;

		xhr.open( options.method , path ) ;

		for ( var header of options.headers.entries() ) {
			xhr.setRequestHeader( header[0] , header[1] ) ;
		}

		xhr.send( options.body ) ;
	} ) ;
}
