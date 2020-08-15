# Human resource allocation decision support system (HRA DSS)

This project is part of a Master's thesis for Lappeenranta-Lahti
University of Technology LUT (LUT University).

The software can be used to support human resource allocation decisions
in a project-based organisation. It consists of a database, back-end,
and front-end.

Back-end and front-end have dedicated `README`-files. The component are
located in `node` and `react` -folders, respectively.

## Prerequisites

To utilise the `docker-compose`-file supplied with this project,
`docker` is required.

## Installation

The components should be installed in the following order:

1. Database
2. Back-end
3. Front-end

### Database

Run the following command in project root folder:

```
docker-compose up -d
```

The `PostgreSQL` database is now running on port `5432`.
`pgAdmin` can be accessed via port `5050`.

### Back-end

Follow the `README` in `node`-folder.

### Front-end

Follow the `README` in `react`-folder.
