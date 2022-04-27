# this takes an emissions factors table as input and parses it to generate json of emissions factors outputs
import datetime
import csv
import json
import time
import os

date_entry = datetime.datetime.today().strftime('%Y-%m-%d')
csvFilePath = r'ghg_emissionsfactor_comprehensive_Jan2022.csv'
jsonFileName = rf'emissions_factor_model_{date_entry}.json'
jsonFilePath = os.path.join(os.getcwd(), jsonFileName)
start = time.perf_counter()
finish = time.perf_counter()

def parse_single_factor(row):
    model = {
        "category": row["category"],
        "activity": row["lookup name"],
        "scope": row["scope"],
        "emissions_factor_standards": {
            "ghg": 
            {
                "coefficients": {
                    "co2_factor": row["CO2 Factor (kg / unit)"],
                    "ch4_factor": row["CH4 Factor (kg / unit)"],
                    "n2o_factor": row["N2O Factor (kg / unit)"],
                    "biofuel_co2": row["Biofuel?"],
                    "AR4-kgco2e": row["AR4 (kgCO2e)"],
                    "AR5-kgco2e": row["AR5 (kgCO2e)"],
                    "units": row["Units"]
                },
                "last_updated": date_entry,
                "source": "ghg_protocol_emissions_factor_calculator - https://ghgprotocol.org/ghg-emissions-calculation-tool",
                "source_origin": row["Source"]
            }
        }
    }
    return model

def csv_to_json(csvFilePath, jsonFilePath):
    jsonArray = []
      
    #read csv file
    with open(csvFilePath, encoding='utf-8-sig') as csvf: 
        #load csv file data using csv library's dictionary reader
        csvReader = csv.DictReader(csvf) 

        #convert each csv row into python dict
        for row in csvReader:
            print(row)
            parsed_row = parse_single_factor(row)
            #add this python dict to json array
            jsonArray.append(parsed_row)
  
    #convert python jsonArray to JSON String and write to file
    with open(jsonFilePath, 'w', encoding='utf-8') as jsonf: 
        jsonString = json.dumps(jsonArray, indent=4)
        jsonf.write(jsonString)
    print(f"Conversion 100.000 rows completed successfully in {finish - start:0.4f} seconds")


csv_to_json(csvFilePath, jsonFilePath)