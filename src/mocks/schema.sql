/*
 * UltiCode mock database schema
 * ---------------------------------------------
 * This file documents the relational structures that power the MSW dataset.
 * Only the entities that are consumed by the web client are modeled here.
 */


-- ----------------------------
-- Users
-- ----------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id       VARCHAR(40) PRIMARY KEY,
    username VARCHAR(120) NOT NULL UNIQUE,
    name     VARCHAR(120),
    email    VARCHAR(255),
    avatar   VARCHAR(255)
);

-- ----------------------------
-- Problem catalog
-- ----------------------------
DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id              BIGINT PRIMARY KEY,
    slug            VARCHAR(120) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    difficulty      ENUM ('Easy','Medium','Hard') NOT NULL,
    acceptance_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    status          ENUM ('solved','attempted','todo') NOT NULL DEFAULT 'todo',
    is_premium      TINYINT(1) NOT NULL DEFAULT 0,
    has_solution    TINYINT(1) NOT NULL DEFAULT 0,
    completed_time  DATE NULL
);

DROP TABLE IF EXISTS problem_tags;
CREATE TABLE problem_tags (
    id    VARCHAR(40) PRIMARY KEY,
    label VARCHAR(120) NOT NULL
);

DROP TABLE IF EXISTS problem_tag_relations;
CREATE TABLE problem_tag_relations (
    problem_id BIGINT NOT NULL,
    tag_id     VARCHAR(40) NOT NULL,
    PRIMARY KEY (problem_id, tag_id),
    CONSTRAINT fk_ptr_problem FOREIGN KEY (problem_id) REFERENCES problems(id),
    CONSTRAINT fk_ptr_tag FOREIGN KEY (tag_id) REFERENCES problem_tags(id)
);

