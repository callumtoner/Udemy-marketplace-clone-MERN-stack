import {useState, useEffect, useContext} from 'react'; 
import axios from 'axios'
import {useRouter} from 'next/router'
import {toast} from 'react-toastify'
import SingleCourseJumbotron from '../../components/cards/SingleCourseJumbotron';
import PreviewModal from '../../components/modal/PreviewModal';
import SingleCourseLessons from '../../components/cards/SingleCourseLessons';
import {Context} from '../../context'
import {loadStripe} from '@stripe/stripe-js'; 

const SingleCourse = ({course}) => {
    
    //state 
    const [showModal, setShowModal] = useState(false); 
    const [preview, setPreview] = useState(""); 
    //state for the free and paid loading 
    const [loading, setLoading] = useState(false); 
    const [enrolled, setEnrolled] = useState({}); 

    //get the user state/context 
    const {
        state: { user },
    } = useContext(Context); //gives us the current user info etc, pass this to the components below
    
   
   //useeffect to make request to backend for current user courses 
   useEffect(() => {
    if(user && course) checkEnrollment();
   }, [user, course]); 
   
   const checkEnrollment = async () => {
       const {data} = await axios.get(`/api/check-enrollment/${course._id}`)
       console.log(data); 
   }
   
   
    const router = useRouter(); 
    const { slug } = router.query; 
   

//here functions to handle free and paid enrollment of users to the courses - needs buttons etc added 
const handlePaidEnrollment = async () => {
    console.log('handle paid enrollment ')
    //this is where we make request to backend for stripe session etc 
    try {

        setLoading(true); 
       //checks and security
        if(!user) router.push('/login'); 
        if(enrolled.status) return router.push(`/user/course/${enrolled.course.slug}`); 

        const {data} = await axios.post(`/api/paid-enrollment/${course._id}`); //in data we must now have the session id with stripe
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);//initialise stripe 
        stripe.redirectToCheckout({sessionId: data });
        //depemnding how this goes stripe will redirect to success or cancel page which we need to make 
        

    } catch (err) {
        console.log(err); 
        toast('enrollment failed. try again!'); 
        setLoading(false); 
    }

}

const handleFreeEnrollment = async (e) => {
    console.log('handle free enrollment ')
    e.preventDefault(); 
    try {
       
       //check if user is logged in first 
        if (!user) router.push('/login'); 
       //check if already enrolled stop 
       if (enrolled.status) 
            return router.push(`/user/course/${enrolled.course.slug}`)
        
        setLoading(true); 
        const {data} = await axios.post(`/api/free-enrollment/${course._id}`);
        toast(data.message); //remmeber to send the message as backend property so ti ends up here 
        setLoading(false); 
        //if free enrollment is successful it reroutes them to course page
        router.push(`/user/course/${data.course.slug}`); 
    } catch (err) {
        toast('enrollment failed, try again')
        setLoading(fasle); 
    }
}




    return (
        <>
               {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
              <SingleCourseJumbotron enrolled={enrolled} setEnrolled={setEnrolled} user={user} handleFreeEnrollment={handleFreeEnrollment} handlePaidEnrollment={handlePaidEnrollment} loading={loading} course={course} showModal={showModal} setShowModal={setShowModal} preview={preview} setPreview={setPreview} />  
          
              <PreviewModal showModal={showModal} setShowModal={setShowModal} preview={preview} />
              
              {course.lessons && (
                <SingleCourseLessons lessons={course.lessons} setPreview={setPreview} showModal={showModal} setShowModal={setShowModal} /> 
              )}
              
        </>
    )
};


//now that we have the slug/course name we can request for its content and render it on the page 
//this returns all the data as json on page as we're rendering with nextjs, we have to format it and mak eit look good by destructuring first 
export async function getServerSideProps ({query}) {
    const {data} = await axios.get(`http://localhost:8000/api/course/${query.slug}`)
    return {
        props: {
            course: data, 
        }
    }
}

export default SingleCourse; 