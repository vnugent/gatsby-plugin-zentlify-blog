import React, { useCallback, useMemo, useState, useEffect } from "react"
import isHotkey from "is-hotkey"
import {
  Editable,
  withReact,
  useSlate,
  Slate,
  useEditor,
  ReactEditor,
} from "slate-react"
import { Editor, Transforms, createEditor, Node } from "slate"
import { withHistory } from "slate-history"
import { Button as MButton, Dialog } from "@material-ui/core"
import { InsertLink } from "@material-ui/icons"
import { Button, Icon, Toolbar } from "./SlateComponents"
import { insertLink, isLinkActive, move_cursor} from "../utils/LinkHelpers"
import LinkEditorPopup from "./LinkEditorPopup"
import LinkAddPopup from "./LinkAddPopup"

export default function SlateToolbar({ linkState, setOpenLink }) {
  const editor = useSlate()
  const [addLinkPopup, setAddLinkPopup] = useState([false, []])
  return (
    <div>
      <Toolbar>
        <MarkButton format="strong" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        {/* <MarkButton format="code" icon="code" /> */}
        {/* <BlockButton format="title" icon="title" /> */}
        <BlockButton format="subheader" icon="looks_two" />

        <LinkButton editor={editor} setAddLinkPopup={setAddLinkPopup} />

        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="block-quote" icon="format_quote" />
      </Toolbar>
      <LinkAddPopup
        open={addLinkPopup[0]}
        path={addLinkPopup[1]}
        onSave={url => {
          if (!url) {
            setAddLinkPopup([false, []])
            return
          }
          move_cursor(editor, addLinkPopup[1].focus)
          Transforms.setSelection(editor, addLinkPopup[1])
          insertLink(editor, url)
          setAddLinkPopup([false, []])
        }}
      />
      <LinkEditorPopup
        editor={editor}
        linkState={linkState}
        setOpen={e => {
          setOpenLink(e)
        }}
      />
    </div>
  )
}

const LIST_TYPES = ["numbered-list", "bulleted-list"]

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

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  console.log("toggle ", isActive, format, editor)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  console.log("# isBlockActive  ", editor, format)
  const foo = Array.from(
    Editor.nodes(editor, {
      match: n => {
        //console.log(" ---", n)
        return n.type === format
      },
    })
  )

  // console.log("isBlockActive? ", foo, editor)
  const [match] = foo
  return !!match
}

const isMarkActive = (editor, format) => {
  console.log("#isMarkActive  ", editor, format)
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const LinkButton = ({ editor, setAddLinkPopup }) => {
  //const editor = useSlate()

  const hasLink = isLinkActive(editor)
  return (
    <MButton
      variant={hasLink ? "contained" : "outlined"}
      onClick={event => {
        setAddLinkPopup([true, editor.selection])
        //const url = window.prompt("Enter the URL of the link:")
      }}
    >
      <InsertLink />
    </MButton>
  )
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
