import { isEqual , throttle } from 'lodash-es' ;
import formData from '../lib/formData' ;

export default {
	inheritAttrs: false ,
	props: {
		name: {
			type: String ,
			default: ''
		} ,
		property: {
			type: Object ,
			default: function() { return {} ; }
		} ,
		schemaName: {
			type: String ,
			default: ''
		}
	} ,
	data: function() {
		return {
			disabled: this.$attrs.disabled || ( this.property.tags && this.property.tags.includes( 'system-content' ) ) ,

			throttledSearch: throttle( this.searchInCollection , 500 , {
				maxWait: 500 ,
				leading: false ,
				trailing: true
			} ) ,
			throttledInput: throttle( this.input , 500 , {
				// maxWait: 300 ,
				leading: false ,
				trailing: true
			} ) ,

			...this.populateLocalData()
		} ;
	} ,
	watch: {
		'localValue': {
			handler: function() {
				this.throttledInput() ;
			} ,
			deep: true
		} ,
		'$attrs.value': function() {
			var $attrsValue = this.populateLocalData().localValue ;
			if ( ! isEqual( this.localValue , $attrsValue ) ) {
				this.localValue = $attrsValue ;
			}
		} ,
		'inputFilter': function() {
			// this.search() ;
			this.throttledSearch() ;
		}
	} ,
	computed: {
		emitValue: function() {
			return this.localValue ;
		}
	} ,
	methods: {
		searchInCollection: function() {
			// this.filters = {} ;
			this.searchSet( this.inputFilter ) ;
		} ,
		input: function() {
			console.log( `Input ${this.name} emit: ${this.emitValue}` ) ;
			this.$emit( 'input' , this.name , this.emitValue ) ;
		} ,
		populateLocalData: function() {
			return {
				localValue: formData.propertyToFormData( this.$attrs.value , this.property ) ,
				inputFilter: ''
			} ;
		}
	}
} ;
