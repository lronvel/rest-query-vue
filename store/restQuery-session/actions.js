import doormen from '../../lib/doormen' ;

export default {
	connect: async function( context , data ) {
		data = Object.assign( {
			type: 'header' ,
			agentId: '0000000000'
		} , data ) ;

		var report = doormen.report( context.state.createTokenSchema , data ) ;

		if ( ! report.validate ) {
			context.commit( 'setConnectionError' , true ) ;
			console.log( report ) ;
			return false ;
		}
		context.dispatch( 'reset' ) ;

		return this._vm.$fetch( '/Users/CREATE-TOKEN' , { method: 'POST' , body: data } )
			.then( request => {
				console.log( 'Logged in!' ) ;

				var session = Object.assign( {
					login: data.login
				} , request ) ;

				context.commit( 'setSession' , session ) ;

				context.dispatch( 'getProfile' ) ;
				context.dispatch( 'scheduleRegenerate' ) ;

				return true ;
			} )
			.catch( error => {
				console.log( 'CREATE TOKEN ERROR' ) ;
				console.log( error ) ;
				context.dispatch( 'reset' ) ;
				context.commit( 'setConnectionError' , true ) ;
				return false ;
			} ) ;

	} ,

	regenerate: async function( context ) {
		if ( context.getters.isTokenExpired() ) {
			context.dispatch( 'reset' ) ;
			return false ;
		}

		return this._vm.$fetch( '/Users/REGENERATE-TOKEN' , { method: 'POST' } )
			.then( request => {
				var session = Object.assign( {} , context.state.session , request ) ;

				context.commit( 'setSession' , session ) ;
				context.dispatch( 'scheduleRegenerate' ) ;

				return true ;
			} )
			.catch( error => {
				console.log( error ) ;
				context.dispatch( 'reset' ) ;
				return false ;
			} ) ;
	} ,

	disconnect: function( context ) {
		if ( context.getters.isTokenExpired() ) {
			context.dispatch( 'reset' ) ;
			return true ;
		}

		return this._vm.$fetch( '/Users/REVOKE-TOKEN' , { method: 'POST' } )
			.then( () => {
				return true ;
			} )
			.catch( error => {
				console.log( error ) ;
				return false ;
			} )
			.finally( () => {
				context.dispatch( 'reset' ) ;
			} ) ;
	} ,

	init: function( context ) {
		window.addEventListener( 'storage' , function( event ) {
			if ( event.key === 'session' ) {
				context.commit( 'setSession' , JSON.parse( event.newValue ) ) ;
				context.dispatch( 'scheduleRegenerate' ) ;
			}
		} ) ;

		setInterval( () => {
			context.dispatch( 'localCheckToken' ) ;
		} , 10000 ) ;

		context.dispatch( 'checkToken' ) ;
	} ,

	localCheckToken: function( context ) {
		if ( context.getters.isTokenExpired() ) {
			context.dispatch( 'reset' ) ;
		}
	} ,
	checkToken: function( context ) {
		if ( context.getters.isTokenExpired() ) {
			context.dispatch( 'reset' ) ;
			return false ;
		}

		return this._vm.$fetch( '/Users/CHECK-TOKEN' , { method: 'POST' } )
			.then( () => {
				context.dispatch( 'scheduleRegenerate' ) ;
				return true ;
			} )
			.catch( error => {
				console.log( error ) ;
				console.log( 'Session is not Ok.' ) ;
				context.dispatch( 'reset' ) ;
				return false ;
			} ) ;
	} ,

	getProfile: function( context ) {
		if ( context.getters.isTokenExpired() ) {
			context.dispatch( 'reset' ) ;
			return false ;
		}

		return this._vm.$fetch( `/Users/${context.state.session.userId}` , { method: 'GET' } )
			.then( request => {
				context.commit( 'setProfile' , request ) ;
				return request ;
			} )
			.catch( error => {
				console.log( error ) ;
				console.log( 'Session is not Ok.' ) ;
				// FIXME
				// context.dispatch( 'reset' ) ;
				return false ;
			} ) ;
	} ,

	reset: function( context ) {
		context.dispatch( 'unscheduleRegenerate' ) ;
		context.commit( 'setSession' , null ) ;
		context.commit( 'setProfile' , null ) ;
		context.commit( 'setConnectionError' , null ) ;
		context.commit( 'setRegenerateTimeout' , null ) ;
	} ,

	scheduleRegenerate: function( context ) {
		if ( context.getters.isTokenExpired() ) {
			context.dispatch( 'reset' ) ;
			return ;
		}

		context.dispatch( 'unscheduleRegenerate' ) ;

		var expireIn = context.getters.getExpireTime() ;

		var expireInPadded = expireIn - ( 60000 - ( Math.random() * 60000 ) ) ;

		console.log( `regenerateToken in ${( expireIn / 1000 / 60 )} minutes` ) ;

		var regenerateTimeout = setTimeout( () => {
			context.dispatch( 'regenerate' ) ;
		} , Math.max( 0 , expireInPadded ) ) ;

		context.commit( 'setRegenerateTimeout' , regenerateTimeout ) ;
	} ,

	unscheduleRegenerate: function( context ) {
		clearTimeout( context.state.regenerateTimeout ) ;
		context.commit( 'setRegenerateTimeout' , null ) ;
	}
} ;
