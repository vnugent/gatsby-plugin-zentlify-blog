import React, { useCallback, useMemo, useState } from "react"
import isHotkey from "is-hotkey"
import { Editable, withReact, useSlate, Slate, useEditor } from "slate-react"
import { Editor, Transforms, createEditor } from "slate"
import { withHistory } from "slate-history"

import { Button, Icon, Toolbar } from "./SlateComponents"
import { serialize, to_markdown, html_to_slate, gen_slug_from } from "./slate-utils"

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+`": "code",
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]

const CoolEditor = ({ raw, onSave }) => {
  const _initialValue = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]
  const initialValue = raw ? html_to_slate(raw) : _initialValue
  console.log("#initial ", initialValue)
  const [value, setValue] = useState(initialValue)
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const onPresave = () => {
    const html_body = serialize({ children: value })
    const title = Editor.first(editor,[])[0].text;
    const slug = gen_slug_from(title);
    const frontmatter = {
      title,
      slug,
      date: new Date().toISOString(),
    }
    const content = to_markdown({
      frontmatter,
      html_body,
    })
    onSave({frontmatter, content} )
  }

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <Toolbar>
        <MarkButton format="strong" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        {/* <MarkButton format="code" icon="code" /> */}
        <BlockButton format="title" icon="title" />
        <BlockButton format="subtitle" icon="subtitle" />
        <BlockButton format="block-quote" icon="Quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <button onClick={onPresave}>Save draft</button>
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
  const nodes = Array.from(editor.children)
  const [foo] = nodes.filter(n => n.type === format)

  const [match] = Editor.nodes(editor.children, {
    match: n => {
      console.log(" ---", n)
      return n.type === format
    },
  })

  console.log("isBlockActive? ", [match], editor)

  return !!foo
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
    case "subtitle":
      return <h4 {...attributes}>{children}</h4>
    case "list-item":
      return <li {...attributes}>{children}</li>
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>
    case "section":
      return <section {...attributes}>{children}</section>
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
    <button
      //active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      {icon}
    </button>
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
