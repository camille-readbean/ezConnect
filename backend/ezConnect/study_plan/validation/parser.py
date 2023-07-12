import re
# Remember to import study plan

#TODO
CS2030S = {
    'prerequisite' : 'if undertaking an Undergraduate Degree then ( must have completed 1 of CS1010/CS1010E/CS1010J/CS1010S/CS1010X/CS1101S at a grade of at least D )',
    'prerequisiteRule' : "PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) CS1010:D, CS1010E:D, CS1010X:D, CS1101S:D, CS1010S:D, CS1010J:D)",
    'prerequisite_parsed' : [
        {
            "OR 1" : [
                {"OR 1" : ['CS1010', 'CS1010E', 'CS1010X', 'CS1101S', 'CS1010S', 'CS1010J']},
            ]
        }
    ]
}

CS2103 = {
    'prerequisite' : 'if undertaking an Undergraduate Degree then ( ( must have completed 1 of "CS1020"/"CS1020E"/"CS2020" at a grade of at least D ) or ( must have completed 1 of CS2030/CS2030S at a grade of at least D and must have completed 1 of CS2040/CS2040C/CS2040S at a grade of at least D ) )',
    'prerequisiteRule' : "PROGRAM_TYPES IF_IN Undergraduate Degree THEN ((COURSES (1) CS2020:D, CS1020:D, CS1020E:D) OR (COURSES (1) CS2030S:D, CS2030:D AND COURSES (1) CS2040S:D, CS2040:D, CS2040C:D))",
    'prerequisite_parsed' : [
        {
            "OR 1" : [
                {"OR 1" : ["CS2020", "CS1020", "CS1020E"]},
                {"AND" : 
                    [
                        [{"OR 1" : ["CS2030S", "CS2030"]}],
                        [{"OR 1" : ["CS2040S", "CS2040", "CS2040C"]}]
                    ]
                }
            ]
        }
    ]
}


ST2132 = {
    'prerequisite' : "If undertaking an Undergraduate Degree THEN ( must have completed ST2334 at a grade of at least D OR must have completed ST2131 at a grade of at least D OR must have completed MA2116 at a grade of at least D OR must have completed MA2216 at a grade of at least D)",
    'prerequisiteRule' : "PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES ST2334:D OR COURSES ST2131:D OR COURSES MA2116:D OR COURSES MA2216:D)",
    'prerequisite_parsed' : [
        {"OR" : ["ST2334", "ST2131", "MA2116", "MA2216"]}
    ]
}


"CS4225"
prerequisite = "If undertaking an Undergraduate Degree THEN ( must have completed 1 of CS2102/IT2002 at a grade of at least D)"
prerequisiteRule = "PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) CS2102:D, IT2002:D)"

[
    {"OR 1" : ["CS2102", "IT2002"]}
]


CS4248 = {
    'prerequisite' : "If undertaking an Undergraduate Degree THEN (( must have completed 1 of CS2109S/CS3243 at a grade of at least D AND must have completed 1 of EE2012/EE2012A/MA2116/MA2216/ST2131/ST2334/YSC2243 at a grade of at least D) AND ( must have completed 1 of MA1102R/MA1505/MA1507/MA1521/MA2002/YSC1216 at a grade of at least D OR must have completed all of MA1511/MA1512 at a grade of at least D))",
    'prerequisiteRule' : "PROGRAM_TYPES IF_IN Undergraduate Degree THEN ((COURSES (1) CS3243:D, CS2109S:D AND COURSES (1) EE2012A:D, EE2012:D, ST2131:D, MA2216:D, MA2116:D, ST2334:D, YSC2243:D) AND (COURSES (1) MA1505:D, MA1507:D, MA1521:D, MA1102R:D, YSC1216:D, MA2002:D OR COURSES (2) MA1511:D, MA1512:D))",
    'prerequisite_parsed' : [
        {
            "AND" : [
            [
                {"AND" : [
                    {"OR 1" : ["CS3243", "CS2109S"]},
                    {"OR 1" : ["EE2012A", "EE2012", "ST2131", "MA2216", "MA2116", "ST2334", "YSC2243"]}
                ]}
            ],
            [
                {"OR" :   [
                    {"OR 1" : ["MA1505", "MA1507", "MA1521", "MA1102R", "YSC1216", "MA2002"]},
                    {"OR 2" : ["MA1511", "MA1512"]}
                ]}
            ]

            ]
        }
    ]   
}

def tokenise_prerequisite_rule(rule_string: str) -> list[str]:
    rule = rule_string.split('THEN')[1][1:]
    # print(rule)
    regex_pattern = re.compile(r'((COURSES( \([1-9]\))?)|([A-Z]+[0-9]+[A-Z]*)(?=(\:[A-F])?)|\(|\)|OR|AND)')
    # for m in re.finditer(regex_pattern, rule):
        # print('%02d-%02d: %s' % (m.start(), m.end(), m.group(0)))
    # print(regex_pattern.findall(rule))
    tokens = [m[0] for m in regex_pattern.findall(rule) if m]
    print(tokens)
    return tokens
    
