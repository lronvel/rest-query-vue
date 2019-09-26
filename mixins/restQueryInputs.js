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
			throttledSearch: throttle( this.searchInCollection , 1000 , {
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
			this.filters = {} ;
			this.queryOptionsSet( 'search' , this.inputFilter ) ;
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
						localValue = this.$attrs.value.map( document => {
							if ( document._id ) {
								return document._id ;
							}

							return document ;
						} ) ;
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
		}
	}
} ;
