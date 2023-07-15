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

CS2040S = {
    'prerequisite' : 'If undertaking an Undergraduate Degree THEN ( must have completed 1 of CS1010/CS1010E/CS1010J/CS1010S/CS1010X/CS1101S at a grade of at least D AND must have completed 1 of CS1231/CS1231S/MA1100/MA1100T at a grade of at least D)',
    'prerequisiteRule' : "PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) CS1010:D, CS1010E:D, CS1010X:D, CS1101S:D, CS1010S:D, CS1010J:D AND COURSES (1) CS1231S:D, CS1231:D, MA1100:D, MA1100T:D)",
}

CS1231S = {
    'prerequisite' : 'If undertaking an Undergraduate Degree THEN ( must have completed 1 of CS1010/CS1010E/CS1010J/CS1010S/CS1010X/CS1101S at a grade of at least D AND must have completed 1 of CS1231/CS1231S/MA1100/MA1100T at a grade of at least D)',
    'prerequisiteRule' : "PROGRAM_TYPES IF_IN Undergraduate Degree THEN (COURSES (1) CS1010:D, CS1010E:D, CS1010X:D, CS1101S:D, CS1010S:D, CS1010J:D AND COURSES (1) CS1231S:D, CS1231:D, MA1100:D, MA1100T:D)",
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
    

def check_courses_prereqs(semesters):
    # Example:
    """
    Expect semesters to be list of list of strings (course codes)
    """
    courses_cache = {}

    total_num_of_semester = len(semesters)


    def evaluate_tokenised_rule(tokens, current_semester_index):
        """
        Recursive function that validates a tokenized rule.

        Args:
            tokens (list): List of tokens from a tokenised prerequisiteRule.

        Returns:
            bool: True if the module prequsite is validated, False otherwise.

        Raises:
            Exception: If there are unmatched parentheses or unknown tokens.

        Example:
            >>> tokens = ['(', 'COURSES (1)', 'CS1010', 'CS1010E', 'CS1010X', 'CS1101S', 'CS1010S', 'CS1010J', ')', 'AND', '']
            >>> result = evaluate_boolean(tokens)
            >>> print(f'Expected: True   Actual: {result}')  # True
        """
        # print(f'tokens {tokens}')
        stack = []
        token_index = 0
        while token_index < len(tokens):
            token = tokens[token_index]
            # print(f'{token_index} {token}')

            if tokens[token_index] == ')':
                # Evaluate the subexpression inside the brackets
                subexpr = []
                while stack and stack[-1] != '(':
                    subexpr.append(stack.pop())
                if not stack:
                    raise Exception('Unmatched )')
                stack.pop()  # Remove the '('
                subexpr.reverse()
                result = evaluate_tokenised_rule(subexpr, current_semester_index)
                stack.append(result)
                token_index += 1
            elif type(tokens[token_index]) == str and tokens[token_index].startswith('COURSES'):
                # Evaluate the COURSES or COURSES (n) expression
                n = 1
                if tokens[token_index].startswith('COURSES ('):
                    n = int(tokens[token_index][len('COURSES ('):-1])
                courses_and_remaining = tokens[token_index + 1:]
                courses = []
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
                count = sum(evaluate_tokenised_rule([x], current_semester_index) for x in courses)
                # n or more matches
                result = count >= n
                # print(f'courses result: {result}')
                ending_token_index = token_index + num_courses + 1
                # print(f'Last pos is: {ending_token_index} {tokens[ending_token_index]}')
                # Skip the bracket if opening bracket is right before it, aka '(COURSES (n) x x x)'
                if tokens[ending_token_index] == ')' and stack[-1] == '(':
                    # If closing bracket, check if there was an opening bracket and remove it
                    token_index = ending_token_index + 1 # Skip the ) for this
                    # print('removing the opening bracket for this')
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
            elif re.match('([A-Z]+[0-9]+[A-Z]*)', token) is not None:
                # Check course here
                if f'{token}' in courses_cache.keys():
                    cached_result = courses_cache[token]
                    print(f'cache hitted {token} {cached_result}')
                    result = cached_result[1] if cached_result[0] < current_semester_index else False
                else: 
                    latest_sem_before_number = current_semester_index if current_semester_index > 1 else 1
                    result = token in [course for semester in semesters[:latest_sem_before_number] for course in semester]
                    course_sem_index = [semesters.index(s) for s in semesters if token in s][-1] if result else float('inf')
                    if result and token in prereqs.keys():
                        result = evaluate_tokenised_rule(tokenise_prerequisite_rule(prereqs[token]['prerequisiteRule']), course_sem_index)
                    # courses_cache[token] = current_semester_index if result else float('inf')
                    courses_cache[token] = (course_sem_index, result)
                    print(f'{token} - {result}')
            else:
                raise Exception(f'Unknown token: {token}')

            if result is None:
                result = value
            elif operator == 'AND':
                result = result and value
            elif operator == 'OR':
                result = result or value

        return result
    
    result = True
    failed_prereq_check_courses = []
    for i in reversed(range(total_num_of_semester)):
        print(f'current sem {i}')
        
        if semesters[i] == []:
            continue
        for course in semesters[i]:
            if course in prereqs.keys():
                temp_result = evaluate_tokenised_rule(tokenise_prerequisite_rule(prereqs[course]['prerequisiteRule']), i)
                if not temp_result:
                    failed_prereq_check_courses.append(course)
                result = result and temp_result

    print(courses_cache)
    return {'validated' : result, 'failed_prereq_check_courses' : failed_prereq_check_courses}
                

# Make semester courses dict
semesters = [
    ['CS1101S', 'CS1231S'],
    ['CS2040S'],
    ['CS2030S'],
    ['CS2103']
]

prereqs = {
    'CS2030S' : CS2030S,
    'CS2040S' : CS2040S,
    'CS2103' : CS2103
}

# Test
print(check_courses_prereqs(semesters))
