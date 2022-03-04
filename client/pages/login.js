import { useState, useContext, useEffect } from "react";
import axios from 'axios';
import {toast} from 'react-toastify' 
import {SyncOutlined} from '@ant-design/icons'
import Link from 'next/Link'; 
import { Context } from '../context'; 
import {useRouter} from 'next/router';

const Login = () => {
    
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false); 

    //state access
    const {state, dispatch} = useContext(Context); 
    console.log("state", state); 
    const {user} = state;

    //router
    const router = useRouter();
    
    useEffect(() => {
        if(user !== null) router.push("/"); 
    }, [user]); //the brackets adds the user value as a dependency, so the code insid runs when a change to user/state is made, not just when it mounts 
    
    
    const handleSubmit = async (e) => {
        //event handler for submitting the register form 
        e.preventDefault(); //so page doesnt reload 
        //now send all data to backend to save to db 
        try {
           //setLoading = true; 
            console.table({email, password}); 
            const {data} = await axios.post(`/api/login`, {email, password});
            console.log('LOGIN RESPONSE', data); 
            dispatch({
                type: "LOGIN",
                payload: data,
            })
            //also, save in local storage to persist user data 
            window.localStorage.setItem('user', JSON.stringify(data)); 
            //redirect upon login
            router.push('/user');
            //gonna do the toast alert here 
            toast.success('Login successful.');
            //setLoading(false); 
        } catch (err) {
            toast.error(err.response.data); 
            //setLoading(false); 
        }
        
        
    }
    
    
    
    return (

        <> 
            <h1 className="jumbotron text-center bg-primary square">Login</h1>
            
            <div className="container col-md-4 offset-md-4 pb-5">
                <form onSubmit={handleSubmit}>
                    <input type="email" className="form-control mb-4 p-4" value={email} onChange={ (e) => setEmail(e.target.value)} placeholder="Enter email" required/>
                    <input type="password" className="form-control mb-4 p-4" value={password} onChange={ (e) => setPassword(e.target.value)} placeholder="Enter password" required/>

                    <button type="submit" className="btn btn-block btn-primary form-control mb-4 p-4" disabled={!email || !password || loading } > {loading ? <SyncOutlined spin /> : "submit"} </button>
                </form>

                <p className="text-center pt-3">
                    Not registered yet?{" "}
                    <Link href="/register">
                        <a>Register</a>
                    </Link>
                </p>

                <p className="text-center">
                    <Link href="/forgot-password">
                        <a className="text-danger">Forgot password</a>
                    </Link>
                </p>
            </div>
        </>
    )
}

export default Login; 