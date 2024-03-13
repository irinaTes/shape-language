import * as React from 'react'
import { StaticImage } from 'gatsby-plugin-image'

import Layout from '../components/layout'
import { SEO } from "../components/seo"

// Step 2: Define your component
const IndexPage = () => {
  return (
    <Layout pageTitle="Home Page">
      <p>I'm making this by following the Gatsby Tutorial.</p>
      <StaticImage
        alt="Clifford, a reddish-brown pitbull, posing on a couch and looking stoically at the camera"
        src="../images/gatito.jpg"
      />
    </Layout>
  )
}

export const Head = () => (
  <SEO title="Home page"/>
)

// Step 3: Export your component
export default IndexPage