-- ----------------------------
-- Problem detail & content
-- ----------------------------
DROP TABLE IF EXISTS problem_details;
CREATE TABLE problem_details (
    id               VARCHAR(40) PRIMARY KEY,
    problem_id       BIGINT NOT NULL UNIQUE,
    slug             VARCHAR(120) NOT NULL,
    summary          TEXT NOT NULL,
    companies        JSON,
    likes            INT NOT NULL DEFAULT 0,
    dislikes         INT NOT NULL DEFAULT 0,
    difficulty_rating DECIMAL(4,1) NOT NULL DEFAULT 1500,
    updated_at       DATETIME NOT NULL,
    follow_up        TEXT,
    constraints_json JSON NOT NULL,
    CONSTRAINT fk_pd_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS problem_examples;
CREATE TABLE problem_examples (
    id         VARCHAR(40) PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    example_order INT NOT NULL DEFAULT 0,
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    explanation TEXT,
    CONSTRAINT fk_pe_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS problem_approaches;
CREATE TABLE problem_approaches (
    id               VARCHAR(40) PRIMARY KEY,
    problem_id       BIGINT NOT NULL,
    title            VARCHAR(255) NOT NULL,
    summary          TEXT NOT NULL,
    time_complexity  VARCHAR(32) NOT NULL,
    space_complexity VARCHAR(32) NOT NULL,
    code_snippet     MEDIUMTEXT NOT NULL,
    language         VARCHAR(40) NOT NULL,
    CONSTRAINT fk_pa_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS problem_approach_steps;
CREATE TABLE problem_approach_steps (
    id          VARCHAR(40) PRIMARY KEY,
    approach_id VARCHAR(40) NOT NULL,
    step_order  INT NOT NULL DEFAULT 0,
    content     TEXT NOT NULL,
    CONSTRAINT fk_pas_approach FOREIGN KEY (approach_id) REFERENCES problem_approaches(id)
);

DROP TABLE IF EXISTS problem_languages;
CREATE TABLE problem_languages (
    id           VARCHAR(40) PRIMARY KEY,
    problem_id   BIGINT NOT NULL,
    label        VARCHAR(40) NOT NULL,
    value        VARCHAR(40) NOT NULL,
    starter_code MEDIUMTEXT NOT NULL,
    CONSTRAINT fk_pl_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS problem_starter_notes;
CREATE TABLE problem_starter_notes (
    id         VARCHAR(40) PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    content    TEXT NOT NULL,
    CONSTRAINT fk_psn_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS problem_recent_results;
CREATE TABLE problem_recent_results (
    id         VARCHAR(40) PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    case_label VARCHAR(40) NOT NULL,
    status     ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded','Pending') NOT NULL,
    runtime    VARCHAR(32) NOT NULL,
    memory     VARCHAR(32) NOT NULL,
    detail     TEXT NOT NULL,
    CONSTRAINT fk_prr_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS test_cases;
CREATE TABLE test_cases (
    id         VARCHAR(40) PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    label      VARCHAR(60) NOT NULL,
    explanation TEXT,
    CONSTRAINT fk_tc_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS test_case_inputs;
CREATE TABLE test_case_inputs (
    id          VARCHAR(40) PRIMARY KEY,
    test_case_id VARCHAR(40) NOT NULL,
    field_name  VARCHAR(60) NOT NULL,
    label       VARCHAR(60) NOT NULL,
    value       TEXT NOT NULL,
    CONSTRAINT fk_tci_test_case FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
);

-- ----------------------------
-- Solution feed metadata
-- ----------------------------
DROP TABLE IF EXISTS solution_authors;
CREATE TABLE solution_authors (
    id           VARCHAR(40) PRIMARY KEY,
    name         VARCHAR(120) NOT NULL,
    role         VARCHAR(120) NOT NULL,
    avatar_color VARCHAR(16) NOT NULL
);

DROP TABLE IF EXISTS solution_filter_options;
CREATE TABLE solution_filter_options (
    id    VARCHAR(40) PRIMARY KEY,
    label VARCHAR(60) NOT NULL,
    value VARCHAR(60) NOT NULL,
    kind  ENUM ('quick','sort') NOT NULL
);

DROP TABLE IF EXISTS solution_badges;
CREATE TABLE solution_badges (
    id    VARCHAR(40) PRIMARY KEY,
    label VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS solution_metas;
CREATE TABLE solution_metas (
    id              VARCHAR(40) PRIMARY KEY,
    highlight       VARCHAR(255) NOT NULL,
    flair           VARCHAR(60) NULL,
    author_id       VARCHAR(40) NOT NULL,
    views_text      VARCHAR(40) NOT NULL,
    likes           INT NOT NULL DEFAULT 0,
    comments        INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL,
    published_at    DATETIME NOT NULL,
    topic           VARCHAR(60) NOT NULL,
    language_filter VARCHAR(40) NOT NULL,
    score           INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_sm_author FOREIGN KEY (author_id) REFERENCES solution_authors(id)
);

DROP TABLE IF EXISTS solution_badge_relations;
CREATE TABLE solution_badge_relations (
    badge_id VARCHAR(40) NOT NULL,
    meta_id  VARCHAR(40) NOT NULL,
    PRIMARY KEY (badge_id, meta_id),
    CONSTRAINT fk_sbr_badge FOREIGN KEY (badge_id) REFERENCES solution_badges(id),
    CONSTRAINT fk_sbr_meta FOREIGN KEY (meta_id) REFERENCES solution_metas(id)
);

-- ----------------------------
-- Submissions
-- ----------------------------
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
    id                  VARCHAR(40) PRIMARY KEY,
    problem_id          BIGINT NOT NULL,
    user_id             VARCHAR(40) NOT NULL,
    status              ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded') NOT NULL,
    runtime             VARCHAR(32) NOT NULL,
    memory              VARCHAR(32) NOT NULL,
    language            VARCHAR(40) NOT NULL,
    submitted_at        DATETIME NOT NULL,
    runtime_percentile  INT NOT NULL,
    memory_percentile   INT NOT NULL,
    code                MEDIUMTEXT NOT NULL,
    notes               TEXT NULL,
    tags_json           JSON,
    runtime_dist        JSON,
    runtime_dist_bins   JSON,
    CONSTRAINT fk_sub_problem FOREIGN KEY (problem_id) REFERENCES problems(id),
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS submission_tests;
CREATE TABLE submission_tests (
    id            VARCHAR(40) PRIMARY KEY,
    submission_id VARCHAR(40) NOT NULL,
    label         VARCHAR(60) NOT NULL,
    status        ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded') NOT NULL,
    runtime       VARCHAR(32) NOT NULL,
    CONSTRAINT fk_st_submission FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- ----------------------------
-- Problem run results (execution feedback)
-- ----------------------------
DROP TABLE IF EXISTS run_results;
CREATE TABLE run_results (
    id             VARCHAR(40) PRIMARY KEY,
    submission_id  VARCHAR(40) NOT NULL,
    problem_id     BIGINT NOT NULL,
    user_id        VARCHAR(40) NOT NULL,
    verdict        ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded','Pending') NOT NULL,
    runtime        VARCHAR(32) NOT NULL,
    memory         VARCHAR(32) NOT NULL,
    CONSTRAINT fk_rr_submission FOREIGN KEY (submission_id) REFERENCES submissions(id),
    CONSTRAINT fk_rr_problem FOREIGN KEY (problem_id) REFERENCES problems(id),
    CONSTRAINT fk_rr_user FOREIGN KEY (user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS run_cases;
CREATE TABLE run_cases (
    id                    VARCHAR(40) PRIMARY KEY,
    run_result_id         VARCHAR(40) NOT NULL,
    submission_test_id    VARCHAR(40) NOT NULL,
    test_case_id          VARCHAR(40) NOT NULL,
    status                ENUM ('Accepted','Wrong Answer','Runtime Error','Time Limit Exceeded','Pending') NOT NULL,
    runtime               VARCHAR(32) NOT NULL,
    memory                VARCHAR(32) NOT NULL,
    detail                TEXT NOT NULL,
    output_text           TEXT NOT NULL,
    expected_output_text  TEXT NOT NULL,
    CONSTRAINT fk_rc_run_result FOREIGN KEY (run_result_id) REFERENCES run_results(id),
    CONSTRAINT fk_rc_submission_test FOREIGN KEY (submission_test_id) REFERENCES submission_tests(id),
    CONSTRAINT fk_rc_test_case FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
);

DROP TABLE IF EXISTS run_case_inputs;
CREATE TABLE run_case_inputs (
    id                 VARCHAR(40) PRIMARY KEY,
    run_case_id        VARCHAR(40) NOT NULL,
    test_case_input_id VARCHAR(40) NOT NULL,
    field_name         VARCHAR(60) NOT NULL,
    label              VARCHAR(60) NOT NULL,
    value              TEXT NOT NULL,
    CONSTRAINT fk_rci_run_case FOREIGN KEY (run_case_id) REFERENCES run_cases(id),
    CONSTRAINT fk_rci_test_case_input FOREIGN KEY (test_case_input_id) REFERENCES test_case_inputs(id)
);

-- ----------------------------
-- Problem lists
-- ----------------------------
DROP TABLE IF EXISTS problem_list_groups;
CREATE TABLE problem_list_groups (
    id         VARCHAR(40) PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS problem_lists;
CREATE TABLE problem_lists (
    id          VARCHAR(40) PRIMARY KEY,
    group_id    VARCHAR(40) NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    author_id   VARCHAR(40) NOT NULL,
    is_public   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME NOT NULL,
    CONSTRAINT fk_pl_group FOREIGN KEY (group_id) REFERENCES problem_list_groups(id),
    CONSTRAINT fk_pl_author FOREIGN KEY (author_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS problem_list_relations;
CREATE TABLE problem_list_relations (
    list_id    VARCHAR(40) NOT NULL,
    problem_id BIGINT NOT NULL,
    PRIMARY KEY (list_id, problem_id),
    CONSTRAINT fk_plr_list FOREIGN KEY (list_id) REFERENCES problem_lists(id),
    CONSTRAINT fk_plr_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

DROP TABLE IF EXISTS problem_list_saved_relations;
CREATE TABLE problem_list_saved_relations (
    user_id VARCHAR(40) NOT NULL,
    list_id VARCHAR(40) NOT NULL,
    PRIMARY KEY (user_id, list_id),
    CONSTRAINT fk_plsr_list FOREIGN KEY (list_id) REFERENCES problem_lists(id),
    CONSTRAINT fk_plsr_user FOREIGN KEY (user_id) REFERENCES users(id)
);

DROP TABLE IF EXISTS problem_list_favorite_relations;
CREATE TABLE problem_list_favorite_relations (
    user_id VARCHAR(40) NOT NULL,
    list_id VARCHAR(40) NOT NULL,
    PRIMARY KEY (user_id, list_id),
    CONSTRAINT fk_plfr_list FOREIGN KEY (list_id) REFERENCES problem_lists(id),
    CONSTRAINT fk_plfr_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------
-- Contest operations
-- ----------------------------
DROP TABLE IF EXISTS contest_rankings;
DROP TABLE IF EXISTS contest_participants;
DROP TABLE IF EXISTS contest_problems;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS global_rankings;

CREATE TABLE contests (
    id               VARCHAR(40) PRIMARY KEY,
    title            VARCHAR(120) NOT NULL,
    slug             VARCHAR(120) NOT NULL,
    contest_type     ENUM ('weekly','biweekly','special') NOT NULL,
    start_time       DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    status           ENUM ('upcoming','running','finished') NOT NULL,
    registered_count INT NOT NULL DEFAULT 0,
    participant_count INT NOT NULL DEFAULT 0,
    is_rated         TINYINT(1) NOT NULL DEFAULT 1,
    description      TEXT,
    cover_image      VARCHAR(255)
);

CREATE TABLE contest_problems (
    id               VARCHAR(40) PRIMARY KEY,
    contest_id       VARCHAR(40) NOT NULL,
    problem_id       BIGINT NOT NULL,
    problem_index    VARCHAR(10) NOT NULL,
    score            INT NOT NULL DEFAULT 0,
    solved_count     INT NOT NULL DEFAULT 0,
    submission_count INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_cp_contest FOREIGN KEY (contest_id) REFERENCES contests(id),
    CONSTRAINT fk_cp_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE contest_participants (
    id                  VARCHAR(40) PRIMARY KEY,
    contest_id          VARCHAR(40) NOT NULL,
    user_id             VARCHAR(40) NOT NULL,
    username            VARCHAR(120) NOT NULL,
    status              ENUM ('registered','participated','virtual') NOT NULL,
    registered_at       DATETIME NOT NULL,
    started_at          DATETIME,
    finished_at         DATETIME,
    rank                INT,
    score               INT NOT NULL DEFAULT 0,
    finish_time_seconds INT,
    is_virtual          TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_cpart_contest FOREIGN KEY (contest_id) REFERENCES contests(id),
    CONSTRAINT fk_cpart_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE contest_rankings (
    id                  VARCHAR(40) PRIMARY KEY,
    contest_id          VARCHAR(40) NOT NULL,
    user_id             VARCHAR(40) NOT NULL,
    username            VARCHAR(120) NOT NULL,
    rank                INT NOT NULL,
    score               INT NOT NULL,
    finish_time_seconds INT NOT NULL,
    q1_time_seconds     INT,
    q2_time_seconds     INT,
    q3_time_seconds     INT,
    q4_time_seconds     INT,
    rating_before       INT NOT NULL,
    rating_after        INT NOT NULL,
    rating_change       INT NOT NULL,
    country             VARCHAR(10) NOT NULL DEFAULT 'CN',
    CONSTRAINT fk_cr_contest FOREIGN KEY (contest_id) REFERENCES contests(id),
    CONSTRAINT fk_cr_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE global_rankings (
    id                 VARCHAR(40) PRIMARY KEY,
    user_id            VARCHAR(40) NOT NULL UNIQUE,
    username           VARCHAR(120) NOT NULL,
    global_rank        INT NOT NULL,
    rating             INT NOT NULL DEFAULT 1500,
    max_rating         INT NOT NULL DEFAULT 1500,
    contests_attended  INT NOT NULL DEFAULT 0,
    avatar             VARCHAR(255),
    country            VARCHAR(10) NOT NULL DEFAULT 'CN',
    badge              VARCHAR(50),
    CONSTRAINT fk_gr_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------
-- Forum
-- ----------------------------
DROP TABLE IF EXISTS forum_communities;
CREATE TABLE forum_communities (
    id          VARCHAR(40) PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    members     INT NOT NULL DEFAULT 0,
    online      INT NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS forum_community_rules;
CREATE TABLE forum_community_rules (
    id           VARCHAR(40) PRIMARY KEY,
    community_id VARCHAR(40) NOT NULL,
    title        VARCHAR(180) NOT NULL,
    body         TEXT NOT NULL,
    CONSTRAINT fk_fcr_community FOREIGN KEY (community_id) REFERENCES forum_communities(id)
);

DROP TABLE IF EXISTS forum_community_links;
CREATE TABLE forum_community_links (
    id           VARCHAR(40) PRIMARY KEY,
    community_id VARCHAR(40) NOT NULL,
    label        VARCHAR(120) NOT NULL,
    url          VARCHAR(255) NOT NULL,
    CONSTRAINT fk_fcl_community FOREIGN KEY (community_id) REFERENCES forum_communities(id)
);

DROP TABLE IF EXISTS forum_users;
CREATE TABLE forum_users (
    username VARCHAR(60) PRIMARY KEY,
    avatar   VARCHAR(255),
    karma    INT NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS forum_moderators;
CREATE TABLE forum_moderators (
    id         VARCHAR(40) PRIMARY KEY,
    community_id VARCHAR(40) NOT NULL,
    username   VARCHAR(60) NOT NULL,
    title      VARCHAR(120) NOT NULL,
    CONSTRAINT fk_fm_community FOREIGN KEY (community_id) REFERENCES forum_communities(id),
    CONSTRAINT fk_fm_user FOREIGN KEY (username) REFERENCES forum_users(username)
);

DROP TABLE IF EXISTS forum_posts;
CREATE TABLE forum_posts (
    id            VARCHAR(40) PRIMARY KEY,
    community_id  VARCHAR(40) NOT NULL,
    user_id       VARCHAR(60) NOT NULL,
    permalink     VARCHAR(255),
    title         VARCHAR(255) NOT NULL,
    flair_type    ENUM ('announcement','discussion','showcase','question','hiring') NULL,
    flair_label   VARCHAR(60),
    tags          JSON NOT NULL,
    excerpt       TEXT,
    media         JSON,
    recommendation JSON,
    vote_state    ENUM ('upvoted','downvoted','neutral') DEFAULT 'neutral',
    is_saved      TINYINT(1) NOT NULL DEFAULT 0,
    impressions   INT NOT NULL DEFAULT 0,
    is_pinned     TINYINT(1) NOT NULL DEFAULT 0,
    is_locked     TINYINT(1) NOT NULL DEFAULT 0,
    created_at    DATETIME NOT NULL,
    CONSTRAINT fk_fp_community FOREIGN KEY (community_id) REFERENCES forum_communities(id),
    CONSTRAINT fk_fp_user FOREIGN KEY (user_id) REFERENCES forum_users(username)
);

DROP TABLE IF EXISTS forum_post_stats;
CREATE TABLE forum_post_stats (
    id            VARCHAR(40) PRIMARY KEY,
    post_id       VARCHAR(40) NOT NULL UNIQUE,
    score         INT NOT NULL,
    comments      INT NOT NULL,
    awards        INT NOT NULL,
    saves         INT NOT NULL,
    shares        INT NOT NULL,
    upvote_ratio  DECIMAL(4,2),
    views         INT,
    CONSTRAINT fk_fps_post FOREIGN KEY (post_id) REFERENCES forum_posts(id)
);

DROP TABLE IF EXISTS forum_awards;
CREATE TABLE forum_awards (
    id    VARCHAR(40) PRIMARY KEY,
    label VARCHAR(120) NOT NULL,
    icon  VARCHAR(120)
);

DROP TABLE IF EXISTS forum_post_awards;
CREATE TABLE forum_post_awards (
    post_id  VARCHAR(40) NOT NULL,
    award_id VARCHAR(40) NOT NULL,
    count    INT NOT NULL DEFAULT 1,
    PRIMARY KEY (post_id, award_id),
    CONSTRAINT fk_fpa_post FOREIGN KEY (post_id) REFERENCES forum_posts(id),
    CONSTRAINT fk_fpa_award FOREIGN KEY (award_id) REFERENCES forum_awards(id)
);

DROP TABLE IF EXISTS forum_comments;
CREATE TABLE forum_comments (
    id        VARCHAR(40) PRIMARY KEY,
    post_id   VARCHAR(40) NOT NULL,
    parent_id VARCHAR(40),
    author_id VARCHAR(60) NOT NULL,
    body      TEXT NOT NULL,
    markdown  TEXT,
    upvotes   INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    edited_at  DATETIME,
    is_pinned  TINYINT(1) DEFAULT 0,
    is_locked  TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_fc_post FOREIGN KEY (post_id) REFERENCES forum_posts(id),
    CONSTRAINT fk_fc_parent FOREIGN KEY (parent_id) REFERENCES forum_comments(id),
    CONSTRAINT fk_fc_author FOREIGN KEY (author_id) REFERENCES forum_users(username)
);

DROP TABLE IF EXISTS forum_quick_filters;
CREATE TABLE forum_quick_filters (
    id    VARCHAR(40) PRIMARY KEY,
    label VARCHAR(60) NOT NULL,
    value VARCHAR(40) NOT NULL
);

DROP TABLE IF EXISTS forum_trending_topics;
CREATE TABLE forum_trending_topics (
    id      VARCHAR(40) PRIMARY KEY,
    title   VARCHAR(120) NOT NULL,
    posts   INT NOT NULL,
    trend   ENUM ('up','down') NOT NULL
);
