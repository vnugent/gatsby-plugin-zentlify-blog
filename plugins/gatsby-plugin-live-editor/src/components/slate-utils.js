import escapeHtml from "escape-html"
import { jsx } from "slate-hyperscript"
import { Editor, Node, Text, Transforms } from "slate"
import slugify from "slugify"
import catNames from "cat-names"

/**
 * Convert Slate DOM into markdown with html body
 * @param {node} node - Slate's root document
 */
export const serialize = node => {
  // const firstNode = node.children[0]
  const title = Editor.first(node, [])[0].text

  return { title, body: _serialize_body(node) }
}

export const _serialize_body = node => {
  if (Text.isText(node)) {
    if (node.text.trim() === "") {
      return "&nbsp;"
    }
    var html = escapeHtml(node.text)
    html = node.strong ? `<strong>${html}</strong>` : html
    html = node.italic ? `<i>${html}</i>` : html
    html = node.code ? `<code>${html}</code>` : html
    return html
  }

  const children = node.children.map(n => _serialize_body(n)).join("")

  switch (node.type) {
    case "quote":
      return `<blockquote><p>${children}</p></blockquote>`
    case "paragraph":
      return `<p>${children}</p>`
    case "title":
      return "\n"
    // return `<h1>${children}</h1>`
    case "subheader":
      return `<h2>${children}</h2>`
    case "numbered-list":
      return `<ol>${children}</ol>`
    case "bulleted-list":
      return `<ul>${children}</ol>`
    case "list-item":
      return `<li>${children}</li>`
    // case "b":
    //   return `<strong>${children}</strong>`
    // case "i":
    //   return `<i>${children}</i>`
    case "link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

/**
 * Convert markdown into Slate DOM
 * @param {frontmatter} frontmatter post's frontmatter
 * @param {body} markdown post's body
 */
export const html_to_slate = ({ frontmatter, body }) => {
  const el = new DOMParser().parseFromString(body, "text/html")
  const tree = deserialize(el.body)
  const titleNode = {
    type: "title",
    children: [{ text: frontmatter.title || "Untitled" }],
  }
  return [titleNode].concat(tree)
}

export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)
  switch (el.nodeName.toUpperCase()) {
    case "BODY":
      return jsx("fragment", {}, children)
    case "BR":
      return "\n"
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children)
    case "P":
      return jsx(
        "element",
        { type: "paragraph" },
        children.length === 0 ? jsx("text", {}, "") : children // account for empty <p></p>
      )
    case "B":
      return jsx("text", { strong: true }, children)
    case "STRONG":
      return jsx("text", { strong: true }, children)
    case "I":
      return jsx("text", { italic: true }, children)
    case "H1":
      return jsx("element", { type: "title" }, children)
    case "H2":
      return jsx("element", { type: "subheader" }, children)
    case "OL":
      return jsx("element", { type: "numbered-list" }, children)
    case "UL":
      return jsx("element", { type: "bulleted-list" }, children)
    case "LI":
      return jsx("element", { type: "list-item" }, children)
    case "A":
      return jsx(
        "element",
        { type: "link", url: el.getAttribute("href") },
        children
      )
    default:
      return el.textContent
  }
}

/**
 * Generate a complete string representing a markdown file
 * @param {frontmatter}
 * @param {html_body }
 */
export const to_markdown = ({ frontmatter, body }) => {
  const { title, slug, date } = frontmatter
  return `---\ntitle: ${title}\nslug: ${slug}\ndate: ${date}\n---\n${body}`
}

export const new_draft = () => {
  return {
    frontmatter: {
      title: "Untitled",
      slug: random_slug(),
      date: new Date().toISOString(),
    },
    html_body: "\n",
  }
}
/**
 * Generate post slug from string (typically post's title)
 * @param  str
 * @param limit number of words (default = 12)
 */
export const gen_slug_from = (str, limit = 12) => {
  if (!str) {
    return random_slug()
  }
  const tokens = str.split(" ", limit ? limit : 12)
  return slugify(tokens.join(" "), { lower: true, strict: true })
}

export const random_slug = () => {
  return `new-${catNames.random()}-${catNames.random()}-${Math.random()
    .toString(36)
    .substr(2, 5)}`
}
/**
 * Slate auto-normalize document to enforce structure
 * @param {*} editor
 */
export const withLayout = ({ editor, frontmatter }) => {
  const { normalizeNode } = editor

  editor.normalizeNode = ([node, path]) => {
    console.log("#normalizing ", node, path)
    if (path.length === 0) {
      if (editor.children.length < 1) {
        const title = {
          type: "title",
          children: [{ text: frontmatter.title || "" }],
        }
        Transforms.insertNodes(editor, title, { at: path.concat(0) })
      }

      if (editor.children.length < 2) {
        const paragraph = { type: "paragraph", children: [{ text: "" }] }
        Transforms.insertNodes(editor, paragraph, { at: path.concat(1) })
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        if (childPath[0] === 0) {
          // first node always title
          //console.log(" --> first node: enforce header", child, childPath)
          Transforms.setNodes(editor, { type: "title" }, { at: childPath })
        } else {
          //console.log("    -- other ", child, childPath)
          if (
            childPath[0] === editor.children.length - 1 &&
            (child.type === "numbered-list" || child.type === "bulleted-list")
          ) {
            console.log("last node is # list", child, childPath)
            const paragraph = {
              type: "paragraph",
              children: [{ text: "" }],
            }
            Transforms.insertNodes(editor, paragraph, {at: [editor.children.length]})
            return
          }
        }
        // const type = childPath[0] === 0 ? "title" : "paragraph"

        // if (child.type !== type) {
        //   Transforms.setNodes(editor, { type }, { at: [childPath[0] })
        // }
      }
    }

    return normalizeNode([node, path])
  }

  return editor
}
