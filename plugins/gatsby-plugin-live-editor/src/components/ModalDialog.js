import React from "react"

import {
  Button,
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Typography,
  IconButton,
  withStyles,
} from "@material-ui/core/"

import CloseIcon from "@material-ui/icons/Close"

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
})

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent)

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions)

const noop = e => {
  console.log("Model dialog onClick ", e)
}

export default function ModalDialog({
  title,
  open,
  setOpen,
  children,
  actions = {
    primary: {
      action: undefined,
      label: undefined,
    },
    secondary: {
      action: undefined,
      label: undefined,
    },
  },
}) {
  const handleClose = () => setOpen(false)

  const { primary, secondary } = actions
  return (
    <div>
      <Dialog
        //keepMounted
        disablePortal={true}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        //fullScreen={fullScreen}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {title}
        </DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions>
          {secondary && (
            <Button
              onClick={secondary.action || noop}
              color="secondary"
              variant="outlined"
            >
              {secondary.label}
            </Button>
          )}
          {primary && (
            <Button
              onClick={primary.action || noop}
              color="primary"
              variant="contained"
            >
              {primary.label}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}
