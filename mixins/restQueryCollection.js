import restQuery from '../mixins/restQuery.js' ;
import urls from '../lib/urls.js' ;
import deepmerge from 'deepmerge' ;
import isEqual from 'lodash.isequal' ;

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
		}
	} ,
	created() {
		this.updateFiltersByQuery() ;
	} ,

	computed: {
		collectionReady: function() {
			// FIXME: need to trigger once !
			return this.ready && this.collectionMeta && ['fetched' , 'refreshing'].includes( this.collectionMeta.status ) ;
		} ,
		collectionMeta: function() {
			return this.store.collections[ urls.queryObjectToQueryString( this.queryObject ) ] ;
		} ,
		collection: function() {
			return this.$store.getters[`${this.restQuery.collection}/collection`]( this.queryObject ) ;
		} ,
		hasFilters: function() {
			return ( this.search && this.search.length ) || Object.keys( this.filters ).length ;
		}
	} ,

	methods: {
		updateFiltersByQuery: function() {
			if ( ! this.getUrlFilters ) return ;

			var queryObject = urls.queryStringToQueryObject( this.$route.query ) ;

			if ( ! isEqual( queryObject.filters , this.filters ) ) {
				this.filters = deepmerge( {} , queryObject.filters ) ;
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
		fetch: async function( force ) {
			return this.$store.dispatch( `${this.restQuery.collection}/fetchCollection` , {
				force: force ,
				...this.queryObject
			} ) ;
		} ,

		queryOptionsSet: function( name , option ) {
			let value = option ;
			if ( typeof value === 'object' ) {
				value = option.value ;
			}
			this[name] = value ;
		} ,
		sortSet: function( sortName , sortOrder ) {
			this.queryOptionsSet( 'sortName' , sortName ) ;
			this.queryOptionsSet( 'sortOrder' , sortOrder || ( this.sortOrder === - 1 ? 1 : - 1 ) ) ;
		} ,

		filterDelete: function( filterName ) {
			this.$delete( this.filters , filterName ) ;
		} ,
		filterSet: function( name , filter ) {
			if ( filter.value ) {
				this.$set( this.filters , filter.name , filter ) ;
			}
			else {
				this.$delete( this.filters , filter.name ) ;
			}
		}
	}
} ;
