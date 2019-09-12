import restQuery from '../mixins/restQuery.js' ;
import urls from '../lib/urls.js' ;
import deepmerge from 'deepmerge' ;

export default {
	mixins: [restQuery] ,
	data: function() {
		return {
			unloadGuard: false ,
			formDataHasChange: false ,
			formData: {} ,
			formErrors: {}
		} ;
	} ,

	watch: {
		'$route.query': function() {
			this.initFormData() ;
		} ,
		documentReady: function() {
			this.initFormData() ;
		} ,
		formDataHasChange: function() {
			if ( ! this.unloadGuard ) return ;

			if ( this.formDataHasChange ) {
				window.addEventListener( 'beforeunload' , this.alertDocumentNotSaved ) ;
			}
			else {
				window.removeEventListener( 'beforeunload' , this.alertDocumentNotSaved ) ;
			}
		}
	} ,
	created() {
		this.initFormData() ;
	} ,

	beforeDestroy: function() {
		this.formDataHasChange = false ;
	} ,

	computed: {
		documentReady: function() {
			return this.ready && ( ! this.restQuery.document || !! this.document._id ) ;
		} ,
		document: function() {
			return this.$store.getters[`${this.restQuery.collection}/document`]( this.restQuery.document ) || {} ;
		}
	} ,

	beforeRouteLeave( to , from , next ) {
		if ( ! this.unloadGuard ) {
			next() ;
			return ;
		}

		var quit = false ;
		if ( this.formDataHasChange ) {
			quit = window.confirm( 'This page is asking you to confirm that you want to leave - data you have entered may not be saved.' ) ;
		}

		if ( ! this.formDataHasChange || quit ) {
			window.removeEventListener( 'beforeunload' , this.alertDocumentNotSaved ) ;
			next() ;
		}
	} ,

	methods: {
		alertDocumentNotSaved: function( event ) {
			event.preventDefault() ;
			event.returnValue = '' ;
		} ,
		initFormData: function() {
			if ( ! this.documentReady ) return ;

			this.formData = deepmerge.all( [
				{} ,
				this.defaultFormData || {} ,
				this.document ,
				urls.queryStringToFormData( this.$route.query )
			] ) ;
		} ,
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

			if ( ! this.validate( document , 'patch' ) ) return false ;
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
