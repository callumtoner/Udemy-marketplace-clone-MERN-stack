import {useState, useContext, useEffect} from 'react'; 
import axios from 'axios'
import {toast} from 'react-toastify'
import { SyncOutlined } from '@ant-design/icons';
import Link from 'next/link'
import {Context} from '../context'
import {useRouter} from 'next/router'

const ForgotPassword = () => {
    //state 
    const [email, setEmail] = useState(''); 
    const [success, setSuccess] = useState(false); 
    const [code, setCode] = useState(''); 
    const [newPassword, setNewPassword] = useState(''); 
    const [loading, setLoading] = useState(false); 


//if user already logged in then they should not access this forgot password page, so redirect away 

//context 
const {state: {user}} = useContext(Context); 
//router 
const router = useRouter(); 

//useEffect - redirect if user logged in
useEffect(() => {
    if(user !== null) router.push('/'); 
    }, [user]); 

const handleSubmit = async (e) => {
    e.preventdefault()
    try {
        //when user enters email we submit to backend 
        setLoading(true)
        const {data} = await axios.post('/api/forgot-password', {email}); 
        setSuccess(true)
        toast('check your email for secret code')
    } catch (err) {
        setLoading(false)
        toast(err.response.data)
    }
}


const handleResetPassword = async (e) => {
    e.preventDefault()
    try {
        setLoading(true)
        const {data} = await axios.post('/api/reset-password', {email, code, newPassword}); 
       
        setEmail('')
        setCode('')
        setNewPassword('')
        setLoading(false) 
        toast('great! now you can log in with your new password')
    } catch (err) {
        setLoading(false)
        toast(err.response.data)
    }
}

return (
    <> 
    <h1 className="jumbotron text-center bg-primary square">Forgot password</h1>
    <div className="container col-md-4 offset-md-4 pb-5">
        <form onSubmit={success ? handleResetPassword : handleSubmit}>
            <input type='email' className="form-control mb-4 p-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='enter email' required></input>
            {success && <>
                <input type='text' className="form-control mb-4 p-4" value={code} onChangee={(e) => setCode(e.target.value)} placeholder='enter secret code' required></input>
                <input type='password' className="form-control mb-4 p-4" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='enter new password' required></input>

                        </>}
            <button type="submit" className="btn btn-primary btn-block p-2" disabled={loading || !email }> {loading ? <SyncOutlined spin /> : "submit"}</button>
        </form>

    </div>
    </>
)




};//ends forgot password 

