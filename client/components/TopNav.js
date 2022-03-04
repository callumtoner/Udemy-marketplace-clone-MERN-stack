import { useState, useEffect, useContext} from 'react'
import { Menu } from "antd"; 
import Link from 'next/link'; 
import {AppstoreOutlined, CoffeeOutlined, LoginOutlined, LogoutOutlined, UserAddOutlined, CarryOutOutlined, TeamOutlined} from '@ant-design/icons'
import {Context} from '../context'
import axios from 'axios'; 
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const {Item, SubMenu, ItemGroup } = Menu; //easier than doing Menu.item, as it's destructured above 


const TopNav = () => {
   const [current, setCurrent] = useState("");
   
   const { state, dispatch } = useContext(Context); 
   const { user } = state; //destructuring the user from the state function
   
   const router = useRouter(); 
  
   useEffect(() => {
        process.browser && setCurrent(window.location.pathname)
   }, [process.browser && window.location.pathname])
   
    const logout = async () => {
        dispatch({type:"LOGOUT"})
        window.localStorage.removeItem('user'); 
        const { data } = await axios.get("/api/logout"); 
        toast(data.message)
        router.push("/login"); 
    }
   
   return (

        <Menu mode="horizontal" selectedKeys={[current]} className="mb-2">
          <Item key="/" onClick={(e) => setCurrent(e.key)} icon= {<AppstoreOutlined />}>
             <Link href="/">
                 <a className="typewriter">App</a>
             </Link>
          </Item> 


          {user && user.role && user.role.includes("Instructor") ? (
                 <Item key="/instructor/course/create" onClick={(e) => setCurrent(e.key)} icon= {<CarryOutOutlined />}>
                 <Link href="/instructor/course/create">
                 <a className="typewriter">Create Course</a>
                 </Link>
             </Item> 

          ) : (
            <Item key="/user/become-instructor" onClick={(e) => setCurrent(e.key)} icon= {<TeamOutlined />}>
              <Link href="/user/become-instructor">
                 <a className="typewriter">Become Instructor</a>
             </Link>
          </Item>
          )}



           {user === null && (
               <> 
                <Item key="/login" onClick={(e) => setCurrent(e.key)} icon= {<LoginOutlined />}>
                    <Link href="/login">
                    <a className="typewriter">Login</a>
                    </Link>
                </Item> 

                <Item key="/register" onClick={(e) => setCurrent(e.key)} icon= {<UserAddOutlined />}>
                     <Link href="/register">
                     <a className="typewriter">Register</a>
                     </Link>
                </Item> 

               </> 
           )} 

            {user && user.role && user.role.includes("Instructor") && (
                <Item key="/instructor" onClick={(e) => setCurrent(e.key)} icon= {<TeamOutlined />} className="">
                     <Link href="/instructor">
                          <a className="typewriter">Instructor</a>
                    </Link>
                 </Item>)}


                {user !== null && (
                   <SubMenu icon={<CoffeeOutlined />} title={user && user.name} className="ms-auto">
                        
                        <ItemGroup>
                        <Item key="/user">
                            <Link href="/user">
                                <a>Dashboard</a>
                            </Link>
                        </Item>
                        <Item onClick={logout} className="ms-auto">
                            Logout
                        </Item> 
                        </ItemGroup>
                   </SubMenu>
                )}
          
          {/* {user && user.role && user.role.includes("Instructor") && (
             <Item key="/instructor" onClick={(e) => setCurrent(e.key)} icon= {<TeamOutlined />} >
             <Link href="/instructor">
                <a className="typewriter">Instructor</a>
            </Link>
         </Item> */}

            

        </Menu> 
    )

}


export default TopNav; 