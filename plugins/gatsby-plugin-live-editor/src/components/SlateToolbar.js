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
import { Editor, Transforms, Node } from "slate"

import {
  Button as MButton,
  AppBar,
  Toolbar as MuiToolbar,
  Container,
  Divider,
  withStyles,
  makeStyles,
} from "@material-ui/core"

import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab"

import {
  InsertLink,
  FormatBoldRounded,
  FormatItalic,
  FormatListNumbered,
  FormatListBulleted,
  FormatQuote,
} from "@material-ui/icons"

import { Button, Icon, Toolbar } from "./SlateComponents"
import { insertLink, isLinkActive, move_cursor } from "../utils/LinkHelpers"
import LinkEditorPopup from "./LinkEditorPopup"
import LinkAddPopup from "./LinkAddPopup"

export default function SlateToolbar({ linkState, setOpenLink }) {
  const editor = useSlate()
  const [addLinkPopup, setAddLinkPopup] = useState([false, []])
  const classes = useStyles()

  return (
    <FloatAppBar>
      <ToggleButtonGroup size="small">
        <MarkButton2 format="strong" icon={<FormatBoldRounded />} />
        <MarkButton2 format="italic" icon={<FormatItalic />} />
        <MarkButton2 format="subheader" text="Header" />

        {/* <MarkButton format="code" icon="code" /> */}
        {/* <BlockButton format="title" icon="title" /> */}
        {/* <BlockButton format="subheader" icon="looks_two" /> */}

        <Divider orientation="vertical" className={classes.divider} />

        <MarkButton2 format="numbered-list" icon={<FormatListNumbered />} />
        <MarkButton2 format="bulleted-list" icon={<FormatListBulleted />} />
        <MarkButton2 format="block-quote" icon={<FormatQuote />} />

        <Divider orientation="vertical" className={classes.divider} />

        <LinkButton editor={editor} setAddLinkPopup={setAddLinkPopup} />
      </ToggleButtonGroup>

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
    </FloatAppBar>
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
  const hasLink = isLinkActive(editor)
  return (
    <ToggleButton
      size="small"
      variant={hasLink ? "contained" : "outlined"}
      onClick={event => {
        setAddLinkPopup([true, editor.selection])
        //const url = window.prompt("Enter the URL of the link:")
      }}
    >
      <InsertLink />
    </ToggleButton>
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

const MarkButton2 = ({ format, icon, text }) => {
  const editor = useSlate()
  return (
    <ToggleButton
      size="small"
      value="left"
      aria-label="left aligned"
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      {icon ? icon : text}
    </ToggleButton>
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

const CoolAppBar = withStyles(theme => ({
  root: {
    backgroundColor: "#fafafa",
    //boxShadow: "none",
  },
}))(AppBar)

const FloatAppBar = ({ children }) => (
  <CoolAppBar>
    <MuiToolbar>
      <Container maxWidth="md">{children}</Container>
    </MuiToolbar>
  </CoolAppBar>
)

const useStyles = makeStyles(theme => ({
  paper: {
    display: "flex",
    border: `1px solid ${theme.palette.divider}`,
    flexWrap: "wrap",
  },
  divider: {
    //alignSelf: 'stretch',
    height: "auto",
    margin: theme.spacing(1, 0.5),
  },
}))
