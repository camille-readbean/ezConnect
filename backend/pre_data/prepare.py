import csv
import uuid
import pathlib

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

# if not pathlib.Path('courses.csv').exists():
#     print("Creating UUIDs for programmes.csv")
#     with open('programmes_raw.csv', 'r') as input_file, open('programmes.csv', 'w') as output_file:
#         reader = csv.reader(input_file)
#         writer = csv.writer(output_file)
#         writer.writerow(['id', 'title'])
#         for row in reader:
#             writer.writerow([str(uuid.uuid4()), row[0]])
# else:
#     print("skipping creating UUID for programmes_raw.csv")
