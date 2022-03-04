import {useEffect, useState } from 'react'
import axios from 'axios' 
import { useRouter } from 'next/router'
import {SyncOutlined} from '@ant-design/icons'
import InstructorNav from '../nav/InstructorNav'




const InstructorRoute = ({children}) => {
   //state 
   const [ok, setOk] = useState(false); //essentially showing or not, the user details depending on state of the user being logged in 
   //router 
    const router = useRouter(); ///gives access to router so we can redirect the user, see below at router.push

   
    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const  { data } = await axios.get('/api/current-instructor')
                console.log(data)
                if (data.ok) setOk(true); 
            } catch (err) {
                console.log(err)
                setOk(false)
                router.push("/");
            }
        }
        fetchInstructor(); 
    }, []);
    
    return (

        <>
            {!ok ? (
            <SyncOutlined 
            spin 
            className="d-flex justify-content-center display-1 text-primary p-5" 
            />
            ) : (
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2">
                            <InstructorNav />
                        </div>

                        <div className="col-md-10">
                            {children}
                        </div>
                    </div>
                </div>
              )}
        </>
    ) 
}

export default InstructorRoute; 