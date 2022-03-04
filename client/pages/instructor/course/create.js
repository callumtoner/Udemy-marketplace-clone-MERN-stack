import {useState, useEffect} from 'react'; 
import axios from 'axios' 
import InstructorRoute from '../../../components/routes/InstructorRoute';
import CourseCreateForm from '../../../components/forms/courseCreateForm';
import Resizer from 'react-image-file-resizer'
import {toast} from 'react-toastify'
import { useRouter } from 'next/router'

const CourseCreate = () => {

    //state 
    const [values, setValues] = useState({
        name: '', 
        description: '', 
        price: '9.99', 
        uploading: false, 
        paid: true, 
        category: '',
        loading: false,
        imagePreview: ''
    })
    const [image, setImage] = useState({})
    const [preview, setPreview] = useState('');
    const [uploadButtonText, setUploadButtonText] = useState('Upload Image')

    //dont forget the router here or errors! 
    const router = useRouter(); 

    const handleChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value })
    }


    const handleImage = (e) => {
        let file = e.target.files[0];
        //when user uploads image we want to show its preview before saving to asw 
        setPreview(window.URL.createObjectURL(file)); 
        //remember to pass preview as props below to the form page 
        //doing the client side image resizing usimg npm react image client resizer package 
        setUploadButtonText(file.name); 
        setValues({...values, loading : true }); 

        Resizer.imageFileResizer(file, 720, 500, "JPEG", 100, 0, async (uri) => {
            try {
                let {data} = await axios.post('/api/course/upload-image', {
                    image: uri
                }); //need to make this in backend 
                console.log('image uploaded')
                //set image in the state so persists 
                setImage(data)
                setValues({...values, loading : false })

            } catch (err) {
                console.log(err);
                setValues({...values, loading : false })
                toast("Image upload failed. Try later."); 
            }
        })
    }


    const handleImageRemove = async () => {
        console.log('REMOVE IMAGE'); 
        const res = await axios.post('/api/course/remove-image', {image}); 
        try {
         setValues({ ...values, loading: true }); 
         setImage({})
         setPreview('')
         setUploadButtonText('Upload Image')
         setValues({ ...values, loading: false }); 
        } catch (err) {
            console.log(err)
            setValues({ ...values, loading: true }); 
        }
    }




    const handleSubmit = async (e) => {
        e.preventDefault(); 
        //console.log(values); 
       try {
        const {data} = await axios.post('/api/course', {...values, image});
        //if it works then
        toast('great! now you can start adding lessons');
        router.push('/instructor'); //so once they upload they go back to the dashboard, as they dont need to create another course
       } catch (err) {
           toast(err.response.data)
       }
    }


    return (

        <InstructorRoute>
            <h1 className="jumbotron text-center square">Create Course</h1>
            <div className="pt-3 pb-3"> 
            <CourseCreateForm handleSubmit={handleSubmit} handleImage={handleImage} handleChange={handleChange} values={values} setValues={setValues} preview={preview} uploadButtonText={uploadButtonText} handleImageRemove={handleImageRemove}/> 
            </div>
            {/* <pre>{JSON.stringify(values, null, 4)} </pre> */}
        </InstructorRoute>
    );
};


export default CourseCreate; 