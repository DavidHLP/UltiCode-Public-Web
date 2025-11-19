/*
 * UltiCode mock database schema
 * ---------------------------------------------
 * This file documents the relational structures that power the MSW dataset.
 * Only the entities that are consumed by the web client are modeled here.
 */

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
    CONSTRAINT fk_sub_problem FOREIGN KEY (problem_id) REFERENCES problems(id)
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
    CONSTRAINT fk_pl_group FOREIGN KEY (group_id) REFERENCES problem_list_groups(id)
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
    CONSTRAINT fk_plsr_list FOREIGN KEY (list_id) REFERENCES problem_lists(id)
);

DROP TABLE IF EXISTS problem_list_favorite_relations;
CREATE TABLE problem_list_favorite_relations (
    user_id VARCHAR(40) NOT NULL,
    list_id VARCHAR(40) NOT NULL,
    PRIMARY KEY (user_id, list_id),
    CONSTRAINT fk_plfr_list FOREIGN KEY (list_id) REFERENCES problem_lists(id)
);

-- ----------------------------
-- Contest operations
-- ----------------------------
DROP TABLE IF EXISTS contests;
CREATE TABLE contests (
    id          VARCHAR(40) PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    featured_event_id VARCHAR(40) NOT NULL
);

DROP TABLE IF EXISTS contest_events;
CREATE TABLE contest_events (
    id           VARCHAR(40) PRIMARY KEY,
    contest_id   VARCHAR(40) NOT NULL,
    title        VARCHAR(120) NOT NULL,
    description  TEXT NOT NULL,
    status       ENUM ('live','registration','upcoming','archived') NOT NULL,
    division     VARCHAR(40) NOT NULL,
    difficulty   VARCHAR(40) NOT NULL,
    tags         JSON NOT NULL,
    start_time   DATETIME NOT NULL,
    end_time     DATETIME NOT NULL,
    is_rated     TINYINT(1) NOT NULL DEFAULT 1,
    mode         ENUM ('solo','team') NOT NULL,
    registered   INT NOT NULL,
    slots        INT NULL,
    CONSTRAINT fk_ce_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_insights;
CREATE TABLE contest_insights (
    id          VARCHAR(40) PRIMARY KEY,
    contest_id  VARCHAR(40) NOT NULL,
    label       VARCHAR(120) NOT NULL,
    value       VARCHAR(40) NOT NULL,
    delta       DECIMAL(6,2) NULL,
    status      VARCHAR(40) NOT NULL,
    CONSTRAINT fk_ci_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_leaderboard;
CREATE TABLE contest_leaderboard (
    id           VARCHAR(40) PRIMARY KEY,
    contest_id   VARCHAR(40) NOT NULL,
    division_tag VARCHAR(40) NOT NULL,
    rank         INT NOT NULL,
    team_name    VARCHAR(120) NOT NULL,
    score        INT NOT NULL,
    solved       INT NOT NULL,
    penalty      INT NOT NULL,
    CONSTRAINT fk_cl_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_tracks;
CREATE TABLE contest_tracks (
    id         VARCHAR(40) PRIMARY KEY,
    contest_id VARCHAR(40) NOT NULL,
    title      VARCHAR(120) NOT NULL,
    summary    TEXT NOT NULL,
    CONSTRAINT fk_ct_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_resources;
CREATE TABLE contest_resources (
    id         VARCHAR(40) PRIMARY KEY,
    contest_id VARCHAR(40) NOT NULL,
    title      VARCHAR(120) NOT NULL,
    url        VARCHAR(255) NOT NULL,
    kind       VARCHAR(40) NOT NULL,
    CONSTRAINT fk_cr_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_faq;
CREATE TABLE contest_faq (
    id         VARCHAR(40) PRIMARY KEY,
    contest_id VARCHAR(40) NOT NULL,
    question   VARCHAR(255) NOT NULL,
    answer     TEXT NOT NULL,
    CONSTRAINT fk_cfaq_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_ops_checkpoints;
CREATE TABLE contest_ops_checkpoints (
    id         VARCHAR(40) PRIMARY KEY,
    contest_id VARCHAR(40) NOT NULL,
    phase      VARCHAR(40) NOT NULL,
    status     VARCHAR(40) NOT NULL,
    description TEXT NOT NULL,
    timestamp  DATETIME NOT NULL,
    CONSTRAINT fk_coc_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
);

DROP TABLE IF EXISTS contest_crew;
CREATE TABLE contest_crew (
    id         VARCHAR(40) PRIMARY KEY,
    contest_id VARCHAR(40) NOT NULL,
    name       VARCHAR(120) NOT NULL,
    role       VARCHAR(120) NOT NULL,
    contact    VARCHAR(120) NOT NULL,
    avatar     VARCHAR(255),
    CONSTRAINT fk_cc_contest FOREIGN KEY (contest_id) REFERENCES contests(id)
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
