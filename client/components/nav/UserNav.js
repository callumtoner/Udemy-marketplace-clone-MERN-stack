import Link from 'next/link'
import { useState, useEffect } from 'react'; 

const UserNav = () => {

    const [current, setCurrent] = useState(''); //if current matches the route then we set the link as the active link the user is on

    useEffect(() => {
        process.browser && setCurrent(window.location.pathname)
   }, [process.browser && window.location.pathname])

    return (
        <div className="nav flex-column nav-pills ">
            <Link href="/user">
            <a className={`nav-link ${current === "/user" && "active"} `}>Dashboard</a>
            </Link>
        </div>
    )
}

export default UserNav; 