import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import {toast} from 'react-toastify' 
import {SyncOutlined} from '@ant-design/icons'
import Link from 'next/Link'; 
import { Context } from '../context'; 
import { useRouter } from "next/router";


const Register = () => {
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false); 

    const {
        state: { user },
    } = useContext(Context); 
    
    const router = useRouter(); 

    //when the user is present and the state changes, pushing back to home page. 
    useEffect(() => {
        if(user !== null) router.push("/"); 
    }, [user]);

    // //axios interceptors for certain codes 
    // axios.interceptors.response.use(function (response) {
    //         //any status code that is in range causes this function to trigger 
    //         return response;
    //     }, function(error) {
    //         //logout if an error on proper code from an axios request over 2xx 
    //         let res = error.response; 
    //         if(res.status === 401 && res.config && !res.config.__isRetryRequest) {
    //             //handle the error 
    //             return new Promise((resolve, reject) => {
    //                 axios.get('/api/logout').then((data) => {
    //                     //therefore, if successfully loggged out: 
    //                     console.log('/401 error > logout');
    //                     dispatchEvent({type: 'LOGOUT'});
    //                     window.localStorage.removeItem('user'); 
    //                     router.push("/login");
    //                 }).catch(err => {
    //                     console.log('AXIOS INTERCEPTORS ERROR');
    //                     reject(error); 
    //                 })
    //             })
    //         } 
    //     }
    // );

    const handleSubmit = async (e) => {
        //event handler for submitting the register form 
        e.preventDefault(); //so page doesnt reload 
        //now send all data to backend to save to db 
        try {
           setLoading = true; 
            console.table({name, email, password}); 
            const {data} = await axios.post(`/api/register`, {name, email, password});
            console.log('REGISTER RESPONSE', data); 
            //gonna do the toast alert here 
            toast.success('Registertation successful. please log in');
           
           setName(''); 
           setEmail(''); 
           setPassword(''); 
            setLoading(false); 
        } catch (err) {
            toast.error(err.response.data); 
            setLoading(false); 
        }
        
        
    }
    
    
    
    return (

        <> 
            <h1 className="jumbotron text-center bg-primary square">Register</h1>
            
            <div className="container col-md-4 offset-md-4 pb-5">
                <form onSubmit={handleSubmit}>
                    <input type="text" className="form-control mb-4 p-4" value={name} onChange={ (e) => setName(e.target.value)} placeholder="Enter name" required/>
                    <input type="email" className="form-control mb-4 p-4" value={email} onChange={ (e) => setEmail(e.target.value)} placeholder="Enter email" required/>
                    <input type="password" className="form-control mb-4 p-4" value={password} onChange={ (e) => setPassword(e.target.value)} placeholder="Enter password" required/>

                    <button type="submit" className="btn btn-block btn-primary form-control mb-4 p-4" disabled={!name || !email || !password || loading } > {loading ? <SyncOutlined spin /> : "submit"} </button>
                </form>

                <p className="text-center p-3">
                    Already registered?{" "}
                    <Link href="/login">
                        <a>Login</a>
                    </Link>
                </p>
            </div>
        </>
    )
}

export default Register; 