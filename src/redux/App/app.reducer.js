import { LoginSuccess, GoogleSignIn, SetToken, SetPermissions, SetUserMovieDetails } from './app.types';

const INITIAL_STATE = {
    email: '',
    isLoggedIn: false,
    token: '',
    permissions: [],
    userMovieDetails: {},
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case LoginSuccess:
            localStorage.setItem('email', action.payload);
            return {
                ...state, email: action.payload, isLoggedIn: true,
            };
        case GoogleSignIn:
            localStorage.setItem('email', action.payload);
            return {
                ...state, email: action.payload, isLoggedIn: true,
            };
        case SetToken:
            localStorage.setItem('token', action.payload);
            return {
                ...state, token: action.payload,
            };
        case SetPermissions:
            return {
                ...state, permissions: action.payload,
            };
        case SetUserMovieDetails:
            return {
                ...state, userMovieDetails: action.payload,
            };
        default: return state;
    }
};

export default reducer;