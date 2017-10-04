const createReduxDuckling = (actions , createReducer , actionCreators) => namespace => {

	// randomize namespace if not defined
	const RAND_MIN = 10000000000000;
	const RAND_MAX = 99999999999999;
	const ducklingNamespace = namespace ? namespace : 'redux-duck-' + (Math.floor(Math.random() * (RAND_MAX - RAND_MIN + 1)) + RAND_MIN);

	// namespace actions for modularity
	const ACTIONS = Object.keys(actions).reduce((previous , current) => {
		previous[current] = actions[current] + '/' + ducklingNamespace;
		return previous;
	} , {});

	return {
		ACTIONS ,
		createReducer:createReducer(ACTIONS) ,
		actionCreators:actionCreators(ACTIONS)
	};
};

export default createReduxDuckling;