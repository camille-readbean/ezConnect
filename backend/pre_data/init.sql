BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

INFO  [alembic.runtime.migration] Running upgrade  -> 22be9cc508e8, empty message
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

INFO  [alembic.runtime.migration] Running upgrade 22be9cc508e8 -> 0f60b0932ff1, empty message
-- Running upgrade 22be9cc508e8 -> 0f60b0932ff1

CREATE TABLE personal_study_plan (
    id UUID NOT NULL,
    date_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    title VARCHAR(150),
    creator_id UUID NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(creator_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE published_study_plan (
    id UUID NOT NULL,
    date_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    num_of_likes INTEGER NOT NULL,
    creator_id UUID NOT NULL,
    personal_study_plan_id UUID NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(creator_id) REFERENCES users (azure_ad_oid),
    FOREIGN KEY(personal_study_plan_id) REFERENCES personal_study_plan (id)
);

CREATE TABLE favorited_study_plan (
    user_id UUID NOT NULL,
    published_study_plan_id UUID NOT NULL,
    FOREIGN KEY(published_study_plan_id) REFERENCES published_study_plan (id),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

CREATE TABLE liked_study_plan (
    user_id UUID NOT NULL,
    published_study_plan_id UUID NOT NULL,
    FOREIGN KEY(published_study_plan_id) REFERENCES published_study_plan (id),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

ALTER TABLE study_plan_semester ADD COLUMN personal_study_plan_id UUID;

ALTER TABLE study_plan_semester ADD COLUMN published_study_plan_id UUID;

ALTER TABLE study_plan_semester DROP CONSTRAINT semesters_in_study_plan_unique;

ALTER TABLE study_plan_semester ADD CONSTRAINT semesters_in_published_study_plan_unique UNIQUE (published_study_plan_id, semester_number);

ALTER TABLE study_plan_semester DROP CONSTRAINT study_plan_semester_study_plan_id_fkey;

ALTER TABLE study_plan_semester ADD CONSTRAINT published_study_plan_semester FOREIGN KEY(published_study_plan_id) REFERENCES published_study_plan (id);

ALTER TABLE study_plan_semester ADD CONSTRAINT personal_study_plan_semester FOREIGN KEY(personal_study_plan_id) REFERENCES personal_study_plan (id);

ALTER TABLE study_plan_semester DROP COLUMN study_plan_id;

DROP TABLE study_plan;

UPDATE alembic_version SET version_num='0f60b0932ff1' WHERE alembic_version.version_num = '22be9cc508e8';

INFO  [alembic.runtime.migration] Running upgrade 0f60b0932ff1 -> 5d9bb93bb669, empty message
-- Running upgrade 0f60b0932ff1 -> 5d9bb93bb669

CREATE TABLE viewed_study_plan (
    user_id UUID NOT NULL,
    published_study_plan_id UUID NOT NULL,
    date_viewed TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    FOREIGN KEY(published_study_plan_id) REFERENCES published_study_plan (id),
    FOREIGN KEY(user_id) REFERENCES users (azure_ad_oid)
);

ALTER TABLE favorited_study_plan ADD COLUMN date_favourited TIMESTAMP WITHOUT TIME ZONE NOT NULL;

ALTER TABLE favorited_study_plan ADD CONSTRAINT unique_user_favourited_study_plan UNIQUE (user_id, published_study_plan_id);

ALTER TABLE liked_study_plan ADD COLUMN date_liked TIMESTAMP WITHOUT TIME ZONE NOT NULL;

ALTER TABLE liked_study_plan ADD CONSTRAINT unique_user_liked_study_plan UNIQUE (user_id, published_study_plan_id);

UPDATE alembic_version SET version_num='5d9bb93bb669' WHERE alembic_version.version_num = '0f60b0932ff1';

INFO  [alembic.runtime.migration] Running upgrade 5d9bb93bb669 -> 9d4370465dbd, empty message
-- Running upgrade 5d9bb93bb669 -> 9d4370465dbd

CREATE TABLE academic_plan (
    id UUID NOT NULL,
    published_study_plan_id UUID NOT NULL,
    first_degree_id UUID NOT NULL,
    second_degree_id UUID,
    second_major VARCHAR(150),
    PRIMARY KEY (id),
    FOREIGN KEY(first_degree_id) REFERENCES degree (id),
    FOREIGN KEY(published_study_plan_id) REFERENCES published_study_plan (id),
    FOREIGN KEY(second_degree_id) REFERENCES degree (id)
);

CREATE TABLE minor_academic_plan (
    minor_id UUID,
    academic_plan_id UUID,
    FOREIGN KEY(academic_plan_id) REFERENCES academic_plan (id),
    FOREIGN KEY(minor_id) REFERENCES programme (id)
);

CREATE TABLE special_programmes_academic_plan (
    special_programme_id UUID,
    academic_plan_id UUID,
    FOREIGN KEY(academic_plan_id) REFERENCES academic_plan (id),
    FOREIGN KEY(special_programme_id) REFERENCES programme (id)
);

UPDATE alembic_version SET version_num='9d4370465dbd' WHERE alembic_version.version_num = '5d9bb93bb669';

INFO  [alembic.runtime.migration] Running upgrade 9d4370465dbd -> f0c3451c1967, empty message
-- Running upgrade 9d4370465dbd -> f0c3451c1967

ALTER TABLE prerequisites ADD COLUMN prerequisite_str TEXT;

ALTER TABLE prerequisites ALTER COLUMN course_code TYPE VARCHAR(12);

ALTER TABLE prerequisites DROP CONSTRAINT prerequisites_prerequisite_code_fkey;

ALTER TABLE prerequisites DROP COLUMN prerequisite_code;

UPDATE alembic_version SET version_num='f0c3451c1967' WHERE alembic_version.version_num = '9d4370465dbd';

INFO  [alembic.runtime.migration] Running upgrade f0c3451c1967 -> e534acc545c3, empty message
-- Running upgrade f0c3451c1967 -> e534acc545c3

ALTER TABLE prerequisites ALTER COLUMN course_code SET NOT NULL;

UPDATE alembic_version SET version_num='e534acc545c3' WHERE alembic_version.version_num = 'f0c3451c1967';

COMMIT;