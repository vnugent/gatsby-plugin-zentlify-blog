import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import { GitClient } from "@tinacms/git-client"
import CoolEditor from "../components/CoolEditor"

export default ({ raw, onFinish, location, ...rest }) => {
  const slug = get_slug(location)
  slug && console.log("New slug found. Editing new draft.")

  const [data, setData] = useState(undefined)
  const [error, setError] = useState(false)

  slug &&
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await fetch(`/page-data/${slug}/page-data.json`)
          if (result.ok) {
            const json = await result.json()
            setData(json.result.data.markdownRemark.rawMarkdownBody)
          } else {
            setError(true)
            console.log("#Error loading post ", result.status)
          }
        } catch (error) {
          setError(true)
          console.log("#Error loading post ", error)
        }
      }
      fetchData()
    }, [])

  const gitClient = new GitClient("http://localhost:8000/___tina")

  console.log("#gitClient", gitClient)

  gitClient.writeToDisk({
    fileRelativePath: "/draft/index1.md",
    content: "hello ;)",
  })
  
  return (
    <div style={{ width: "100%", vh: "100vh" }}>
      <Link to="/admin">Back to dashboard</Link>
      {error && <div>error occurred while loading post</div>}
      {data && <CoolEditor raw={data} />}
    </div>
  )
}

const get_slug = location => {
  const params = new URLSearchParams(location.search)
  return params.has("p") ? params.get("p") : undefined
}
