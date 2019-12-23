import restQuery from '../mixins/restQuery' ;
import urls from '../lib/urls' ;
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
		}
	} ,
	created() {
		this.updateFiltersByQuery() ;
	} ,

	computed: {
		hasFecthed: function() {
			return this.collectionMeta ;
		} ,
		collectionHasFetched: function() {
			return this.ready ;
		} ,
		collectionReady: function() {
			// FIXME: need to trigger once !
			return this.ready && this.collectionMeta && ['fetched' , 'refreshing'].includes( this.collectionMeta.status ) ;
		} ,
		collectionMeta: function() {
			return this.store.collections[ urls.queryObjectToQueryString( this.queryObject , true ) ] ;
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
		fetch: async function( force ) {
			return this.$store.dispatch( `${this.restQuery.collection}/fetchCollection` , {
				force: force ,
				...this.queryObject
			} ) ;
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
