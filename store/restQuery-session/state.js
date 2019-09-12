export default function() {
	return {
		session: JSON.parse( localStorage.getItem( 'session' ) ) ,

		/*
	{
		userId: null ,
		token: null ,
		type: null ,
		agentId: null ,
		creationTime: null ,
		expirationTime: null ,
		duration: null ,
	}
	localCreationTime: null ,
	localExpirationTime: null ,
	*/

		profile: JSON.parse( localStorage.getItem( 'profile' ) ) ,
		regenerateTimeout: false ,

		connectionError: false ,

		createTokenSchema: {
			type: 'strictObject' ,
			properties: {
				type: {
					in: [
						'header' ,
						'cookie' ,
						'queryString' ,
						'urlAuth' ,
						'basicAuth' ,
						'web'
					]
				} ,
				agentId: { type: 'hex' , length: 10 , default: '0000000000' } ,
				login: { type: 'string' } ,
				password: { type: 'string' } ,
				duration: { optional: true , type: 'integer' }
			}
		}
	} ;
}
