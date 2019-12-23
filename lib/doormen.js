import doormen from 'doormen/lib/browser' ;

export default doormen ;

doormen.setClientMode( true ) ;

function checkObjectId( data ) {
	if ( data && typeof data === 'object' && ( data.constructor.name === 'ObjectID' || data.constructor.name === 'ObjectId' ) ) {
		return true ;
	}

	return typeof data === 'string' && ( data === '/' || ( data.length === 24 && /^[0-9a-f]{24}$/.test( data ) ) ) ;
}



function checkLink( data , schema ) {
	//console.log( "checkLink:" , data ) ;
	if ( data === undefined || data === null ) { return true ; }
	if ( typeof data !== 'object' ) { return false ; }
	if ( ! schema.anyCollection ) { return checkObjectId( data._id ) ; }
	return data._collection && typeof data._collection === 'string' && checkObjectId( data._id ) ;
}



function checkRequiredLink( data ) {
	//console.log( "checkRequiredLink:" , data ) ;
	if ( ! data ) { return false ; }
	if ( typeof data !== 'object' ) { return false ; }
	return checkObjectId( data._id ) ;
}



function checkMultiLink( data ) {
	// Now it's done using:   of: { type: 'link' } and constraints, as override, see "typeOverrides" in Collection.js
	return Array.isArray( data ) ;
}



var backLinkSchema = {
	type: 'object' ,
	optional: true ,
	properties: {
		batch: {
			optional: true ,
			type: 'array' ,
			of: { type: 'object' }
		}
	}
} ;


doormen.extendTypeCheckers( {
	'objectId': checkObjectId ,
	'link': checkLink ,
	'requiredLink': checkRequiredLink ,
	'multiLink': checkMultiLink ,
	'backLink': data => {
		try {
			doormen( backLinkSchema , data ) ;
			return true ;
		}
		catch ( error ) {
			return false ;
		}
	}
} ) ;



// Allow one to pass the whole linked target object
function toObjectId( data ) {
	return data ;
}



// Allow one to pass the whole linked target object
function toLink( data ) {
	if ( data && typeof data === 'object' ) {
		if ( data.constructor.name === 'ObjectID' || data.constructor.name === 'ObjectId' ) {
			return { _id: data } ;
		}

		data._id = toObjectId( data._id ) ;
		// /!\ Remove extra properties? /!\
		// Proxy part should allow it (it is a document once populated), raw part shouldn't
	}
	else if ( typeof data === 'string' ) {
		data = { _id: data } ;
	}

	return data ;
}



// Allow one to pass the whole array (batch) of linked target object
function toMultiLink( data ) {
	// Now it's done using:   of: { type: 'link' , sanitize: 'toLink' } and constraints
	if ( ! data ) { return [] ; }
	if ( ! Array.isArray( data ) ) { return [data] ; }
	return data ;
}



function toBackLink( data ) {
	if ( ! data || typeof data !== 'object' ) {
		return {} ;
	}

	if ( Array.isArray( data ) ) { data = { batch: data } ; }

	return data ;
}



doormen.extendSanitizers( {
	'toObjectId': toObjectId ,
	'toLink': toLink ,
	'toMultiLink': toMultiLink ,
	'toBackLink': toBackLink ,
	'toBackMultiLink': toBackLink
} ) ;
