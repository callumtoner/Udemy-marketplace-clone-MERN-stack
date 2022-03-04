import {useState, useEffect} from 'react'; 
import axios from 'axios'; 
import CourseCard from '../components/cards/CourseCard'   
    
    
    //courses is the destructured value from props of the serverside rendering function at bottom
    const Index = ({courses}) => {
      
    //   const [courses, setCourses] = useState([]); 

    //   useEffect(() => {
    //     const fetchCourses = async () => {
    //         const {data} = await axios.get('/api/courses'); 
    //         setCourses(data); 
    //     }
    //     fetchCourses(); 
    //   }, []); 
      
        return (
            <> 
            <h1 className="jumbotron text-center bg-primary"> Online education marketplace </h1>
            <div className="container-fluid">
                <div className="row">
                    {courses.map((course) => <div key={course._id} className="col-md-4">
                        <CourseCard course={course} />
                    </div>)}
                </div>
            </div>
            </>
        )
    }


    //server side rendering of page via nhextjs for SEO optimisation 
    export async function getServerSideProps() {
        const {data} = await axios.get(`http://localhost:8000/api/courses`); 

        return {
            props: {
                courses: data,
            }
        }
    }

export default Index; 