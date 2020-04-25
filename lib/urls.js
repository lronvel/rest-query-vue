import strings from '../lib/strings' ;

export default {
	pathToStore( path ) {
		path = strings.trim( path ) ;
		path = strings.trim( path , '/' ) ;
		if ( ! path ) return {
			collection: null ,
			document: null
		} ;

		path = path.split( '/' ) ;

		let collection = [] ;
		let document = [] ;
		let schemaName = '' ;

		let i = 0 ;
		for ( let pathPart of path ) {
			// Can be collection, frontendPage, should not be documentMethod
			if( ( ++i % 2 ) ) {
				let firstChar = pathPart[0] ;

				if ( pathPart.startsWith( '~~' ) ) {
					collection.push( { type: 'collection' , part: pathPart } ) ;
					schemaName = strings.capitalize( pathPart.slice( 2 ) ) ;
				}
				else if ( strings.isUpperCase( firstChar ) ) {
					if ( strings.isUpperCase( pathPart ) ) {
						collection.push( { type: 'documentMethod' , part: pathPart } ) ;
					}
					else {
						collection.push( { type: 'collection' , part: pathPart } ) ;
						schemaName = pathPart ;
					}
				}
			}
			// Can be document, frontendPage, should not be collectionMethod
			else {
				if ( strings.isLowerCase( pathPart ) ) {
					document.push( pathPart ) ;

					if ( pathPart.length === 23 ) {
						collection.push( { type: 'documentId' , part: pathPart } ) ;
					}
					else {
						collection.push( { type: 'documentSlug' , part: pathPart } ) ;
					}
				}
			}
		}

		if( ! collection.length ) {
			return {
				collection: null ,
				document: null ,
				schemaName: null
			} ;
		}

		while( collection.length && collection[collection.length - 1].type !== 'collection' ) {
			collection = collection.slice( 0 , - 1 ) ;
		}

		return {
			collection: collection.map( item => item.part ).join( '/' ) ,
			document: document.pop() ,
			schemaName: schemaName
		} ;
	} ,
	queryStringToQueryObject( queryString ) {
		var queryObject = {
			filters: {}
		} ;

		Object.keys( queryString ).forEach( key => {
			let value = queryString[key] ;

			switch( key ) {
				case 'limit':
				case 'skip':
				case 'search':
				case 'access':
					queryObject[key] = value ;
					break ;
				default:
					if ( key.startsWith( 'sort' ) ) {
						queryObject.sortName = key.split( '.' ).pop() ;
						queryObject.sortOrder = parseInt( value , 10 ) ;
					}
					else if ( key.startsWith( '.' ) ) {
						let filter = key.slice( 1 ) ;

						let [name , operator] = filter.split( '.' ) ;
						let value = queryString[key] ;

						if ( operator === '$in' ) {
							value = value.slice( 1 , - 1 ).split( ',' ) ;
						}
						queryObject.filters[ name ] = {
							name: name ,
							operator: operator || '$eq' ,
							value: value
						} ;
					}
					break ;
			}
		} ) ;
		return queryObject ;
	} ,
	queryObjectToQueryString( queryObject , hackDate ) {
		var queryString = [] ;

		if ( queryObject.filters ) {
			Object.keys( queryObject.filters ).forEach( name => {
				let filter = Object.assign( {} , queryObject.filters[name] ) ;
				if ( ! filter.value ) return ;

				if ( Array.isArray( filter.value ) ) {
					if ( ! filter.value.length ) return ;
					filter.value = `[${filter.value.join( ',' )}]` ;
				}

				if ( hackDate ) {
					if ( name.endsWith( '_dateLte' ) ) {
						let date = new Date( filter.value ) ;
						date.setDate( date.getDate() + 1 ) ;
						filter.value = date.toISOString() ;
						name = name.split( '_' )[0] ;
					}
					if ( name.endsWith( '_dateGte' ) ) {
						name = name.split( '_' )[0] ;
					}
				}

				queryString.push( `.${name}.${filter.operator}=${filter.value}` ) ;
			} ) ;
		}

		if ( queryObject.search ) queryString.push( `search=${queryObject.search}` ) ;
		if ( queryObject.populate && queryObject.populate.length ) queryString.push( `populate=[${queryObject.populate.join( ',' )}]` ) ;
		if ( queryObject.deepPopulate && queryObject.deepPopulate.populate.length ) queryString.push( `deepPopulate.${queryObject.deepPopulate.collection}=[${queryObject.deepPopulate.populate.join( ',' )}]` ) ;
		if ( queryObject.limit ) queryString.push( `limit=${queryObject.limit}` ) ;
		if ( queryObject.skip ) queryString.push( `skip=${queryObject.skip}` ) ;

		if ( queryObject.sortName ) queryString.push( `sort.${queryObject.sortName}=${queryObject.sortOrder}` ) ;
		if ( queryObject.access ) queryString.push( `access=${queryObject.access}` ) ;

		return queryString.join( '&' ) ;
	} ,

	queryStringToFormData( queryString ) {
		var formData = {} ;
		Object.keys( queryString ).forEach( key => {
			formData[key] = queryString[key] ;
		} ) ;
		return formData ;
	}
} ;
