import Link from 'next/link'
import { useState, useEffect } from 'react'

const InstructorNav = () => {
   
    const [current, setCurrent] = useState(''); //if current matches the route then we set the link as the active link the user is on

    useEffect(() => {
        process.browser && setCurrent(window.location.pathname)
   }, [process.browser && window.location.pathname])
   
   
    return (
        <div className="nav flex-column nav-pills ">
            <Link href="/instructor">
                <a className={`nav-link ${current === "/instructor" && "active"} `}>Dashboard</a>
            </Link>

            <Link href="/instructor/course/create">
                <a className={`nav-link ${current === "/instructor/course/create" && "active"} `}>Create Course</a>
            </Link>

            <Link href="/instructor/revenue">
                <a className={`nav-link ${current === "/instructor/revenue" && "active"} `}>Revenue</a>
            </Link>
        </div>
    )
}

export default InstructorNav; 