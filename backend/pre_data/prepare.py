import csv
import uuid
import pathlib
import json
import requests

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
    max_len = 0
    with open('moduleInfo.json', 'r') as input_file, \
            open('moduleList.json', 'r') as list_file, \
            open('courses.csv', 'w') as output_file:
        listed_courses = json.load(list_file)
        courses = json.load(input_file)
        writer = csv.writer(output_file)
        writer.writerow(['course_code', 'course_name', 'number_of_units', \
                         'is_offered_in_sem1', 'is_offered_in_sem1'])
        print(f"{len(listed_courses)} courses found")
        courses_keys_list = [c['moduleCode'] for c in courses]
        for listed_course in listed_courses:
            course = courses[courses_keys_list.index(listed_course['moduleCode'])]
            max_len = len(course['moduleCode']) if len(course['moduleCode']) > max_len else max_len
            offered_sem_1, offered_sem_2 = check_semester(course, 1), check_semester(course, 2)
            row = [
                course['moduleCode'],
                course['title'],
                course['moduleCredit'],
                offered_sem_1,
                offered_sem_2
            ]
            writer.writerow(row)
        print(f'max length of course_code {max_len}')
else:
    print("skipping creating UUID for programmes_raw.csv")

# Prepare prerequisites
if not pathlib.Path('prerequisites.csv').exists():
    print("Creating prerequisites for prerequisites.csv")
    max_len = 0
    done = 0
    # Regex handles \n just fine, no need to strip
    with open('moduleList.json', 'r') as input_file, open('prerequisites.csv', 'w') as output_file:
        courses = json.load(input_file)
        writer = csv.writer(output_file)
        writer.writerow(['course_code', 'prerequisite_str'])
        for course in courses:
            try: 
                url = f'https://api.nusmods.com/v2/2023-2024/modules/{course["moduleCode"]}.json'  
                # print(f'Getting {url}\r', end='')
                info = requests.get(url).json()
                if 'prerequisiteRule' in info.keys(): 
                    prereq_str = info['prerequisiteRule']
                    row = [
                        course['moduleCode'],
                        prereq_str
                    ]
                    writer.writerow(row)
                    max_len = len(prereq_str) if len(prereq_str) > max_len else max_len
                done += 1
                print(f'Getting {url} {done:{len(str(len(courses)))}}/{len(courses)} courses done\r', end='')
            except Exception as e:
                print(f'\n{e}')
                print(f'On {course["moduleCode"]} skipping. . .')
        print(f'\nmax length of prerequisiteRule is {max_len} characters')
else:
    print("skipping creating prerequisites for prerequisites.csv")