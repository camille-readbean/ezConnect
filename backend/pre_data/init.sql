BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 22be9cc508e8

CREATE TABLE course (
    course_code VARCHAR(12) NOT NULL,
    course_name VARCHAR(100),
    number_of_units FLOAT NOT NULL,
    is_offered_in_sem1 BOOLEAN NOT NULL,
    is_offered_in_sem2 BOOLEAN NOT NULL,
    PRIMARY KEY (course_code)
);

CREATE TABLE degree (
    id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE programme (
    id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE users (
    azure_ad_oid UUID NOT NULL,
    name VARCHAR(50),
    email VARCHAR(120),
    year INTEGER,
    PRIMARY KEY (azure_ad_oid),
    UNIQUE (email)
);

CREATE TABLE course_user (
    course_code VARCHAR(10),
    user_id UUID,
    FOREIGN KEY(course_code) REFERENCES course (course_code),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE degree_user (
    degree_id UUID,
    user_id UUID,
    FOREIGN KEY(degree_id) REFERENCES degree (id),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE mentor_mentee_match (
    id UUID NOT NULL,
    mentor_id UUID NOT NULL,
    mentee_id UUID NOT NULL,
    course_code VARCHAR(12) NOT NULL,
    status VARCHAR(20),
    PRIMARY KEY (id),
    FOREIGN KEY(course_code) REFERENCES course (course_code),
    FOREIGN KEY(mentee_id) REFERENCES users (azure_ad_oid),
    FOREIGN KEY(mentor_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE mentor_posting (
    id UUID NOT NULL,
    date_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_published BOOLEAN NOT NULL,
    description TEXT,
    title VARCHAR(50),
    user_id UUID NOT NULL,
    course_code VARCHAR(12) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(course_code) REFERENCES course (course_code),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE mentor_request (
    id UUID NOT NULL,
    date_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_published BOOLEAN NOT NULL,
    description TEXT,
    title VARCHAR(50),
    user_id UUID NOT NULL,
    course_code VARCHAR(12) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(course_code) REFERENCES course (course_code),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE prerequisites (
    prerequisite_code VARCHAR(10),
    course_code VARCHAR(10),
    FOREIGN KEY(course_code) REFERENCES course (course_code),
    FOREIGN KEY(prerequisite_code) REFERENCES course (course_code)
);

CREATE TABLE programme_user (
    programme_id UUID,
    user_id UUID,
    FOREIGN KEY(programme_id) REFERENCES programme (id),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE study_plan (
    id UUID NOT NULL,
    date_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_published BOOLEAN NOT NULL,
    title VARCHAR(150),
    description TEXT,
    num_of_likes INTEGER,
    creator_id UUID NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(creator_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE study_plan_semester (
    id UUID NOT NULL,
    semester_number INTEGER NOT NULL,
    total_units FLOAT NOT NULL,
    study_plan_id UUID,
    PRIMARY KEY (id),
    FOREIGN KEY(study_plan_id) REFERENCES study_plan (id),
    CONSTRAINT semesters_in_study_plan_unique UNIQUE (study_plan_id, semester_number)
);

CREATE TABLE semester_course (
    study_plan_semester_id UUID,
    course_code VARCHAR(10),
    FOREIGN KEY(course_code) REFERENCES course (course_code),
    FOREIGN KEY(study_plan_semester_id) REFERENCES study_plan_semester (id)
);

INSERT INTO alembic_version (version_num) VALUES ('22be9cc508e8') RETURNING alembic_version.version_num;

COMMIT;

COPY programme FROM '/pre_data/programmes.csv' DELIMITER ',' CSV HEADER;
COPY degree FROM '/pre_data/degrees.csv' DELIMITER ',' CSV HEADER;
COPY course FROM '/pre_data/courses.csv' DELIMITER ',' CSV HEADER;