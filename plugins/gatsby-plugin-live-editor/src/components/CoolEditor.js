import React, { useCallback, useMemo, useState, useEffect, useRef } from "react"
import isHotkey from "is-hotkey"
import { Editable, withReact, Slate, ReactEditor } from "slate-react"
import { Editor, createEditor } from "slate"
import { withHistory } from "slate-history"
import { withLinks } from "../utils/LinkHelpers"
import SlateToolbar, { toggleMark } from "./SlateToolbar"
import {
  serialize,
  to_markdown,
  html_to_slate,
  gen_slug_from,
  withLayout,
  random_slug,
} from "./slate-utils"

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+`": "code",
}

const _initialValue = [
  {
    type: "title",
    children: [{ text: "Untitled" }],
  },
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
]

const CoolEditor = ({ pageData, onSave }) => {
  const [linkState, setOpenLink] = useState([false, ""])
  const initialValue = pageData.body ? html_to_slate(pageData) : _initialValue
  console.log("#initial ", initialValue)
  const [value, setValue] = useState(initialValue)
  const renderElement = useCallback(
    props => <Element {...props} setOpenLink={setOpenLink} />,
    []
  )
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(
    () =>
      withLayout({
        editor: withLinks(withHistory(withReact(createEditor()))),
        pageData,
      }),
    []
  )

  const documentRef = useRef(value)
  documentRef.current = value

  useEffect(() => {
    const timer = setInterval(() => {
      //Node.string(editor) !== "" && onPresave(documentRef.current)
    }, 45000)
    // not really working
    !ReactEditor.isFocused() && ReactEditor.focus(editor);

    return () => clearInterval(timer)
  }, [linkState])

  const onPresave = document => {
    const { title, body } = serialize({ children: document ? document : value })
    const frontmatter = {
      title: title || "Untitled",
      slug: gen_slug_from(title || pageData.frontmatter.title),
      date: new Date().toISOString(),
    }

    onSave({
      frontmatter,
      body,
      whole_document: to_markdown({
        frontmatter,
        body,
      }),
    })
  }

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <SlateToolbar linkState={linkState} setOpenLink={setOpenLink} />
      <button onClick={() => onPresave()}>Save draft</button>

      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
      />
    </Slate>
  )
}

const Element = ({ attributes, children, element, setOpenLink }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>
    case "title":
      return <h1 {...attributes}>{children}</h1>
    case "subheader":
      return <h2 {...attributes}>{children}</h2>
    case "list-item":
      return <li {...attributes}>{children}</li>
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>
    case "link":
      return (
        <a
          {...attributes}
          href={element.url}
          onClick={(event) => {
            //event.preventDefault()
            setOpenLink([true, element.url])
          }}
        >
          {children}
        </a>
      )
    case "section":
      return <section {...attributes}>{children}</section>
    case "eof":
      return <span>¶</span>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.strong) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

export default CoolEditor
