import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import { navigate } from "@reach/router"

import { GitClient } from "@tinacms/git-client"
import CoolEditor from "../components/CoolEditor"
import { new_draft, gen_slug_from } from "../components/slate-utils"

export default ({ raw, onFinish, location, ...rest }) => {
  const slug = get_slug(location)
  slug && console.log("Trying to load ", slug)

  const [loading, setLoading] = useState(false)
  const [pageData, setData] = useState(new_draft())
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await fetch(`/page-data/${slug}/page-data.json`)
        if (result.ok) {
          const json = await result.json()
          const {
            frontmatter,
            rawMarkdownBody,
          } = json.result.data.markdownRemark
          // we already have a slug - this call simply strips off leading and trailing slash
          frontmatter.slug = gen_slug_from(json.result.pageContext.slug);
          setData({ frontmatter, body: rawMarkdownBody })
        } else {
          setError(true)
          console.log("#Error loading post ", result.status)
        }
      } catch (error) {
        setError(true)
        console.log("#Error loading post ", error)
      } finally {
        setLoading(false)
      }
    }
    slug && fetchData()
  }, [])

  const onSave = async ({ frontmatter, body, whole_document }) => {

    const slug_has_changed = slug !== frontmatter.slug || false

    console.log("# on Save  ", slug, frontmatter, body)
    if (slug && slug_has_changed) {
      console.log("existing slug renamed - delete old one")
      await gitClient.deleteFromDisk({
        relPath: `${slug}/index.md`,
        //fileRelativePath: `${frontmatter.slug}/index.md`,
        // content: content,
      })
    }

    console.log("writing file to disk")
    try {
      await gitClient.writeToDisk({
        fileRelativePath: `${frontmatter.slug}/index.md`,
        content: whole_document,
      })
      if (slug_has_changed) {
        console.log("Slug changed - reloading page")
        navigate(`./Editor?p=${frontmatter.slug}`)
      } else {
        console.log("Slug not changed - updating current doc")

        setData({ frontmatter, body })
      }
    } catch (error) {}
  }

  const gitClient = new GitClient("http://localhost:8000/___tina")

  // gitClient.writeToDisk({
  //   fileRelativePath: "/draft/index1.md",
  //   content: "hello ;)",
  // })

  return (
    <div>
      {loading && <div>loading ...</div>}
      {error && <div>error occurred while loading post</div>}
      {!loading && <CoolEditor pageData={pageData} onSave={onSave} />}
    </div>
  )
}

const get_slug = location => {
  const params = new URLSearchParams(location.search)
  return params.has("p") ? params.get("p") : undefined
}
