//we need to lock this page when logged out or not right user, as it's the personal user homepage elements 
import { useState, useContext, useEffect} from 'react'
import {Context} from '../../context'
import UserRoute from '../../components/routes/userRoute'
import axios from 'axios';
import {Avatar} from 'antd'
import Link from 'next/link';
import {SyncOutlined, PlayCircleOutlined} from '@ant-design/icons'




const userIndex = () => {
   //state 
   const {
       state: {user},
   } = useContext(Context); 
   //states
   const [courses, setCourses] = useState([]); 
   const [loading, setLoading] = useState(false); 

   useEffect(() => {
    loadCourses(); 
   }, []); 

   const loadCourses = async () => {
       
       try {
        setLoading(true); 
       const {data} = await axios.get('/api/user-courses'); 
       setCourses(data); //tried putting into array so it doesnt break
       setLoading(false)
       } catch (err) {
           console.log(err); 
       }
   }
    
    return (

        <UserRoute>
            {loading && <SyncOutlined spin className="d-flex justify-content-center display-1 text-danger p-5" />}
                <h1 className="jumbotron text-center square">
                    User dashboard
                </h1>
            {/* now show all courses for that user  */}
            {courses && courses.map((course) => (
                <div key={course._id} className="media pt-2 pb-1">
                    <Avatar size={80} shape="square" src={course.image ? course.image.Location : '/course.png'} />
                    <div className="media-body pl-2">
                        <div className="row">
                            <div className="col">
                                <Link href={`/user/course/${course.slug}`} className="pointer"><a><h5 className="mt-2 text-primary">{course.name}</h5></a></Link>
                                <p style={{marginTop: '-10px'}}  >{course.lessons.length} lessons</p>
                                <p className="text-muted" style={{marginTop: '-15px', fontSize: '12px'}} >By {course.instructor.name}</p>
                            </div>
                            <div className="col-md-3 mt-3 text-center">
                            <Link href={`/user/course/${course.slug}`} className="pointer"><a><PlayCircleOutlined className="h2 pointer text-primary" /></a></Link>
                                
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </UserRoute>
    )
}

export default userIndex; 