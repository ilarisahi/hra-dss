import React from "react";
import { ProjectSearchEmployeeResult } from "../interfaces";
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Badge, Chip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useGlobalStyles } from "../utils/global";

const ProjectSearchEmployees = (props: { results: Array<ProjectSearchEmployeeResult>}) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    
    return (
        <TableContainer component={ Box }>
            <Table aria-label="employee table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            { t("label.employee") }
                        </TableCell>
                        <TableCell>
                            { t("label.score") }
                        </TableCell>
                        <TableCell>
                            { t("label.skills") }
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { props.results.map((result, index) => (
                        <TableRow key={ index }>
                            <TableCell>
                                { result.employee.name }
                            </TableCell>
                            <TableCell>
                                { result.score.toFixed(2) }
                            </TableCell>
                            <TableCell>
                                <Box className={ [globalClasses.chipContainer, globalClasses.topMarginSmall].join(" ") }>
                                    { result.employee.skills.map((skill, index) => (
                                        <Badge
                                            key={ index }
                                            badgeContent={ skill.level.toFixed(2) }
                                            color="primary"
                                        >
                                            <Chip
                                                variant="outlined"
                                                color="primary"
                                                label={ skill.name }
                                            />
                                        </Badge>
                                    )) }
                                </Box>
                            </TableCell>
                        </TableRow>
                    )) }
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProjectSearchEmployees;
