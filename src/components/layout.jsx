
import React, { useRef, useState, useEffect } from 'react'

import LogoAnimation from "../assets/shape-language.mp4"

import Sidebar, { SidebarItem } from './sidebar.jsx'
import Footer from './footer'
import { Link } from 'react-router-dom'

const Layout = ({ pageTitle, children }) => {
    const ref = useRef(null);
    const [focus, setFocus] = useState(false);
    const loop = () => {
        ref.current.play();
    };

    const onEndedLoop = () => {
        if (focus) loop(); // when ended check if its focused then loop
    };

    useEffect(() => {
        if (focus) loop(); // when focused then loop
    }, [focus]);

    return (
        <div className="m-auto max-w-[100vw] relative">
            <div className="flex flex-row justify-between items-center w-full fixed p-3 top-0 z-1" id='shape-lang-header'>
                <Link to="/">
                    <video
                        ref={ref}
                        className='h-16 m-3'
                        autoPlay
                        onMouseOver={() => setFocus(true)}
                        onMouseOut={() => setFocus(false)}
                        muted={true}
                        onEnded={onEndedLoop}
                    >
                        <source src={LogoAnimation} type="video/mp4" />
                    </video>
                </Link>
                <nav className='hidden md:block'>
                    <ul className="flex">
                        <li className="pl-8 text-2xl">
                            <Link to="/works" className="text-black">Works</Link>
                        </li>
                        <li className="pl-8 text-2xl">
                            <Link to="/about" className="text-black">About</Link>
                        </li>
                        <li className="pl-8 text-2xl pr-3">
                            <Link to="/contact" className="text-black">Contact</Link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="md:hidden flex">
                <Sidebar>
                    <SidebarItem text="Works" to="/works" />
                    <SidebarItem text="About" to="/about" />
                    <SidebarItem text="Contact" to="/contact" />
                </Sidebar>
            </div>
            <main>
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default Layout