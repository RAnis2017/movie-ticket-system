import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './rootReducer';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
  
const persistConfig = {
  key: 'root',
  storage,
}
 
const persistedReducer = persistReducer(persistConfig, rootReducer, composeWithDevTools())
let store = createStore(persistedReducer)
let persistor = persistStore(store)
const exportD = { store, persistor }
export default exportD