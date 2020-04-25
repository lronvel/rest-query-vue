import restQuery from '../mixins/restQuery' ;
import urls from '../lib/urls' ;
import { cloneDeep } from 'lodash-es' ;

export default {
	mixins: [restQuery] ,

	computed: {
		document: function() {
			return this.$store.getters[`${this.restQuery.collection}/document`]( this.restQuery.document ) || {} ;
		} ,
		queryObject: function() {
			let queryObject = {} ;

			if ( this.restQuery.document ) queryObject.id = this.restQuery.document ;

			if ( this.populate ) queryObject.populate = this.populate ;
			if ( this.deepPopulate ) queryObject.deepPopulate = this.deepPopulate ;
			if ( this.access ) queryObject.access = this.access ;

			return queryObject ;
		}
	} ,

	/*
	created() {
		// FIXME: Not really the most elegant way...
		if ( this.cachedDocument ) {
			var queryString = urls.queryObjectToQueryString( this.queryObject ) ;
			this.$store.commit( `${this.restQuery.collection}/setDocument` , { queryString , data: this.cachedDocument } ) ;
			this.$store.commit( `${this.restQuery.collection}/setMeta` , { queryString , status: 'fetched' } ) ;
		}
		return Promise.resolve() ;
	} ,
	*/
	methods: {
		fetch: function() {
			if ( ! this.queryObject.id ) return null ;
			return this.$store.dispatch( `${this.restQuery.collection}/fetchDocument` , this.queryObject ) ;
		} ,

		create: async function( incomingDocument ) {
			var document = cloneDeep( incomingDocument ) ;

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
