import {useState, useEffect, createElement} from 'react'
import {useRouter} from 'next/router'
import axios from 'axios'; 
import StudentRoute from '../../../components/routes/StudentRoute';
import {Button, Menu, Avatar} from 'antd'
import ReactPlayer from 'react-player'
import ReactMarkdown from 'react-markdown'
import { PlayCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
const Item = Menu; 

const SingleCourse = () => {
   const [clicked, setClicked] = useState(-1);
   const [collapsed, setCollapsed] = useState(false); 
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({ lessons: [] }); //course.lessons error blocking 
    

    //router
    const router = useRouter(); 
    const {slug} = router.query; 

    useEffect(() => {

        if (slug) loadCourse(); 
    }, [slug]); 

    const loadCourse = async () => {
        const {data} = await axios.get(`/api/user/course/${slug}`); //this is public endpoint so need middleware to guard it, check the user courses array
        //this is the access point for a course and its lessons etc, so only allowed ppl should access the endpoint
        setCourse(data); 
    }
    
    return (
        <StudentRoute>
            <div className="row">
                <div style={{ maxWidth: 320} }>
                    <Button onClick={() => setCollapsed(!collapsed)} className="text-primary mt-1 btn-block mb-2">
                        {createElement( collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}{" "}{!collapsed && "Lessons"}
                    </Button>
                    <Menu defaultSelectedKeys={[clicked]} inlineCollapsed={collapsed} style={{height: '80vh', overflow: 'scroll'}}>
                        {course.lessons.map((lesson, index) => (
                            <Item key={index} icon={<Avatar>{index + 1}</Avatar>} onClick={() => setClicked(index)}>{lesson.title.subString(0, 30)}</Item>
                        ))}
                    </Menu>
                </div> 

                <div className="col">
                    {clicked !== -1 ? (<>
                                    {course.lessons[clicked].video && course.lessons[clicked].video.Location && (
                                        <>
                                        <div className="wrapper">
                                            <ReactPlayer className="player" controls width="100%" height="100%" url={course.lessons[clicked].video.Location}/>
                                        </div>
                                             
                                        </>
                                    )} 
                                    <ReactMarkdown source={course.lessons[clicked].content} className="single-post" /> 
                                    </>) : (
                                    <div>
                                        <div className="text-center p-5">
                                        <PlayCircleOutlined className="text-primary display-1 p-5"/>
                                        <p className="lead">Click the lessons to start learning</p>
                                        </div>
                                    </div>)}

                                
                </div>
            </div>
        </StudentRoute>
    )
}

export default SingleCourse;