import json

# Creates a Hash Key based on an Emission Factor lookup fields
# values are sorted by lookup field name and separated with #
def hash_key(emission_factor):
    with open('emissionFactorsLookupFields.json') as fields_file:
        fields = json.loads(fields_file.read())
    lookup_values = list(map(lambda field: str(emission_factor[field]), fields))
    return '#'.join(lookup_values)