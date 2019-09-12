export default {
	data: function() {
		return {
			autoScroll: false ,
			watcherElement: {} ,
			observer: {}
		} ;
	} ,

	mounted() {
		if ( this.autoScroll ) {
			this.addWatcher() ;
		}
	} ,

	methods: {
		fetchNext: function() {
			var scroll = window.scrollY ;

			function noScroll() {
				window.scrollTo( 0 , scroll ) ;
			}

			window.addEventListener( 'scroll' , noScroll ) ;
			console.log( 'FIX SHOW MORE!' ) ;

			// await this.$store.dispatch( `${this.restQuery.collection}/fetchNext` , this.queryObject ) ;
			// this.limit += 30 ;
			// this.fetch() ;

			setTimeout( () => {
				window.removeEventListener( 'scroll' , noScroll ) ;
			} , 200 ) ;
		} ,
		loadNext: function( entries /*, observer*/ ) {
			entries.forEach( entry => {
				if ( ! entry.isIntersecting ) return ;

				window.requestIdleCallback( () => {
					this.watcherElement.classList.add( 'loading' ) ;
					// observer.unobserve( entry.target ) ;
					this.fetchNext() ;
				} ) ;
			} ) ;
		} ,
		addWatcher: function() {
			// var list = this.$el.querySelector( '.list' ) ;
			var list = this.$el ;

			if ( ! list ) return ;

			var watcher = document.createElement( 'div' ) ;
			watcher.classList.add( 'watcher' ) ;
			watcher.innerHTML = '&nbsp;' ;

			this.watcherElement = watcher ;
			list.appendChild( watcher ) ;
			setTimeout( ()=>{
				this.observer = new IntersectionObserver( this.loadNext ) ;
				this.observer.observe( watcher ) ;
			} , 500 ) ;
		}
	}
} ;
