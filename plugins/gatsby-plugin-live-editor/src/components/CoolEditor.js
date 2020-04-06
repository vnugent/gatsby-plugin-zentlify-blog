import React, { useCallback, useMemo, useState, useEffect, useRef } from "react"
import isHotkey from "is-hotkey"
import { Editable, withReact, useSlate, Slate, useEditor } from "slate-react"
import { Editor, Transforms, createEditor, Node } from "slate"
import { withHistory } from "slate-history"

import { Button, Icon, Toolbar } from "./SlateComponents"
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

const LIST_TYPES = ["numbered-list", "bulleted-list"]

const CoolEditor = ({ pageData, onSave }) => {
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
  const initialValue = pageData.body ? html_to_slate(pageData) : _initialValue
  console.log("#initial ", initialValue)
  const [value, setValue] = useState(initialValue)
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(
    () =>
      withLayout({
        editor: withHistory(withReact(createEditor())),
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

    return () => clearInterval(timer)
  }, [])

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
      <Toolbar>
        <MarkButton format="strong" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        {/* <MarkButton format="code" icon="code" /> */}
        {/* <BlockButton format="title" icon="title" /> */}
        <BlockButton format="subheader" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <button onClick={() => onPresave()}>Save draft</button>
      </Toolbar>
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

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  console.log("blog toggle ", format, isActive, editor)

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  })

  // Transforms.setNodes(editor, {
  //   type: isActive ? "paragraph" : format,
  // })
  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  console.log("toggle ", isActive, format, editor)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const foo = Array.from(
    Editor.nodes(editor, {
      match: n => {
        console.log(" ---", n)
        return n.type === format
      },
    })
  )

  console.log("isBlockActive? ", foo, editor)
  const [match] = foo
  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
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

const BlockButton = ({ format, icon }) => {
  const editor = useEditor()

  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

export default CoolEditor
