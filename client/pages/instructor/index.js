import {useState, useEffect} from 'react';
import axios from 'axios' 
import InstructorRoute from '../../components/routes/InstructorRoute'; 
import {Avatar, Tooltip} from 'antd'
import Link from 'next/link'
import {CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons'

const InstructorIndex = () => {

    //now, we need to add the state and use effect so we can then db hit for the instructor's courses in db and display
    const [courses, setCourses] = useState([]); 

    useEffect(() => {
        loadCourses()
    }, []); 

    const loadCourses = async () => {
        const {data} = await axios.get('/api/instructor-courses');//hits backend and controller function of sorted courses
        setCourses(data); //we put them in array and updates state 
        
    }



const myStyle = { marginTop: "-15px", fontSize: "10px" }; 


    return (

        <InstructorRoute>
            <h1 className="jumbotron text-center square">Instructor Dashboard</h1>
            {/* <pre>{JSON.stringify(courses, null, 4)}</pre> */}

            {courses && courses.map((course) => (
                <> 
                <div className="media pt-2">
                    <Avatar size={80} src={course.image ? course.image.Location : '/course.png'}/>
                    <div className="media-body pl-2">
                        <div className="row">
                            <div className="col">
                                <Link href={`/instructor/course/view/${course.slug}`} className="pointer"><a className="h-5 mt-2 text-primary"><h5 className="pt-2">{course.name}</h5></a></Link>
                                <p style={{ marginTop: "-10px" }}>{course.lessons.length} Lessons</p>
                                {course.lessons.length < 5 ? (
                                        <p style={myStyle} className="text-warning">At least 5 lessons are needed to publish</p>
                                ) : course.published ? (
                                    <p style={myStyle} className="text-success">Your course is live in the marketplace</p>
                                ) : (
                                    <p style={myStyle} className="text-success">Your course is ready to be published</p>
                                )}
                                
                            </div>
                            <div className="col-md-3 mt-3 text-center">
                                {course.published ? <Tooltip title="Published"><CheckCircleOutlined className="h5 pointer text-success"/></Tooltip> :  <Tooltip title="Unpublished"><CloseCircleOutlined className="h5 pointer text-warning" /></Tooltip>}
                            </div>
                        </div>
                    </div>
                </div>
                </>
            ))}

        </InstructorRoute>
    );
};


export default InstructorIndex; 