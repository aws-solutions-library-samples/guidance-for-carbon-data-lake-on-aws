
class EmissionOutput:
    def __init__(self, activity_event_id, co2, ch4, n2o, co2e_ar4, co2e_ar5, emissions_factor_ar4, emissions_factor_ar5):
        self.activity_event_id = activity_event_id
        self.co2 = co2
        self.ch4 = ch4
        self.n2o = n2o
        self.co2e_ar4 = co2e_ar4
        self.co2e_ar5 = co2e_ar5
        self.emissions_factor_ar4 = emissions_factor_ar4
        self.emissions_factor_ar5 = emissions_factor_ar5