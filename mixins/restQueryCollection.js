import restQuery from '../mixins/restQuery' ;
import urls from '../lib/urls' ;
import strings from '../lib/strings' ;
import { cloneDeep , isEqual } from 'lodash-es' ;

export default {
	mixins: [restQuery] ,

	data: function() {
		return {
			limit: this.$attrs.limit || 30 ,
			skip: this.$attrs.skip || 0 ,

			sortOrder: this.$attrs.sortOrder || - 1 ,
			sortName: this.$attrs.sortName || null ,
			search: this.$attrs.search || null ,

			filters: {} ,
			getUrlFilters: false
		} ;
	} ,
	watch: {
		'$route.query': function() {
			this.updateFiltersByQuery() ;
		} ,
		'queryObject': {
			handler: function() {
				if ( this.getUrlFilters ) {
					var filters = this.$route.path + '?' + urls.queryObjectToQueryString( {
						limit: this.limit ,
						skip: this.skip ,
						filters: this.filters ,
						search: this.search ,
						sortName: this.sortName ,
						sortOrder: this.sortOrder
					} ) ;

					filters = strings.trimEnd( filters , '?' ) ;
					if ( decodeURIComponent( this.$route.fullPath ) !== filters ) {
						this.$router.replace( filters ) ;
					}
				}

				this.fetch() ;
			} ,
			deep: true
		}
	} ,
	created() {
		this.updateFiltersByQuery() ;
	} ,

	computed: {
		collection: function() {
			return this.$store.getters[`${this.restQuery.collection}/collection`]( this.queryObject ) ;
		} ,
		hasFilters: function() {
			return ( this.search && this.search.length ) || Object.keys( this.filters ).length ;
		} ,
		queryObject: function() {
			let queryObject = {} ;

			if ( this.search ) queryObject.search = this.search ;
			if ( this.filters ) queryObject.filters = this.filters ;
			if ( this.sortOrder ) queryObject.sortOrder = this.sortOrder ;
			if ( this.sortName ) queryObject.sortName = this.sortName ;
			if ( this.limit ) queryObject.limit = this.limit ;
			if ( this.skip ) queryObject.skip = this.skip ;
			if ( this.populate ) queryObject.populate = this.populate ;
			if ( this.deepPopulate ) queryObject.deepPopulate = this.deepPopulate ;
			if ( this.access ) queryObject.access = this.access ;

			return queryObject ;
		}
	} ,

	methods: {
		updateFiltersByQuery: function() {
			if ( ! this.getUrlFilters ) return ;

			var queryObject = urls.queryStringToQueryObject( this.$route.query ) ;

			if ( ! isEqual( queryObject.filters , this.filters ) ) {
				this.filters = cloneDeep( queryObject.filters ) ;
			}

			for ( let filter of [
				'limit' ,
				'skip' ,
				'sortName' ,
				'sortOrder' ,
				'search'
			] ) {
				if ( ! queryObject[filter] || queryObject[filter] === this[filter] ) continue ;
				this[filter] = queryObject[filter] ;
			}
		} ,
		getOneDocument: function( id ) {
			return this.$store.getters[`${this.restQuery.collection}/document`]( id ) || {} ;
		} ,
		fetch: async function() {
			return this.$store.dispatch( `${this.restQuery.collection}/fetchCollection` , this.queryObject ) ;
		} ,

		sortSet: function( sortName , sortOrder ) {
			this.sortName = sortName ;
			this.sortOrder = sortOrder || ( this.sortOrder === - 1 ? 1 : - 1 ) ;
		} ,
		searchSet: function( txt , options ) {
			this.skipSet( 0 ) ;
			if ( typeof options === 'object' ) {
				this.search = options.value ;
			}
			else {
				this.search = txt ;
			}
		} ,
		skipSet: function( toSkip ) {
			this.skip = toSkip ;
		} ,

		filterDelete: function( filterName ) {
			this.skipSet( 0 ) ;
			this.$delete( this.filters , filterName ) ;
		} ,

		filterSet: function( name , filter ) {
			this.skipSet( 0 ) ;
			if ( filter.value ) {
				this.$set( this.filters , filter.name , filter ) ;
			}
			else {
				this.$delete( this.filters , filter.name ) ;
			}
		}
	}
} ;
