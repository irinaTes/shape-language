import React, { createContext, useContext, useState } from "react"
import { Link } from "react-router-dom";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <>
            <button onClick={() => setExpanded((curr) => !curr)} className="rounded-lg fixed z-20 right-[23px] top-[30px]">
                <div className="flex flex-col gap-3">
                    <div className={`flex transition-all duration-500 flex row gap-1 origin-center ${expanded ? 'rotate-45 translate-y-2' : 'transform-none'}`}>
                        <div className={`w-3 h-1 rounded-lg transition-all duration-500 ${expanded ? 'bg-white' : 'bg-black'}`}></div>
                        <div className={`w-8 h-1 rounded-lg transition-all duration-500 ${expanded ? 'bg-white' : 'bg-black'}`}></div>
                    </div>

                    <div className={`w-12 h-1 rounded-lg origin-center transition-all duration-500  ${expanded ? '-rotate-45 -translate-y-2 bg-white' : 'transform-none bg-black'}`}></div>

                    <div className={`flex flex row gap-1 transition-all duration-500  ${expanded ? 'opacity-0' : 'opacity-100'}`}>
                        <div className={`w-8 h-1 rounded-lg transition-all ${expanded ? 'bg-white' : 'bg-black'}`}></div>
                        <div className={`w-3 h-1 rounded-lg transition-all ${expanded ? 'bg-white' : 'bg-black'}`}></div>
                    </div>
                </div>
            </button>
            <aside className={`transition-[height] duration-500 ease-in-out w-screen fixed z-10 top-0  ${expanded ? "h-screen" : "h-0 delay-700"}`}>
                <nav className="w-full h-full flex flex-col bg-black ">

                    <SidebarContext.Provider value={{ expanded }}>
                        <ul className={`flex-1 px-3 transition-all duration-1000 ${expanded ? 'translate-y-[calc(100vh-250px)] opacity-100 delay-300 ' : 'translate-y-[100vh] opacity-0 duration-0'}`}>{children}</ul>
                    </SidebarContext.Provider>
                </nav>
            </aside>
        </>
    )
}

export function SidebarItem({ text, to }) {
    const { expanded } = useContext(SidebarContext)
    return (
        <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group`}>
            <Link to={to} className={`text-white text-5xl `}>{text}</Link>
        </li>
    )
}