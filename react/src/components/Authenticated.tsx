import React, { useState, MouseEvent } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, AppBar, Toolbar, IconButton,
    Icon, Typography, Menu, MenuItem, Drawer, Divider, List,
    ListItem, ListItemIcon, ListItemText,
    useMediaQuery, makeStyles, createStyles, Theme } from "@material-ui/core";

import { useAuth } from "../providers/AuthProvider";

import NotFound from "./NotFound";
import Employee from "./Employee";
import Employees from "./Employees";
import Project from "./Project";
import Projects from "./Projects";
import NewProject from "./NewProject";

import "./Authenticated.css";
import NewEmployee from "./NewEmployee";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        drawerTop: theme.mixins.toolbar
    })
);

const Authenticated = () => {
    const { logout } = useAuth();
    const { t } = useTranslation();

    const classes = useStyles();
    const isSmallScreen = useMediaQuery("(max-width: 900px)");
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(anchorEl);

    const handleLogout = () => {
        logout();
    };

    const handleDrawerToggle = () => {
      setDrawerOpen(!isDrawerOpen);
    };

    const handleUserMenuClick = (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleUserMenuClose = () => {
      setAnchorEl(null);
    };

    return (
        <Router basename={ process.env.PUBLIC_URL }>
            <div className="main-wrapper">
                <nav>
                    <Drawer
                        variant={ isSmallScreen ? "temporary" : "persistent" }
                        anchor="left"
                        className="drawer"
                        open={ isSmallScreen ? isDrawerOpen : true }
                        onClose={ handleDrawerToggle }
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                        classes={{
                          paper: "drawer-paper",
                        }}
                    >
                        <div className={ classes.drawerTop } />
                        <Divider />
                        <List>
                            <NavLink to="/projects" className="nav-link" activeClassName="active-nav-link">
                                <ListItem button key="projects">
                                    <ListItemIcon><Icon>assignment</Icon></ListItemIcon>
                                    <ListItemText primary={ t("label.projects") } />
                                </ListItem>
                            </NavLink>
                            <NavLink to="/employees" className="nav-link" activeClassName="active-nav-link">
                                <ListItem button key="employees">
                                    <ListItemIcon><Icon>people</Icon></ListItemIcon>
                                    <ListItemText primary={ t("label.employees") } />
                                </ListItem>
                            </NavLink>
                        </List>
                    </Drawer>
                </nav>
                <AppBar position="sticky">
                    <Toolbar>
                    { isSmallScreen && <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={ handleDrawerToggle }
                    >
                        <Icon>menu</Icon>
                    </IconButton> }
                    <Typography variant="h6" component="h1" className="appbar-title">
                        Staffing
                    </Typography>
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={ handleUserMenuClick }
                            color="inherit"
                        >
                            <Icon>account_circle</Icon>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={ anchorEl }
                            keepMounted
                            open={ userMenuOpen }
                            onClose={ handleUserMenuClose }
                        >
                            <MenuItem onClick={ handleLogout }>Logout</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <Container>
                    <Switch>
                        <Route exact path="/projects">
                            <Projects />
                        </Route>
                        <Route exact path="/projects/new">
                            <NewProject />
                        </Route>
                        <Route exact path="/projects/:projectId">
                            <Project />
                        </Route>
                        <Route exact path="/employees">
                            <Employees />
                        </Route>
                        <Route exact path="/employees/new">
                            <NewEmployee />
                        </Route>
                        <Route exact path ="/employees/:employeeId">
                            <Employee />
                        </Route>
                        <Redirect exact from="/" to="/projects" />
                        <Redirect exact from="/login" to="/projects" />
                        <Route path="*">
                            <NotFound />
                        </Route>
                    </Switch>
                </Container>
            </div>
        </Router>
    );
};

export default Authenticated;