"""
Recursive function that validates a tokenised rule
Example input: ['(', 'COURSES (1)', 'CS1010', 'CS1010E', 'CS1010X', 'CS1101S', 'CS1010S', 'CS1010J', ')', 'AND', '']
CS1101S is true in user_study_plan
Return true
"""
def eval_tokenised_rule(tokenised_rule: list[str|bool]) -> bool:
    # Max len
    result_stack = []
    # Possible state, 'AND', 'OR', 'COURSES', None
    # nest_stack = []
    operation_stack = []
    # For testing
    completed_courses = ['CS1101S']
    course_pattern = re.compile(r'([A-Z]+[0-9]+[A-Z]*)')
    if len(tokenised_rule) == 1 and type(tokenised_rule[0]) == str:
        return tokenised_rule[0] in completed_courses
    # for i in range(tokenised_rule):
    #     # Go down one layer
    #     if tokenised_rule[i] == '(':
    #         result_stack = 
    #     if tokenised_rule[i] == 'AND':
    #         result_stack = result_stack.pop() and 

    #     if course_pattern.match(tokenised_rule[i]) is not None:

    

# CS2030S_prereqs = tokenise_prerequisite_rule(CS2030S['prerequisiteRule'])

# print(eval_tokenised_rule(['CS2100']))



# def evaluate_course_tokens(tokens, completed_courses):
#     required_courses = set()
#     requirements_stack = []
#     current_requirement = set()
#     operation_stack = []

#     for token in tokens:
#         if token == '(':
#             requirements_stack.append(current_requirement)
#             operation_stack.append('AND')
#             current_requirement = set()
#         elif token == ')':
#             previous_requirement = requirements_stack.pop()
#             operation = operation_stack.pop()
#             if operation == 'OR':
#                 current_requirement = previous_requirement.union(current_requirement)
#             else:
#                 current_requirement = previous_requirement.intersection(current_requirement)
#         elif token == 'OR':
#             operation_stack.append('OR')
#         elif token == 'AND':
#             operation_stack.append('AND')
#         elif token.startswith('COURSES'):
#             # Extract the number in the parenthesis, if present
#             matches = re.findall(r'\((\d+)\)', token)
#             if matches:
#                 required_courses.update(matches)
#         else:
#             required_courses.add(token)
    
#     for course in required_courses:
#         if course in completed_courses:
#             current_requirement.add(course)
    
#     return len(current_requirement) > 0

# Example usage
# tokens = ['(', 'COURSES (1)', 'CS1010', 'CS1010E', 'CS1010X', 'CS1101S', 'CS1010S', 'CS1010J', ')']
# completed_courses = ['CS1010', 'CS1010E', 'CS2103T', 'MA2216', 'CS2030', 'CS2040S']

# result = evaluate_course_tokens(
#     tokenise_prerequisite_rule(CS4248["prerequisiteRule"]), 
#     completed_courses)
# print(result)

# print(ST2132['prerequisite'])
# print()

"""
Recursive function that validates a tokenised rule
Example input: ['(', 'COURSES (1)', 'CS1010', 'CS1010E', 'CS1010X', 'CS1101S', 'CS1010S', 'CS1010J', ')', 'AND', '']
CS1101S is true in user_study_plan
Return true
"""
def evaluate_boolean(tokens):
    # print(tokens)
    stack = []
    token_index = 0
    while token_index < len(tokens):
        token = tokens[token_index]
        # print(f'{token_index} {token}')
        # go backwards
        if tokens[token_index] == ')':
            # Evaluate the subexpression inside the brackets
            subexpr = []
            while stack and stack[-1] != '(':
                subexpr.append(stack.pop())
            if not stack:
                raise Exception('Unmatched )')
            stack.pop()  # Remove the '('
            subexpr.reverse()
            result = evaluate_boolean(subexpr)
            stack.append(result)
            token_index += 1
        # this seeks forward
        elif type(tokens[token_index]) == str and tokens[token_index].startswith('COURSES'):
            # Evaluate the COURSES or COURSES (n) expression
            n = 1
            if tokens[token_index].startswith('COURSES ('):
                n = int(tokens[token_index][len('COURSES ('):-1])
            courses_and_remaining = tokens[token_index + 1:]
            courses = []
            # Eval all courses
            i = 0
            # print(f'courses_and_remaining {courses_and_remaining}')
            while courses_and_remaining and  i < len(courses_and_remaining)\
                    and courses_and_remaining[i] != 'OR'\
                    and courses_and_remaining[i] != 'AND' \
                    and courses_and_remaining[i] != ')':
                courses.append(courses_and_remaining[i])
                i += 1
            # print(f'courses: {courses}')
            num_courses = len(courses)
            count = sum(evaluate_boolean([x]) for x in courses)
            # n or more matches
            result = count >= n
            # print(f'courses result: {result}')
            ending_token_index = token_index + num_courses
            # print(f'Last pos is: {ending_token_index} {tokens[ending_token_index]}')
            # Skip the bracket
            if tokens[ending_token_index] == ')':
                token_index = ending_token_index + 1 # Skip the ) for this
                # If closing bracket, check if there was an opening bracket and remove it
                if stack[-1] == '(' and tokens[token_index - 1] == '(':
                    print('removing the opening bracket for this')
                    stack.pop()
            # Skip all the processed tokens
            else:
                token_index = ending_token_index
            stack.append(result)
            continue
        else:
            if token == 'TRUE':
                stack.append(True)
            elif token == 'FALSE':
                stack.append(False)
            else:
                stack.append(token)
            token_index += 1
    # print('stack: ' + str(stack))

    # Evaluate the remaining expression on the stack
    result = None
    operator = None
    for token in stack:
        if token in ('AND', 'OR'):
            operator = token
        elif token == 'TRUE' or token == True:
            value = True
        elif token == 'FALSE' or token == False:
            value = False
        else:
            raise Exception(f'Unknown token: {token}')

        if result is None:
            result = value
        elif operator == 'AND':
            result = result and value
        elif operator == 'OR':
            result = result or value

    return result

