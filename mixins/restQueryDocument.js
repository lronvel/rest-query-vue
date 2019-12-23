import restQuery from '../mixins/restQuery' ;
import { cloneDeep } from 'lodash-es' ;
export default {
	mixins: [restQuery] ,

	computed: {
		hasFecthed: function() {
			return this.documentReady ;
		} ,
		documentReady: function() {
			// Trigger ready when store is ready
			// and, if we have a document, when the document is ready
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
		create: async function( incomingDocument ) {
			var document = cloneDeep( incomingDocument ) ;

			/* FIXME: TO REMOVE
			if ( this.restQuery.collection === 'Users' ) {
				document.login = document.email ;
				document.password = {
					hash: 'aaaaaaaaaaaaaa'
				} ;
			}
			*/

			if ( ! this.validate( document , 'document' ) ) return false ;
			this.formDataHasChange = false ;

			if ( this.restQuery.collection === 'Users' ) {
				document.password = window.prompt( 'Enter Password' ) ;
			}

			var newDocument = await this.$store.dispatch( `${this.restQuery.collection}/create` , document ) ;
			this.navigationToDocument( this.restQuery.collection , newDocument.slugId ) ;
			return true ;
		} ,
		update: async function( incomingDocument ) {
			var document = cloneDeep( incomingDocument ) ;

			/* FIXME: TO REMOVE
			if ( this.restQuery.collection === 'Users' ) {
				document.login = this.document.login ;
			}
			*/
			if ( ! this.validate( document , 'patch' ) ) return false ;
			this.formDataHasChange = false ;

			await this.$store.dispatch( `${this.restQuery.collection}/update` , {
				id: this.document._id ,
				body: document
			} ) ;

			return true ;
		} ,
		validate: function( document , type ) {
			this.formErrors = {} ;

			if ( type === 'patch' ) { type = 'validatePatch' ; }
			if ( type === 'document' ) { type = 'validateDocument' ; }

			var validate = this.$store.getters[`${this.restQuery.collection}/${type}`]( document ) ;
			console.log( validate ) ;
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
