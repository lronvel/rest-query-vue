export default {
	getUserId: state => {
		return state.session.userId ;
	} ,
	connected: state => {
		return state.session ;
	} ,
	isTokenExpired: ( state , getters ) => () => {
		if (
			! state.session ||
			! state.session.expirationTime ||
			getters.getExpireTime() < 0
		) {
			console.log( 'localCheckToken: Expired' ) ;
			return true ;
		}
		return false ;
	} ,
	getExpireTime: state => () => {
		return new Date( state.session.expirationTime ) - Date.now() ;
	}
} ;
