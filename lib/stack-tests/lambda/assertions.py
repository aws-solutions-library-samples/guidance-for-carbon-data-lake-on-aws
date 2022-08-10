
def assert_equals(actual_value, expected_value, error_message=""):
    if (actual_value!=expected_value):
        raise AssertionError(error_message or "expected "+expected_value+" but got "+actual_value)