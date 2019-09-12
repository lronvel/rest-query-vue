import { state , getters , mutations , actions } from '../store/restQuery' ;
import restQueryNavigation from '../mixins/restQueryNavigation.js' ;
import urls from '../lib/urls.js' ;
import strings from '../lib/strings.js' ;

export default {
	inheritAttrs: false ,

	mixins: [restQueryNavigation] ,

	data: function() {
		return {
			populate: this.$attrs.populate || null ,
			restQuery: urls.pathToStore( this.$route.path )
		} ;
	} ,

	serverPrefetch() {
		this.createStore() ;
		return this.fetch() ;
	} ,

	created() {
		this.createStore() ;
		this.fetch() ;
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

			return queryObject ;
		}
	} ,

	methods: {
		createStore: function() {
			if ( this.store ) return ;

			this.$store.registerModule( this.restQuery.collection , {
				// FIXME: WARNING
				// Don't forget to use the preserveState: true option for registerModule so we keep the state injected by the server.
				// preserveState: true,
				strict: true ,
				namespaced: true ,

				state: Object.assign( {} , state() , {
					path: this.restQuery.collection
				} ) ,

				getters ,
				actions ,
				mutations
			} ) ;
			this.$store.dispatch( `${this.restQuery.collection}/fetchSchema` ) ;
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
