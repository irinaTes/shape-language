import React from 'react'
import LogoSrc from '../assets/logo-clear.svg'
import Insta from '../assets/insta.png'
import Artst from '../assets/artst.png'
import { Link } from 'react-router-dom'

// Step 2: Define your component
const Footer = () => {
    return (
        <div className='w-full min-h-16 bg-black p-5 py-16 mt-40'>
            <div className='flex md:flex-row flex-col'>
                <div className='w-1/2 min-w-96 text-white flex flex-col '>
                    <img src={LogoSrc} alt='logo src' className='h-20 w-fit mb-8 mt-3' />
                    <span className='font-bold text-7xl'>Shape Language</span>
                    <span className='text-5xl'>Where Imagination Takes Form!</span>
                </div>
                <div className='w-full md:w-1/2 min-w-96 text-white flex flex-col items-end gap-3 mt-32'>
                    <span className='text-4xl font-bold'>Chișinău</span>
                    <span className='text-3xl'>Mihai Eminescu 56 str</span>
                    <span className='text-3xl'>Republic of Moldova</span>
                    <span className='text-3xl'>+373 68 574 457</span>
                    <div className='flex flex-row gap-5 mb-5'>
                        <Link to=''>
                            <img src={Insta} alt="instagram" className='invert h-8 transition-all duration-300 hover:opacity-70 hover:scale-125'/>
                        </Link>
                        <Link to=''>
                            <img src={Artst} alt="artstation" className='invert transition-all duration-300 h-8 hover:opacity-70 hover:scale-125'/>
                        </Link>
                    </div>
                </div>
            </div>
            <span className='mt-10 text-white'>© 2024 Shape Language</span>
        </div>
    )
}

// Step 3: Export your component
export default Footer