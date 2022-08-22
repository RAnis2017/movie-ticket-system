import { combineReducers } from 'redux';
import appReducer from './App/app.reducer';

const rootReducer = combineReducers({

    appState: appReducer,

});

export default rootReducer;