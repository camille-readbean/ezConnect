import re
from ezConnect.models import Course


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
    
def __get_prereq_rule(course_code: str) -> None | str:
    course: Course = Course.query.get(course_code)
    if not course:
        # Some courses as prereq are not in the database cause they are OLD
        return None
        # raise ValueError(f'Course {course_code} not found')
    prereq_rule = course.prerequisites[0].prerequisite_str if course.prerequisites != [] else None
    return prereq_rule

def check_courses_prereqs(semesters):
    """
    Expect semesters to be list of list of strings (course codes)  

    Returns: 
    dict: { 
        'validated' : True | False, 
        'failed_prereq_check_courses' : List[str]
    }
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
                    latest_sem_before_number = current_semester_index if current_semester_index > 0 else 0
                    result = token in [course for semester in semesters[:latest_sem_before_number] for course in semester]
                    course_sem_index = [semesters.index(s) for s in semesters if token in s][-1] if result else float('inf')
                    prereq = __get_prereq_rule(token)
                    if result and prereq is not None:
                        result = evaluate_tokenised_rule(
                            tokenise_prerequisite_rule(prereq), course_sem_index)
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
            prereq = __get_prereq_rule(course)
            if prereq is not None:
                temp_result = evaluate_tokenised_rule(tokenise_prerequisite_rule(prereq), i)
                if not temp_result:
                    failed_prereq_check_courses.append(course)
                result = result and temp_result

    print(courses_cache)
    return {'validated' : result, 'failed_prereq_check_courses' : failed_prereq_check_courses}
                

