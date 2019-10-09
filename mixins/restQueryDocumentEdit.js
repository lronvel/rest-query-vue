import restQueryDocument from '../mixins/restQueryDocument' ;
import urls from '../lib/urls.js' ;
import deepmerge from 'deepmerge' ;
import isEqual from 'lodash.isequal' ;

export default {
	mixins: [restQueryDocument] ,
	data: function() {
		return {
			unloadGuard: false ,
			formDataHasChange: false ,
			formData: {} ,
			formDataReady: false ,
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
			this.formDataReady = true ;
		} ,

		propertySet: function( key , value ) {
			if ( isEqual( this.formData[key] , value ) ) return ;

			console.log( `FormData set ${key}: ${value}` ) ;
			this.$set( this.formData , key , value ) ;
			this.formDataHasChange = true ;
		}
	}
} ;
