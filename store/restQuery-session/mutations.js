export default {
	setRegenerateTimeout( state , value ) {
		state.regenerateTimeout = value ;
	} ,
	setConnectionError( state , value ) {
		state.connectionError = value || null ;
	} ,
	setSession( state , values ) {
		state.session = values ;
		localStorage.setItem( 'session' , JSON.stringify( values ) ) ;
	} ,
	setProfile( state , values ) {
		state.profile = values ;
		localStorage.setItem( 'profile' , JSON.stringify( values ) ) ;
	}
} ;
