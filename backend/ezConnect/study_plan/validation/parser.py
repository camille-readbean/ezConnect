import re

#TODO
CS2030S = {
    'prerequisite' : "if undertaking an Undergraduate Degree then ( must have completed 1 of CS1010/CS1010E/CS1010J/CS1010S/CS1010X/CS1101S at a grade of at least D)",
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


"CS4248"
prerequisite = "If undertaking an Undergraduate Degree THEN (( must have completed 1 of CS2109S/CS3243 at a grade of at least D AND must have completed 1 of EE2012/EE2012A/MA2116/MA2216/ST2131/ST2334/YSC2243 at a grade of at least D) AND ( must have completed 1 of MA1102R/MA1505/MA1507/MA1521/MA2002/YSC1216 at a grade of at least D OR must have completed all of MA1511/MA1512 at a grade of at least D))"
prerequisiteRule = "PROGRAM_TYPES IF_IN Undergraduate Degree THEN ((COURSES (1) CS3243:D, CS2109S:D AND COURSES (1) EE2012A:D, EE2012:D, ST2131:D, MA2216:D, MA2116:D, ST2334:D, YSC2243:D) AND (COURSES (1) MA1505:D, MA1507:D, MA1521:D, MA1102R:D, YSC1216:D, MA2002:D OR COURSES (2) MA1511:D, MA1512:D))"
[
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

def parse_pre_rule(rule_string):
    # TODO: REGEX = (COURSES( \([1-9]\))?)|([A-Z]*[0-9]*[A-Z]*(?=(\:[A-F])))|\(|\)|OR|AND
    rule = rule_string.split('THEN')[1][1:]
    print(rule)
    regex_pattern = re.compile(r'((COURSES( \([1-9]\))?)|([A-Z]+[0-9]+[A-Z]*)(?=(\:[A-F])?)|\(|\)|OR|AND)')
    # return regex.findall(rule)
    for m in re.finditer(regex_pattern, rule):
        print('%02d-%02d: %s' % (m.start(), m.end(), m.group(0)))
    # result = [x for tup in regex_pattern.findall(rule) for x in tup if x]
    print(regex_pattern.findall(rule))
    print([m[0] for m in regex_pattern.findall(rule) if m])
    # matches = regex_pattern.findall(rule)
    # flattened_list = [x for tup in regex_pattern.findall(rule) for x in tup if x]
    # return flattened_list


print(parse_pre_rule(CS2030S['prerequisiteRule'] + " AND CS1010"))