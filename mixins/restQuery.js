import { state , getters , mutations , actions } from '../store/restQuery' ;
import restQueryNavigation from '../mixins/restQueryNavigation' ;
import urls from '../lib/urls' ;
import strings from '../lib/strings' ;

export default {
	inheritAttrs: false ,

	mixins: [restQueryNavigation] ,

	data: function() {
		return {
			access: this.$attrs.access || null ,
			fetchSchema: true ,
			toServerPrefetch: false ,
			populate: this.$attrs.populate || null ,
			restQuery: urls.pathToStore( this.$route.path )
		} ;
	} ,

	serverPrefetch() {
		return this.toServerPrefetch ;
	} ,

	created() {
		this.createStore() ;

		if ( ! this.collectionMeta ) {
			this.toServerPrefetch = this.fetch() ;
		}
	} ,

	watch: {
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

				console.log( 'watcher queryObject fetching' ) ;
				this.fetch() ;
			} ,
			deep: true
		}
	} ,

	computed: {
		store: function() {
			return this.$store.state[this.restQuery.collection] ;
		} ,
		ready: function() {
			return this.store && this.store.ready || false ;
		} ,
		schema: function() {
			return this.store.schema ;
		} ,
		path: function() {
			return `/${this.restQuery.collection}` ;
		} ,
		queryObject: function() {
			let queryObject = {} ;
			// Probably FIXME
			if ( this.restQuery.document ) queryObject.id = this.restQuery.document ;

			if ( this.search ) queryObject.search = this.search ;
			if ( this.filters ) queryObject.filters = this.filters ;
			if ( this.sortOrder ) queryObject.sortOrder = this.sortOrder ;
			if ( this.sortName ) queryObject.sortName = this.sortName ;
			if ( this.limit ) queryObject.limit = this.limit ;
			if ( this.skip ) queryObject.skip = this.skip ;
			if ( this.populate ) queryObject.populate = this.populate ;
			if ( this.access ) queryObject.access = this.access ;

			return queryObject ;
		}
	} ,

	methods: {
		createStore: function() {
			if ( this.$store.getters[`${this.restQuery.collection}/hasInit`] ) return ;
			// if ( this.store ) return ;

			this.$store.registerModule( this.restQuery.collection , {
				strict: true ,
				namespaced: true ,
				getters ,
				actions ,
				mutations ,
				state: Object.assign( {} , state() , {
					path: this.restQuery.collection ,
					ready: ! this.fetchSchema
				} )
			} , {
				preserveState: !! ( typeof window !== 'undefined' && window.__INITIAL_STATE__ && window.__INITIAL_STATE__[this.restQuery.collection] )
			} ) ;

			if ( this.fetchSchema ) {
				this.$store.dispatch( `${this.restQuery.collection}/fetchSchema` ) ;
			}
		} ,

		fetch: function() {
			// noop
		} ,

		getSchemaProperty: function( key ) {
			return this.schema.properties && this.schema.properties[ key ] ;
		} ,

		delete: async function( id ) {
			await this.$store.dispatch( `${this.restQuery.collection}/delete` , id ) ;
			this.fetch( true ) ;
			return true ;
		} ,
		switchDebug: function() {
			this.debug = this.debug !== true ;
		}
	}
} ;
