import strings from '../lib/strings.js' ;
import isEqual from 'lodash.isequal' ;
import throttle from 'lodash.throttle' ;

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
		}
	} ,
	data: function() {
		return {
			throttleOptions: {
				// maxWait: 300 ,
				leading: false ,
				trailing: true
			} ,
			throttleTime: 500 ,

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
			var $attrValue = this.populateLocalData().localValue ;
			if ( ! isEqual( this.localValue , $attrValue ) ) {
				this.localValue = $attrValue ;
			}
		} ,
		'inputFilter': function() {
			this.filters = {} ;
			this.queryOptionsSet( 'search' , this.inputFilter ) ;
		}
	} ,
	computed: {
		emitValue: function() {
			return this.localValue ;
		}
	} ,
	methods: {
		throttledInput: function() {
			if ( ! this.throttledInputFunc ) {
				this.throttledInputFunc = throttle( this.input , this.throttleTime , this.throttleOptions ) ;
			}
			return this.throttledInputFunc() ;
		} ,
		input: function() {
			this.$emit( 'input' , this.name , this.emitValue ) ;
		} ,
		populateLocalData: function() {
			let localValue ;

			if ( this.$attrs.value ) {
				if ( this.property.type === 'link' ) {
					if ( typeof this.$attrs.value === 'string' ) {
						localValue = this.$attrs.value ;
					}
					else {
						localValue = this.$attrs.value._id ;
					}
				}
				else if ( this.property.type === 'multiLink' ) {
					if ( Array.isArray( this.$attrs.value ) ) {
						localValue = this.$attrs.value.map( document => document._id ) ;
					}
					else {
						localValue = this.$attrs.value ;
					}
				}
				else if ( this.property.type === 'date' ) {
					localValue = strings.localeDate( this.$attrs.value ) ;
				}
				else {
					localValue = this.$attrs.value ;
				}
			}
			else {
				if ( this.property.type === 'multiLink' ) {
					localValue = [] ;
				}
			}

			return {
				localValue: localValue ,
				inputFilter: ''
			} ;
		} ,
		isVisible: function( text ) {
			return {
				filtered: ! text.toLowerCase().includes( this.inputFilter.toLowerCase() )
			} ;
		}
	}
} ;
