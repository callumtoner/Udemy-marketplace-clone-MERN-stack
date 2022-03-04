//here we ewant to store the logged in user's state 
import {createContext, useReducer, useEffect} from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

//initial state 
const initialState = {
    user: null,
}; 

const Context = createContext(); 

//root reducer 
const rootReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN": 
        return {...state, user: action.payload };
        case "LOGOUT": 
        return {...state, user: null }; 
        default: 
        return state; 
    }
}

//wrap the entire component in the app page so its all over the application with this context provider 
const Provider = ({children}) => {
    const [state, dispatch] = useReducer(rootReducer, initialState); 

    //router
    const router = useRouter(); //this allows us to use the push functions below to the right place 
    
    useEffect(() => {
        dispatch({
            type: "LOGIN",
            payload: JSON.parse(window.localStorage.getItem('user'))
        })
    }, []); 


    //axios interceptors for certain codes 
    axios.interceptors.response.use(function (response) {
        //any status code that is in range causes this function to trigger 
        return response;
    }, function(error) {
        //logout if an error on proper code from an axios request over 2xx 
        let res = error.response; 
        if(res.status === 401 && res.config && !res.config.__isRetryRequest) {
            //handle the error 
            return new Promise((resolve, reject) => {
                axios.get('/api/logout').then((data) => {
                    //therefore, if successfully loggged out: 
                    console.log('/401 error > logout');
                    dispatchEvent({type: 'LOGOUT'});
                    window.localStorage.removeItem('user'); 
                    router.push("/login");
                }).catch(err => {
                    console.log('AXIOS INTERCEPTORS ERROR');
                    reject(error); 
                })
            })
        } 
        return Promise.reject(error); //still inside error handling function
    }
);

//csrf token security handled by passing to csrf endpoint in backend - token is added in axios headers by default
useEffect(() => {
    const getCsrfToken = async () => {
        const {data} = await axios.get('/api/csrf-token')
        //console.log("CSRF", data)
        axios.defaults.headers['X-CSRF-Token'] = data.getCsrfToken;
    }
    getCsrfToken();
}, []); //how we include the token in the headers automatically using axios 

    
    return (
        <Context.Provider value={{state, dispatch}}>
            {children}
        </Context.Provider>
    )
}

export {Context, Provider} 