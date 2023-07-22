import csv
import json

def csv_to_dict_of_dicts(file_path):
    result = {}
    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            course_code = row['course_code']
            course_name = row['course_name']
            number_of_units = row['number_of_units']
            is_offered_in_sem1 = row['is_offered_in_sem1']
            is_offered_in_sem2 = row['is_offered_in_sem2']
            result[course_code] = {
                'course_name': course_name,
                'number_of_units': number_of_units,
                'is_offered_in_sem1': is_offered_in_sem1,
                'is_offered_in_sem2': is_offered_in_sem2
            }
    return result

file_path = 'courses.csv'
data_dict = csv_to_dict_of_dicts(file_path)

with open('courseDictionary.json', 'w') as json_file:
    json.dump(data_dict, json_file)

print("done!")