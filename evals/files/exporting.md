# Exporting data

## Overview

The exporter pulls a dataset out of the database and writes it to a file.
We recently rewrote this to be much faster. As of v1.4 it also handles
larger datasets than it used to.

## Usage

Run the exporter with a dataset name:

```bash
export orders --out ./orders
```

The exporter pulls a dataset out of the database and writes it to a file.
By default it writes CSV.

## The --format flag

Previously the exporter only wrote CSV. We've now added a `--format` flag
so you can pick the output format:

- `--format csv`: comma-separated values (default)
- `--format tsv`: tab-separated values
- `--format json`: newline-delimited JSON

```bash
export orders --format json
```

## Notes

Hopefully this covers most use cases. The `--out` flag sets the output path;
note that it used to be called `--output` before we renamed it.
