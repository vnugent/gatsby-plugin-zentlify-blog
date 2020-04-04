import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Editor from "./Editor"

export default ({ data }) => {
  console.log("#Admin ", data)
  const [content, setEditableContent] = useState()
  return (
    <div>
      {content && (
        <Editor raw={content} onFinish={() => setEditableContent(undefined)} />
      )}
      <header >Admin</header>
      <Link to="/Editor"><strong>Write new post</strong></Link>
      <ul>
        {data &&
          data.allMarkdownRemark.edges.map(post => (
            <li key={post.node.fields.slug}>
              {/* <div
                onClick={() => setEditableContent(post.node.fields.slug)}
              >
                {post.node.frontmatter.title}
              </div> */}
              <Link to={`/Editor?p=${remove_flashes(post.node.fields.slug)}`}>
              {/* <Link to={`/foo/${remove_flashes(post.node.fields.slug)}`}> */}
                {post.node.frontmatter.title}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`

const remove_flashes = (slug) => slug.replace(/^\/|\/$/g, '');

