
import { currencyFormatter } from "../../utils/helpers";
import {Badge, Modal, Button } from 'antd'
import ReactPlayer from 'react-player';
import {LoadingOutlined, SafetyOutlined} from '@ant-design/icons' 

const SingleCourseJumbotron = ({ course, showModal, setShowModal, preview, setPreview, loading, user, handleFreeEnrollment, handlePaidEnrollment, enrolled, setEnrolled }) => {

    const {name, description, instructor, updatedAt, lessons, image, price, paid, category} = course; //destructrued 


    return (

        <div className="jumbotron bg-primary square">
        <div className="row">  
            <div className="col-md-8">
                {/* show the course material info text on left*/}
                <h1 className="text-light font-weight-bold">{name}</h1>
                <p className="lead">{description && description.substring(0, 200)}...</p>
                <Badge count={category} style={{backgroundColor: '#03a9f4'}} className="pb-4 mr-2" />
                <p>Created by {instructor.name}</p>
                <p>Last updated {new Date(updatedAt).toLocaleDateString()}</p>
                <h4 className="text-light">{ paid ? currencyFormatter({
                    amount: price, 
                    currency: 'gbp'
                }) : "Free"}</h4>
            </div>
            <div className="col-md-4">
                {/* show video preview and enroll button on right */}
                {lessons[0].video && lessons[0].video.Location ? (
                <div onClick={() => {
                    setPreview(lessons[0].video.Location)
                    setShowModal(!showModal); //toggle state 
                }}>
                    <ReactPlayer light={image.Location} className="react-player-div" url={lessons[0].video.Location} width="100%" height="225px"/>
                </div>
                    ) : (
                    <>
                        <img src={image.Location} alt={name} className="img img-fluid"/>
                    </>
                )}
            {/* enroll button */}
            {loading ? (
                <div className="d-flex justify-content-center">
                    <LoadingOutlined className="h1 text-danger" /> 
                </div>
            ) : (
                <Button className="mb-3 mt-3" type={"danger"} block shape="round" icon={<SafetyOutlined />} size="large" disabled={loading} onClick={paid ? handlePaidEnrollment : handleFreeEnrollment}>{user ? enrolled.status ? "Go to course" : "Enroll" : "Login to enroll"}</Button>
            )}
            </div>
        </div> 
        </div> 
    )
}



export default SingleCourseJumbotron; 
