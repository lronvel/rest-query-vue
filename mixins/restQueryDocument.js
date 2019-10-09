import restQuery from '../mixins/restQuery.js' ;

export default {
	mixins: [restQuery] ,

	computed: {
		documentReady: function() {
			return this.ready && ( ! this.restQuery.document || !! this.document._id ) ;
		} ,
		document: function() {
			return this.$store.getters[`${this.restQuery.collection}/document`]( this.restQuery.document ) || {} ;
		}
	} ,

	methods: {
		fetch: function( force ) {
			if ( ! this.queryObject.id ) return null ;
			return this.$store.dispatch( `${this.restQuery.collection}/fetchDocument` , {
				force: force ,
				...this.queryObject
			} ) ;
		} ,
		create: async function( document ) {
			if ( this.restQuery.collection === 'Users' ) {
				document.login = document.email ;
				document.password = {
					hash: 'aaaaaaaaaaaaaa'
				} ;
			}
			if ( this.restQuery.collection === 'Items' ) {
				document._lastModified = new Date() ;
			}

			// if ( ! this.validate( document , 'patch' ) ) return false ;
			if ( ! this.validate( document , 'document' ) ) return false ;
			this.formDataHasChange = false ;

			if ( this.restQuery.collection === 'Users' ) {
				document.password = window.prompt( 'Enter Password' ) ;
			}

			var newDocument = await this.$store.dispatch( `${this.restQuery.collection}/create` , document ) ;
			this.navigationToDocument( this.restQuery.collection , newDocument.slugId ) ;
			return true ;
		} ,
		update: async function( document ) {
			if ( this.restQuery.collection === 'Users' ) {
				document.login = this.document.login ;
			}

			if ( ! this.validate( document , 'document' ) ) return false ;
			this.formDataHasChange = false ;

			await this.$store.dispatch( `${this.restQuery.collection}/update` , document ) ;

			return true ;
		} ,

		validate: function( document , type ) {
			this.formErrors = {} ;

			if ( type === 'patch' ) { type = 'validatePatch' ; }
			if ( type === 'document' ) { type = 'validateDocument' ; }

			var validate = this.$store.getters[`${this.restQuery.collection}/${type}`]( document ) ;

			if ( validate.validate ) {
				return true ;
			}

			for ( let i = 0 ; i < validate.errors.length ; i++ ) {
				this.formErrors[ validate.errors[ i ].path ] = validate.errors[ i ].message ;
			}
			console.log( validate.errors ) ;
			return false ;
		}
	}
} ;
