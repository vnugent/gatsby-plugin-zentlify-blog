import React from "react"

import { Grid, AppBar, Toolbar, Container, Hidden } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"

const MinAppBar = withStyles(theme => ({
  root: {
    minHeight: "48px",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    boxShadow: "none",
  },
}))(AppBar)

export const SlimToolbar = withStyles(theme => ({
  root: {
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
}))(Toolbar)

export default function BearAppBar({ branding, rightMenu, children }) {
  return (
    <MinAppBar>
      <Container maxWidth="lg">
        <Grid container alignItems="center" justify="space-between">
          <Hidden mdDown>
            <Grid item md={1}>
              <SlimToolbar>{branding || <div>&nbsp;</div>}</SlimToolbar>
            </Grid>
          </Hidden>
          <Grid item sm={12} md={10}>
            <Container
              maxWidth="md"
              style={{
                padding: 0,
                display: "flex",
                flexGrow: 1,
                justifyContent: "space-between",
              }}
            >
              {children}
            </Container>
          </Grid>
          <Grid item md={1}>
            <Hidden mdDown>{rightMenu || <div>&nbsp;</div>}</Hidden>
          </Grid>
        </Grid>
      </Container>
    </MinAppBar>
  )
}
