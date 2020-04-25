import { state , getters , mutations , actions } from '../store/restQuery' ;
import restQueryNavigation from '../mixins/restQueryNavigation' ;
import urls from '../lib/urls' ;


export default {
	inheritAttrs: false ,

	mixins: [restQueryNavigation] ,

	data: function() {
		return {
			access: this.$attrs.access || null ,
			fetchSchema: true ,
			toServerPrefetch: false ,
			populate: this.$attrs.populate || null ,
			deepPopulate: this.$attrs.deepPopulate || null ,
			restQuery: urls.pathToStore( this.$route.path )
		} ;
	} ,

	serverPrefetch() {
		return this.toServerPrefetch ;
	} ,

	created() {
		this.createStore() ;
		this.toServerPrefetch = this.fetch() ;
	} ,

	computed: {
		store: function() {
			return this.$store.state[this.restQuery.collection] ;
		} ,
		isInit: function() {
			return this.store && this.store.ready || false ;
		} ,
		schema: function() {
			return this.store.schema ;
		} ,
		path: function() {
			return `/${this.restQuery.collection}` ;
		} ,
		meta: function() {
			return this.$store.getters[`${this.restQuery.collection}/getMeta`]( this.queryObject ) ;
		} ,
		fetched: function() {
			return this.isInit && this.meta && ['fetched' , 'refreshing'].includes( this.meta.status ) ;
		}
	} ,

	methods: {
		createStore: function() {
			if ( this.$store.getters[`${this.restQuery.collection}/hasInit`] ) return ;

			this.$store.registerModule( this.restQuery.collection , {
				strict: !! Number( process.env.VUE_APP_STORE_STRICT ) ,

				namespaced: true ,
				getters ,
				actions ,
				mutations ,
				state: Object.assign( {} , state() , {
					// schemaName: this.restQuery.collection ,
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
