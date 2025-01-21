import csv

input_file = "signups.txt"

# The column order in public.submissions
columns = [
    "id",
    "created_at",
    "soundcloud_url",
    "round_id",
    "additional_comments",
    "user_id"
]

print(f"INSERT INTO public.submissions ({', '.join(columns)}) VALUES")

values = []

with open(input_file, "r", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter="\t")
    for row in reader:
        # Skip rows that do not have exactly 6 columns
        if len(row) < 6:
            continue

        raw_id, raw_created_at, raw_soundcloud_url, \
            raw_round_id, raw_additional_comments, raw_user_id = row

        # Helper for numeric fields
        def sql_numeric(val):
            val = val.strip()
            # If empty or "\N", use NULL
            if val == "" or val == "\\N":
                return "NULL"
            return val  # no quotes for numeric

        # Helper for text fields
        def sql_text(val):
            val = val.strip()
            # If empty or "\N", use NULL
            if val == "" or val == "\\N":
                return "NULL"
            # Otherwise wrap in single quotes and escape internal quotes
            safe_val = val.replace("'", "''")
            return f"'{safe_val}'"

        out_id              = sql_numeric(raw_id)
        out_created_at      = sql_text(raw_created_at)
        out_soundcloud_url  = sql_text(raw_soundcloud_url)
        out_round_id        = sql_numeric(raw_round_id)
        out_additional_cmts = sql_text(raw_additional_comments)
        out_user_id         = sql_text(raw_user_id)

        # Build a single row as a tuple
        tuple_str = (
            f"({out_id}, {out_created_at}, {out_soundcloud_url}, "
            f"{out_round_id}, {out_additional_cmts}, {out_user_id})"
        )
        values.append(tuple_str)

# Join all tuples with a comma and line break, then end with a semicolon
values_str = ",\n    ".join(values)
print("    " + values_str + ";")
