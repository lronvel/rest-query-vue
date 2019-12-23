import { isEqual , merge } from 'lodash-es' ;
import restQueryDocument from '../mixins/restQueryDocument' ;
import urls from '../lib/urls' ;
import formData from '../lib/formData' ;

export default {
	mixins: [restQueryDocument] ,
	data: function() {
		return {
			unloadGuard: false ,
			formDataHasChange: false ,
			formData: {} ,
			originalFormData: {} ,
			formDataReady: false ,
			formErrors: {}
		} ;
	} ,

	computed: {
		validateDocument: function() {
			return this.validate( this.formData , 'document' ) ;
		} ,
		validatePatch: function() {
			return this.validate( this.formData , 'patch' ) ;
		}
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


			this.formData = merge( {} ,
				this.defaultFormData || {} ,
				formData.documentToFormData( this.document , this.schema ) ,
				urls.queryStringToFormData( this.$route.query )
			) ;
			this.originalFormData = merge( {} , this.formData ) ;

			this.formDataReady = true ;
		} ,

		isContentProperty: function( property , name ) {
			if ( this.schema.collectionName === 'groups' ) {
				if ( name === 'users' || name === 'name' ) return true ;
				return false ;
			}
			if ( property.tags.includes( 'content' ) || property.tags.includes( 'system-content' ) ) {
				if ( property.type !== 'backLink' && property.inputHint !== 'hidden' ) {
					return true ;
				}
			}
			return false ;
			// return ( property.system !== true && property.inputHint !== 'hidden' && property.type !== 'backLink' ) ;
		} ,

		propertySet: function( key , value ) {
			if ( isEqual( this.formData[key] , value ) ) return ;

			console.log( `FormData ${key} was: ${this.formData[key]}` ) ;
			console.log( `FormData ${key} set: ${value}` ) ;

			this.$set( this.formData , key , value ) ;

			this.formDataHasChange = ! isEqual( this.formData , this.originalFormData ) ;
		} ,
		propertyAppend: function( key , values ) {
			if ( ! Array.isArray( this.formData[key] ) ) return ;
			var data = Array.from( this.formData[key] ) ;
			for( var value of values ) {
				if ( this.formData[key].includes( value ) ) continue ;
				if ( this.formData[key].some( link => link._id === value ) ) continue ;

				data.push( value ) ;
			}
			this.propertySet( key , data ) ;
		}
	}
} ;
