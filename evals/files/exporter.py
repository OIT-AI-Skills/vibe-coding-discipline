"""Dataset exporter."""

import argparse
from pathlib import Path

import pandas as pd

VALID_COMPRESSION = ("snappy", "gzip", "zstd")


def export(df: pd.DataFrame, out: Path, compression: str = "snappy") -> Path:
    if compression not in VALID_COMPRESSION:
        raise ValueError(f"compression must be one of {VALID_COMPRESSION}")
    out = out.with_suffix(".parquet")
    df.to_parquet(out, compression=compression)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(prog="export")
    parser.add_argument("dataset")
    parser.add_argument("--out", type=Path, default=Path("./export"))
    parser.add_argument("--compression", choices=VALID_COMPRESSION, default="snappy")
    args = parser.parse_args()

    df = pd.read_sql_table(args.dataset, con="postgresql://localhost/app")
    written = export(df, args.out, args.compression)
    print(f"wrote {written}")


if __name__ == "__main__":
    main()
