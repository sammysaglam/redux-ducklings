# Redux Ducklings: Unique Redux Bundles (based on Redux Ducks)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sammysaglam/redux-ducklings/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/redux-ducklings.svg?style=flat)](https://www.npmjs.com/package/redux-ducklings)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

This project is a spin-off based
on [Redux Ducks](https://github.com/erikras/ducks-modular-redux) by [erikras](https://github.com/erikras), and
provides a helper function (createReduxDuckling) to spawn Redux Ducks as unique
child instances called **Ducklings**.

## createReduxDuckling(ACTIONS , createReduce , actionCreators)

```
const reduxDucklingCreator = (() => {
    return createReduxDuckling(
    
        // 1st parameter: your ACTIONS
        // type: object -> in the form of {actionName:'action string' , ...}
        // e.g. {INCREMENT:'counter/INCREMENT'}
        ACTIONS ,
        
        // 2nd parameter: your createReducer function
        // type: function -> which takes in parameter "ACTIONS"
        // e.g. ACTIONS => yourCustomArgs => (state = {} , action = {}) => {return state}
        createReducer ,
        
        // 3rd parameter: your actionCreators
        // type: function -> which takes in parameter "ACTIONS"
        // e.g. ACTIONS => yourCustomArgs => ({  increment:() => ({type:ACTIONS.INCREMENT})  })
        actionCreators 
    );
})();

const firstComponentReduxDuckling = reduxDucklingCreator('first');
const secondComponentReduxDuckling = reduxDucklingCreator('second');
const thirdComponentReduxDuckling = reduxDucklingCreator('third');
const fourthComponentReduxDuckling = reduxDucklingCreator('fourth');
const fifthComponentReduxDuckling = reduxDucklingCreator(); // leaving empty will create a random ID

const reducers = combineReducers({
    firstComponent:firstComponentReduxDuckling.createReducer() ,
    secondComponent:secondComponentReduxDuckling.createReducer() ,
    thirdComponent:thirdComponentReduxDuckling.createReducer() ,
    fourthComponent:fourthComponentReduxDuckling.createReducer() ,
    fifthComponentReduxDuckling:fifthComponentReduxDuckling.createReducer()
});
const store = createStore(reducers);

// get actionCreators
const firstCounterActionCreators = firstCounterRedux.actionCreators('a-custom-argument');
const secondCounterActionCreators = secondCounterRedux.actionCreators();
...

// dispatch some actions
store.dispatch(firstComponentActionCreators.increment());
store.dispatch(secondCounterActionCreators.increment());
...

```

### Usage Example
See [dist/example.html](https://github.com/sammysaglam/redux-ducklings/blob/master/dist/example.html) for
an example of how to create ReduxDucklings. 

# Redux Ducks (the mother of Ducklings)

The proposal behind [Redux Ducks](https://github.com/erikras/ducks-modular-redux), is very
simple: to better modularize your Redux code by bundling all your Actions, Action Creators
and Reducers into a single file per logical module. Though very elegant, by doing this, I
found that when I wanted to use my Redux bundle, I could only do so for a single instance
of a React component, or add a lot of additional code to support multiple instances, which
makes assumptions that there will be multiple instances when imported into other projects: I
believe this negatively affects from the *seperation of concerns* principle.

To the rescue Redux Ducklings! Redux Ducklings creates children
of [Redux Ducks](https://github.com/erikras/ducks-modular-redux) by appending a unique ID
to each Action, so you can safely use clean Redux Ducks and support multiple instances with
little modification to your code.

# Redux Ducklings Explained by Example

Before demonstrating Redux Ducklings, consider the example below:

Using [Redux Ducks](https://github.com/erikras/ducks-modular-redux) (without Ducklings) to
handle state for a single TableOfContents component, would look a bit like this:

```
import {combineReducers , createStore} from 'redux';
import {Provider , connect} from 'react-redux';
import TableOfContents from './components/TableOfContents';

// -----------------------------------------------------------------------
// ----------------------------- REDUX DUCKS -----------------------------
// -----------------------------------------------------------------------

// actions
const CHANGE_SELECTED_ITEM = 'table-of-contents/ITEM_CLICK';

// reducer
const createReducer = defaultItem => (state = {currentItem:defaultItem} , action = {}) => {
	switch (action.type) {
		case CHANGE_SELECTED_ITEM:
			return {
				...state ,
				currentItem:action.newItem
			};

		default:
			return state;
	}
}

// action Creators
const itemClick = newItem => ({
	type:CHANGE_SELECTED_ITEM ,
	newItem
});

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------



// -----------------------------------------------------------------------
// --------------------------------- App ---------------------------------
// -----------------------------------------------------------------------

// create store
const reducers = combineReducers({
    tableOfContents:createReducer('dashboard')
});
const store = createStore(
    reducers
);

// react-redux connection
const mapStateToProps = (state , ownProps) => ({
    currentItem:state.tableOfContents.currentItem
});
const mapDispatchToProps = dispatch => ({
    onItemClick:itemKey => {
        dispatch(itemClick(itemKey));
    }
});
const TableOfContentsContainer = connect(
    mapStateToProps ,
    mapDispatchToProps
)(TableOfContents);

// render react component
var component = ReactDOM.render(
    <Provider store={store}>
        <TableOfContentsContainer />
    </Provider> ,
    document.getElementById('table-of-contents')
);

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
```

The above looks good. However, if I want to have multiple TableOfContents components, it
gets a bit more difficult, as the two different TableOfContents components' redux bundles
ACTIONS will clash with eachother (as they will be identical). So, the reducer must be
modified to manage multiple TableOfContents instances using a `tableOfContentsId`, as follows:

```
import {combineReducers , createStore} from 'redux';
import {Provider , connect} from 'react-redux';
import TableOfContents from './TableOfContents';

// -----------------------------------------------------------------------
// ----------------------------- REDUX DUCKS -----------------------------
// -----------------------------------------------------------------------

// actions
const CHANGE_SELECTED_ITEM = 'table-of-contents/ITEM_CLICK';

// reducer
const createReducer = defaultItem => (state = {currentItem:defaultItem} , action = {}) => {
	switch (action.type) {
		case CHANGE_SELECTED_ITEM:
			return {
				...state ,
				// below change from: currentItem:action.newItem
				currentItem:{
				    [action.tableOfContentsId]:action.newItem
				}
			};

		default:
			return state;
	}
}

// action Creators
const itemClick = (tableOfContentsId,newItem) => ({
	type:CHANGE_SELECTED_ITEM ,
	tableOfContentsId , // added
	newItem
});

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------



// -----------------------------------------------------------------------
// --------------------------------- App ---------------------------------
// -----------------------------------------------------------------------

// create store
const reducers = combineReducers({
    tableOfContents:createReducer('dashboard')
});
const store = createStore(reducers);

// 1st react-redux connection
const firstTableOfContentsId = '1st';
const mapStateToProps1 = (state , ownProps) => ({
    currentItem:state.tableOfContents.currentItem[firstTableOfContentsId]
});
const mapDispatchToProps1 = dispatch => ({
    onItemClick:itemKey => {
        dispatch(itemClick(firstTableOfContentsId,itemKey));
    }
});
const TableOfContentsContainer = connect(
    mapStateToProps1 ,
    mapDispatchToProps1
)(TableOfContents);

// 2nd react-redux connection
const secondTableOfContentsId = '2nd';
const mapStateToProps2 = (state , ownProps) => ({
    currentItem:state.tableOfContents.currentItem[secondTableOfContentsId]
});
const mapDispatchToProps1 = dispatch => ({
    onItemClick:itemKey => {
        dispatch(itemClick(secondTableOfContentsId,itemKey));
    }
});
const SecondTableOfContentsContainer = connect(
    mapStateToProps2 ,
    mapDispatchToProps2
)(TableOfContents);

// render react component
var component = ReactDOM.render(
    <Provider store={store}>
        <TableOfContentsContainer />
        <SecondTableOfContentsContainer />
    </Provider> ,
    document.getElementById('table-of-contents')
);

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
```

The above is not very nice though, since it breaks the modularity by being built
for multiple instances of a component (as well requires code modification).

Instead, see below code, which uses createReduxDuckling:

```
import {combineReducers , createStore} from 'redux';
import {Provider , connect} from 'react-redux';
import TableOfContents from './components/TableOfContents';

import createReduxDuckling from 'redux-ducklings';

// -----------------------------------------------------------------------
// --------------------------- REDUX DUCKLINGS ---------------------------
// -----------------------------------------------------------------------

const TableOfContentsDuckling = (() => {
    
    // actions
    const ACTIONS = {
        CHANGE_SELECTED_ITEM:'table-of-contents/ITEM_CLICK'
    }
    
    // reducer
    const createReducer = ACTIONS => defaultItem => (state = {currentItem:defaultItem} , action = {}) => {
        switch (action.type) {
            case CHANGE_SELECTED_ITEM:
                return {
                    ...state ,
                    currentItem:action.newItem
                };
    
            default:
                return state;
        }
    }
    
    // action Creators
    const actionCreators = ACTIONS => () => {
        const itemClick = newItem => ({
            type:CHANGE_SELECTED_ITEM ,
            newItem
        });
        
        return {
            itemClick
        }
    }
    
    
    // duckling
    return createReduxDuckling(
        ACTIONS ,
        createReducer ,
        actionCreators
    );

})();

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------



// -----------------------------------------------------------------------
// --------------------------------- App ---------------------------------
// -----------------------------------------------------------------------

// instantiate multiple ducklings
const firstReduxDuckling = tableOfContentsReduxDuckling('1st');
const secondReduxDuckling = tableOfContentsReduxDuckling(); // no argument will generate a random ID

// get actionCreators
const firstActionCreators = firstReduxDuckling.actionCreators();
const secondActionCreators = secondReduxDuckling.actionCreators();

// create store
const reducers = combineReducers({
    firstTableOfContents:firstReduxDuckling.createReducer() ,
    secondTableOfContents:secondReduxDuckling.createReducer()
});
const store = createStore(reducers);

// first react-redux connection
const mapStateToProps1 = (state , ownProps) => ({
    currentItem:state.firstTableOfContents.currentItem
});
const mapDispatchToProps1 = dispatch => ({
    onItemClick:itemKey => {
        dispatch(firstActionCreators.itemClick(itemKey));
    }
});
const FirstTableOfContentsContainer = connect(
    mapStateToProps1 ,
    mapDispatchToProps1
)(TableOfContents);

// second react-redux connection
const mapStateToProps2 = (state , ownProps) => ({
    currentItem:state.secondTableOfContents.currentItem
});
const mapDispatchToProps2 = dispatch => ({
    onItemClick:itemKey => {
        dispatch(secondActionCreators.itemClick(itemKey));
    }
});
const SecondTableOfContentsContainer = connect(
    mapStateToProps2 ,
    mapDispatchToProps2
)(TableOfContents);

// render react component
var component = ReactDOM.render(
    <Provider store={store}>
        <FirstTableOfContentsContainer />
        <SecondTableOfContentsContainer />
    </Provider> ,
    document.getElementById('table-of-contents')
);

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
```

License
-------
MIT