import csv

def get_stripped_dict(filepath):
    '''Reads monthly climate summary csv into a dictionary, discarding unnecessary values.'''
    stripped = {}
    with open(filepath, encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        # Convert each row into a dictionary
        # and add it to data
        for row in reader:
            if row["S"]:
                key = row['Clim_ID']
                stripped[key] = {"Long": row["Long"],
                                "Lat": row["Lat"],
                                "Stn_Name": row["Stn_Name"],
                                "Clim_ID": row["Clim_ID"],
                                "S": round(float(row["S"]), 1)}
    return stripped

def write_year_total(filepath, data):
    '''Write yearly total snowfall dictionary into one csv'''
    with open(filepath, 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["Long", "Lat", "Stn_Name", "Clim_ID", "S"])
        writer.writeheader()
        writer.writerows(list(data.values()))

def write_total(filepath, data, first, year):
    '''Write yearly total snowfall dictionary into one csv'''
    for key in data:
        data[key]["time"] = year
    with open(filepath, 'a') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["Long", "Lat", "Stn_Name", "Clim_ID", "S", "time"])
        if first:
            writer.writeheader()
        writer.writerows(list(data.values()))

def sum_snowfall():
    year = 1997
    month = 7
    while year < 2022:
        end = False
        year_total = {}
        while not end:
            path = f"data/{year-(month<7)}/en_climate_summaries_ON_{str(month).zfill(2)}-{year}.csv"
            new_stripped = get_stripped_dict(path)
            if year_total == {}:
                year_total = new_stripped
            else:
                for key in new_stripped:
                    if key in year_total:
                        year_total[key]["S"] += new_stripped[key]["S"]
            if month == 6:
                end = True
            elif month == 12:
                month = 1
                year += 1
            else:
                month += 1
        year_path = f"data/{year-1}/en_climate_summaries_ON_{year-1}.csv"
        write_year_total(year_path, year_total)
        first = year-1 == 1997
        total_path = f"data/en_climate_summaries_ON.csv"
        write_total(total_path, year_total, first, year-1)
        month = 7



if __name__ == "__main__":
    sum_snowfall()