# tokens = ['(', 'COURSES (2)', 'TRUE', 'FALSE', 'TRUE', ')']
# result = evaluate_boolean(tokens)
# print(f'Expected: True   Actual: {result}')  # True

# tokens = ['(', 'COURSES (2)', 'TRUE', 'FALSE', 'FALSE', ')']
# result = evaluate_boolean(tokens)
# print(f'Expected: False  Actual: {result}')  # False


# tokens = ['(', '(', 'TRUE', 'AND', 'TRUE', ')', 'AND', '(', 'FALSE', 'OR', '(', 'COURSES (1)', 'TRUE', 'FALSE', ')', ')', ')']
# result = evaluate_boolean(tokens)
# print(f'Expected: True   Actual: {result}')  # True

# tokens = ['(', '(', 'TRUE', 'AND', 'TRUE', ')', 'AND', '(', 'FALSE', 'OR', '(', 'TRUE', 'OR', 'FALSE', ')', ')', ')']
# result = evaluate_boolean(tokens)
# print(f'Expected: True   Actual: {result}')  # True


tokens = ['(', 
            '(', 
              'COURSES (1)', 'TRUE', 'TRUE', 
              'AND', 
              'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 'FALSE', 
            ')',
            'AND', 
            '(', 
                'COURSES (1)', 'TRUE', 'TRUE', 'TRUE', 'TRUE', 'TRUE', 'TRUE', 
                'OR', 
                'COURSES (2)', 'FALSE', 'FALSE', 
            ')', 
        ')']
result = evaluate_boolean(tokens)
print(f'Expected: False  Actual: {result}')  # False

tokens = ['(', 
            '(', 
              'COURSES (1)', 'TRUE', 'TRUE', 
              'AND', 
              'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'FALSE', 
            ')',
            'AND', 
            '(', 
                'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'TRUE', 'TRUE', 
                'OR', 
                'COURSES (2)', 'FALSE', 'FALSE', 
            ')', 
        ')']
result = evaluate_boolean(tokens)
print(f'Expected: False  Actual: {result}')  # False


tokens = ['(', 
            '(', 
              'COURSES (1)', 'TRUE', 'TRUE', 
              'AND', 
              'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'FALSE', 
            ')',
            'AND', 
            '(', 
                'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'TRUE', 'TRUE', 
                'OR', 
                'COURSES (2)', 'TRUE', 'FALSE', 
            ')', 
        ')']
result = evaluate_boolean(tokens)
print(f'Expected: False  Actual: {result}')  # False

tokens = ['(', 
            '(', 
              'COURSES (1)', 'FALSE', 'FALSE', 
              'AND', 
              'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'FALSE', 
            ')',
            'AND', 
            '(', 
                'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'TRUE', 'TRUE', 
                'OR', 
                'COURSES (2)', 'TRUE', 'TRUE', 
            ')', 
        ')']
result = evaluate_boolean(tokens)
print(f'Expected: False  Actual: {result}')  # False

tokens = ['(', 
            '(', 
              'COURSES (1)', 'TRUE', 'TRUE', 
              'AND', 
              'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'FALSE', 'FALSE', 'FALSE', 
            ')',
            'AND', 
            '(', 
                'COURSES (1)', 'FALSE', 'FALSE', 'FALSE', 'TRUE', 'TRUE', 'TRUE', 
                'OR', 
                'COURSES (2)', 'TRUE', 'TRUE', 
            ')', 
        ')']
result = evaluate_boolean(tokens)
print(f'Expected: True   Actual: {result}')  # True