module.exports = {
	'env': {
		'browser': true ,
		'es6': true ,
		'node': true
	} ,
	'parserOptions': {
		'ecmaVersion': 9 ,
		'sourceType': 'module'
	} ,
	'extends': ['eslint:recommended' , 'plugin:vue/recommended'] ,
	'rules': {
		'no-console': 0 ,
		'no-else-return': 1 ,

		'no-trailing-spaces': 'error' ,
		'camelcase': 'warn' ,
		'no-unneeded-ternary': 'error' ,
		'radix': 'error' ,
		'no-multi-spaces': 'error' ,
		'block-spacing': 'error' ,
		'no-whitespace-before-property': 'error' ,
		'space-before-blocks': 'error' ,
		'eqeqeq': 'error' ,
		'consistent-return': 'error' ,
		'valid-typeof': 'error' ,

		'semi': ['error' , 'always'] ,
		'semi-style': ['error' , 'last'] ,
		'semi-spacing': [
			'error' ,
			{
				'before': true ,
				'after': true
			}
		] ,
		'comma-spacing': [
			'error' ,
			{
				'before': true ,
				'after': true
			}
		] ,
		'comma-dangle': ['error' , 'never'] ,

		'space-before-function-paren': ['error' , 'never'] ,

		/***********/
		/* Objects */
		/***********/
		'key-spacing': ['error'] ,
		'object-curly-newline': [
			'error' ,
			{
				'consistent': true ,
				'minProperties': 5
			}
		] ,
		'object-property-newline': ['error' , { 'allowMultiplePropertiesPerLine': true } ] ,
		'object-curly-spacing': ['error' , 'always'] ,

		/**********/
		/* Arrays */
		/**********/
		'array-bracket-newline': ['error' , 'consistent'] ,
		'array-element-newline': ['error' , { 'multiline': true , minItems: 3 } ] ,
		'array-bracket-spacing': ['error' ,
			'never' ,
			{
			// 'singleValue': false ,
				'objectsInArrays': true ,
				'arraysInArrays': true
			} ] ,

		'brace-style': [
			'error' ,
			'stroustrup' ,
			{
				'allowSingleLine': true
			}
		] ,

		'space-infix-ops': 'error' ,
		'space-unary-ops': [
			'error' ,
			{
				'words': true ,
				'nonwords': true ,
				'overrides': {
					'++': false
				}
			}
		] ,

		'space-in-parens': [
			'error' ,
			'always' ,
			{
				'exceptions': ['empty']
			}
		] ,

		'indent': [
			'error' ,
			'tab' ,
			{
				'SwitchCase': 1
			}
		] ,

		'quotes': [
			'error' ,
			'single' ,
			{
				'allowTemplateLiterals': true
			}
		] ,


		/* Vue rules */
		'vue/html-indent': ['error' , 'tab'] ,
		'vue/max-attributes-per-line': ['error' ,
			{
				'singleline': 10 ,
				'multiline': {
					'max': 1 ,
					'allowFirstLine': false
				}
			} ] ,
		'vue/html-self-closing': ['error' ,
			{
				'html': {
					'void': 'always' ,
					'normal': 'always' ,
					'component': 'always'
				} ,
				'svg': 'always' ,
				'math': 'always'
			} ]
	}
} ;
