import React, { useEffect, useRef, useState } from 'react'
import Layout from '../components/layout'
import { SEO } from "../components/seo"
import LandingPage from "../assets/landing-page.mp4"

// Step 2: Define your component
const HomePage = () => {

  const videoRef = useRef(null)

  const handleScroll = () => {
    if (window.scrollY < 600) {
      const scale = window.scrollY * 0.25 + 100
      const opacity = 1 - window.scrollY / 600
      console.log(opacity)
      videoRef.current.style.transform = `scale(${scale / 100})`
      videoRef.current.style.opacity = opacity < 0.07 ? 0 : opacity
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const handleOnEnded = () => {
    window.scrollTo({top: 700, left: 0, behavior: "smooth" })
  };

  return (
    <Layout>
      <div className='h-screen relative overflow-hidden'>

        <video
          ref={videoRef}
          // className='h-full w-[177.77777778vh] min-w-full min-h-[56.25vw] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]'
          className={`object-cover h-full w-full`}
          autoPlay
          // onMouseOver={() => setFocus(true)}
          // onMouseOut={() => setFocus(false)}
          muted={true}
          onEnded={handleOnEnded}
          src={LandingPage}
          type="video/mp4"
        >
        </video>
      </div>
        <h1 className='text-5xl'>Ebaaaaaaaati</h1>
    </Layout>
  )
}

export const Head = () => (
  <SEO title="Home page" />
)

// Step 3: Export your component
export default HomePage