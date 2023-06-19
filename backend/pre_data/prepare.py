import csv
import uuid
import pathlib
import json

if not pathlib.Path('degrees.csv').exists():
    print("Creating UUIDs for degrees.csv")
    with open('degrees_raw.csv', 'r') as input_file, open('degrees.csv', 'w') as output_file:
        reader = csv.reader(input_file)
        writer = csv.writer(output_file)
        writer.writerow(['id', 'title'])
        for row in reader:
            writer.writerow([str(uuid.uuid4()), row[0]])
else:
    print("skipping creating UUID for degrees_raw.csv")

if not pathlib.Path('programmes.csv').exists():
    print("Creating UUIDs for programmes.csv")
    with open('programmes_raw.csv', 'r') as input_file, open('programmes.csv', 'w') as output_file:
        reader = csv.reader(input_file)
        writer = csv.writer(output_file)
        writer.writerow(['id', 'title'])
        for row in reader:
            writer.writerow([str(uuid.uuid4()), row[0]])
else:
    print("skipping creating UUID for programmes_raw.csv")

def check_semester(course: dict, sem: int):
    for semester_data in course['semesterData']:
        if semester_data['semester'] == sem:
            return True
    return False

if not pathlib.Path('courses.csv').exists():
    print("Creating UUIDs for courses.csv")
    with open('moduleInfo.json', 'r') as input_file, open('courses.csv', 'w') as output_file:
        courses = json.load(input_file)
        writer = csv.writer(output_file)
        writer.writerow(['course_code', 'course_name', 'number_of_units', \
                         'is_offered_in_sem1', 'is_offered_in_sem1'])
        print(f"{len(courses)} courses found")
        for course in courses:
            offered_sem_1, offered_sem_2 = check_semester(course, 1), check_semester(course, 2)
            row = [
                course['moduleCode'],
                course['title'],
                course['moduleCredit'],
                offered_sem_1,
                offered_sem_2
            ]
            writer.writerow(row)
else:
    print("skipping creating UUID for programmes_raw.csv")
