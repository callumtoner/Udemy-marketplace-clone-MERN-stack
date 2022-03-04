import {useState, useEffect} from 'react'; 
import {useRouter} from 'next/router'
import InstructorRoute from '../../../../components/routes/InstructorRoute';
import axios from 'axios'; 
import {Avatar, Tooltip, Button, Modal, List } from 'antd'
import {EditOutlined, CheckOutlined, UploadOutlined, QuestionCircleOutlined, CloseOutlined, UserSwitchOutlined} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import AddLessonForm from '../../../../components/forms/AddLessonForm'
import {toast} from 'react-toastify'


const CourseView = () => {

    const [course, setCourse] = useState({}); 
    //for lessons
    const [visible, setVisible] = useState(false); //boolean value, toggled to true on button click 
    //for lesson upload you need title, content and video for the modal popup, need states for those
    const [values, setValues] = useState({
        title: '',
        content: '',
        video: {},
    }); 
    const [uploading, setUploading] = useState(false); //state for video uploading on button click of modal on addlessonform.js
    const [uploadButtonText, setUploadButtonText] = useState("Upload video"); 
    const [progress, setProgress] = useState(0); //this is to monitor upload progress of video for user 
    //for student count 
    const [students, setStudents] = useState(0); 

    const router = useRouter(); 
    const { slug } = router.query; 

    useEffect(() => {
        console.log(slug)
        loadCourse(); 

    }, [slug])

    useEffect(() => {
        course && studentCount(); 
    }, [course]); 

    const studentCount = async () => {
        const {data} = await axios.post(`/api/instructor/student-count`, {
            courseId: course._id
        })
        setStudents(data.length); 
    }

    //fetch the right course now to display data 
    const loadCourse = async () => {
        const {data} = await axios.get(`/api/course/${slug}`);
        setCourse(data); 
    }



    //functions for adding lesson fields ----------------------------------------
    const handleAddLesson = async (e) => {
        e.preventDefault(); //as we're going to use this as form modal submit 
        try {
            const {data} = await axios.post(`/api/course/lesson/${slug}/${course.instructor._id}`, values);
            //now that you have the data 
            setValues({...values, title: "", content: "", video: {} }); 
            setVisible(false); //closes modal 
            setUploadButtonText('Upload video'); 
            //now we have a new course so we should display
            setCourse(data); 
            toast('Lesson added'); 

        } catch (err) {
            console.log(err); 
            toast('Lesson add failed'); 
        }
       
         }

    const handleVideo = async (e) => {
        
        //identify and match instructor so you have the rigths 
        try {

        const file = e.target.files[0]; 
        setUploadButtonText(file.name); 
        setUploading(true); 
        //handle the upload to backend endpoint, db andsystem and S3
        //previously we sent image as binary data but video too big so we send as form data 
        const videoData = new FormData();
        videoData.append('video', file);
        //save progress bar and send the data to backend
        const {data} = await axios.post(`/api/course/video-upload/${course.instructor._id}`, videoData, {
            onUploadProgress: (e) => {
                setProgress(Math.round((100* e.loaded) / e.total))
            }
        })  
        //so after that upload to endpoint we shoudl receive a successful response to here 
        setValues({...values, video: data});
        setUploading(false); 
        } catch (err) {
            console.log(err); 
            setUploading(false); 
            toast('video upload failed')
        }
    }


    //handle removing the video or changing it when its been set
    const handleVideoRemove = async () => {
        try {
            setUploading(true); 

            const {data} = await axios.post(`/api/course/video-remove/${course.instructor._id}`, values.video); 

            setValues({...values, video: {}});
            setUploading(false); 
            setUploadButtonText('upload another video')

        } catch (err) {
            console.log(err); 
            setUploading(false); 
            toast('video upload failed')
        }
    }


const handlePublish = async (e, courseId) => {
    
    try {

        let answer = window.confirm('once you publish the course it will be live in the marketplace for users to buy')
        if (!answer) return 
        const {data} = await axios.put(`/api/course/publish/${courseId}`); //ony put as its update of the publish field on that course 
        setCourse(data); 
        
        toast('congrats! your course is now live!'); 
    } catch (err) {
        console.log(err); 
        toast('publish failed, try again'); 
    }
}

const handleUnpublish = async (e, courseId) => {
    
    try {
        let answer = window.confirm('once you unpublish the course it will not be live in the marketplace for users to buy')
        if (!answer) return 
        const {data} = await axios.put(`/api/course/unpublish/${courseId}`); //ony put as its update of the publish field on that course 
        setCourse(data); 

        toast('your course has been unpublished')
    } catch (err) {
        console.log(err); 
        toast('your attempt to unpublish failed, try again')
    }

}



    return (
        <InstructorRoute>
            <div className="container-fluid pt-3">
                {course && <div className="container-fluid pt-1">
                            <div className="media pt-2">
                                <Avatar size={80} src={course.image ? course.image.Location : '/course.png'}/>
                                <div className="media-body pl-2">
                                     <div className="row">
                                         <div className="col">
                                                <h5 className="mt-2 text-primary">{course.name}</h5>
                                                <p style={{marginTop: '-10px'}}>{course.lessons && course.lessons.length} Lessons</p>
                                                <p style={{marginTop: '-15x', fontSize: '10px'}}>{course.category}</p>
                                         </div>

                                         <div className="d-flex pt-4">
                                         <Tooltip title={`${students} Enrolled`}>
                                                  <UserSwitchOutlined  className="h5 pointer text-warning mr-4"/>
                                             </Tooltip>
                                             
                                              <Tooltip title="Edit">
                                                  <EditOutlined onClick={() => router.push(`/instructor/course/edit/${slug}`)} className="h5 pointer text-warning mr-4"/>
                                             </Tooltip>

                                             {course.lessons && course.lessons.length < 5 ? <Tooltip title="min 5 lessons"> <QuestionCircleOutlined className="h5 pointer text-danger" /> </Tooltip> : course.published ? <Tooltip title="unpublish"><CloseOutlined onClick={(e) => handleUnpublish(e, course._id)} className="h5 pointer text-danger"/></Tooltip> : <Tooltip title="publish"><CheckOutlined onClick={(e) => handlePublish(e, course._id)} className="h5 pointer text-success" /></Tooltip> }

                                             

                                        </div>
                                     </div>
                                </div>
                            </div>
                            <hr />
                            <div className="row">
                                <div className="col"><ReactMarkdown source={course.description} /> </div>
                            </div>
                            <div className="row">
                                <Button onClick={() => setVisible(true)} size="large" className="col-md-6 offset-md-3 text-center" type="primary" shape="round" icon={<UploadOutlined/>}>
                                    Add Lesson
                                </Button>
                            </div>
                            <br />
                            <Modal title="+ Add Lesson" centered visible={visible} onCancel={() => setVisible(false)} footer={null} > <AddLessonForm values={values} setValues={setValues} handleAddLesson={handleAddLesson} uploading={uploading} uploadButtonText={uploadButtonText} handleVideo={handleVideo} progress={progress} handleVideoRemove={handleVideoRemove}/> </Modal>
                        
                                <div className="row pb-5">
                                    <div className="col lesson-list">
                                        <h4>{course && course.lessons && course.lessons.length} Lessons</h4>
                                         {/* {
                                             <List itemLayout="horizontal" dataSource={course && course.lessons} renderItem={(item, index) => (
                                             
                                              
                                                <Text>{item.title + index}</Text>
                                             
                                             // <Item>
                                                //     <Item.Meta avatar={<Avatar>{index + 1}</Avatar>} title={item.title}>

                                                //     </Item.Meta>
                                              //  </Item>
                                        )}></List>
                                        } */}
                                       
                                    </div>
                                </div>
                        
                        </div>}
            </div>
        </InstructorRoute>
    )

}


export default CourseView; 