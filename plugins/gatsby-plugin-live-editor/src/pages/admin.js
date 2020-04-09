import React, { useState } from "react"
import { Link, graphql } from "gatsby"
import { Container, Box, Button } from "@material-ui/core"

import Editor from "./editor"
import BearAppBar, { SlimToolbar } from "../components/widgets/BearAppBar"
import MainMenu from "../components/MainMenu"
import { Post } from "../components/Dashboard"

export default function Admin({ data }) {
  const [content, setEditableContent] = useState()
  return (
    <>
      <BearAppBar rightMenu={<MainMenu />}>
        <SlimToolbar>
          <Box display="flex" fontWeight="600">Dashboard</Box>
        </SlimToolbar>
      </BearAppBar>
      <Container maxWidth="md" style={{ paddingTop: "120px" }}>
        <Box display="flex" justifyContent="flex-end">
          <Button
            color="primary"
            variant="outlined"
            // startIcon={<Create />}
            aria-label="write new"
            component={Link}
            to="/editor"
          >
            Write new post
          </Button>
        </Box>
        {content && (
          <Editor
            raw={content}
            onFinish={() => setEditableContent(undefined)}
          />
        )}
        {data && <AllPosts list={data.allMarkdownRemark.edges} />}
      </Container>
    </>
  )
}

const AllPosts = ({ list }) => {
  return list && list.map(post => <ShowPost key={post.node.fields.slug}  post={post} />)
}

const ShowPost = ({ post }) => {
  const slug = remove_flashes(post.node.fields.slug)
  const {frontmatter} = post.node;
  const {title, description} = frontmatter;
  const preview = "foo bar"
  return <Post title={title} slug={slug} excerpt={description ? description: post.node.excerpt} />
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
          excerpt(format: PLAIN)
          frontmatter {
            title
            description
            date
          }
        }
      }
    }
  }
`

const remove_flashes = slug => slug.replace(/^\/|\/$/g, "")
