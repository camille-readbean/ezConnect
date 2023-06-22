import csv
import pathlib
import json

if not pathlib.Path('degrees.json').exists():
    print("Creating json for degrees.csv")
    with open('degrees.csv', 'r') as input_file, open('degrees.json', 'w') as output_file:
        reader = csv.reader(input_file)
        next(reader, None)
        data = []
        for row in reader:
            data.append({'id' : row[0], 'title' : row[1]})
        json.dump(data, output_file)
else:
    print("skipping creating json for degrees.csv")

if not pathlib.Path('programmes.json').exists():
    print("Creating json for programmes.csv")
    with open('programmes.csv', 'r') as input_file, open('programmes.json', 'w') as output_file:
        reader = csv.reader(input_file)
        next(reader, None)
        data = []
        for row in reader:
            data.append({'id' : row[0], 'title' : row[1]})
        json.dump(data, output_file)
else:
    print("skipping creating json for programmes.csv")

if not pathlib.Path('courses.json').exists():
    print("Creating json for courses.csv")
    with open('courses.csv', 'r') as input_file, open('courses.json', 'w') as output_file:
        reader = csv.reader(input_file)
        next(reader, None)
        data = []
        for row in reader:
            data.append({'course_code' : row[0], 'course_name' : row[1]})
        json.dump(data, output_file)
else:
    print("skipping creating json for courses.csv")