import { isEqual } from 'lodash-es' ;
import strings from '../lib/strings' ;


var formData = {} ;
export default formData ;

formData.documentToFormData = function( document , schema ) {
	var formData = {} ;

	for ( let [name , property] of Object.entries( schema.properties ) ) {
		if ( schema.collectionName === 'groups' ) {
			if ( name === 'users' || name === 'name' ) {
				formData[name] = this.propertyToFormData( document[name] , property ) ;
			}
		}

		if ( name === '_id' ) continue ;
		if ( ! document[name] ) continue ;
		if ( property.system ) continue ;
		if ( property.type === 'backLink' ) continue ;
		if ( ! property.tags.includes( 'content' ) ) continue ;

		formData[name] = this.propertyToFormData( document[name] , property ) ;
	}

	return formData ;
} ;

formData.propertyToFormData = function( documentProperty , schemaProperty ) {
	if ( ! documentProperty ) documentProperty = '' ;

	var propertyValue = '' ;
	if ( schemaProperty.default ) {
		propertyValue = schemaProperty.default ;
	}

	switch( schemaProperty.type ) {
		case 'link':
			propertyValue = documentProperty._id || documentProperty ;
			break ;
		case 'multiLink':
			if ( ! Array.isArray( documentProperty ) ) {
				propertyValue = [] ;
			}
			else {
				propertyValue = documentProperty.map( document => {
					return document._id || document ;
				} ) ;
			}

			break ;
		case 'date':
			propertyValue = strings.localeDate( documentProperty ) ;
			break ;
		default:
			propertyValue = documentProperty ;
	}

	return propertyValue ;
} ;
formData.formDataToPatch = function( incomingDocument , document ) {
	let patch = {} ;
	for ( let [name , value] of Object.entries( incomingDocument ) ) {
		if ( isEqual( value , document[name] ) ) continue ;
		patch[name] = value ;
	}
	return patch ;
} ;

// INFO: Doesn't flatten anything other than Objects
formData.flatten = function( document , basePath = null , globalObject = {} ) {
	for ( let [key , value] of Object.entries( document ) ) {
		let path = basePath ? `${basePath}.${key}` : key ;

		if ( value && value.constructor === Object ) {
			this.flatten( value , path , globalObject ) ;
			continue ;
		}

		globalObject[ path ] = value ;
	}

	return globalObject ;
} ;

// INFO: Doesn't unFlatten anything other than Objects
formData.unFlatten = function( document ) {
	var object = {} ;
	for ( let [key , value] of Object.entries( document ) ) {
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
	}

	return object ;
} ;
