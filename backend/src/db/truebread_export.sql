--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-04-06 23:59:44

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', 0);
SET check_function_bodies = 0;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 24837)
-- Name: article_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_images (
    id integer NOT NULL,
    article_id character varying(50),
    url character varying(255) NOT NULL,
    alt character varying(255) NOT NULL,
    caption character varying(255),
    alt_ml character varying(255),
    caption_ml character varying(255)
);


ALTER TABLE public.article_images OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24836)
-- Name: article_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

MySQL AUTO_INCREMENT public.article_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_images_id_seq OWNER TO postgres;

--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 221
-- Name: article_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_images_id_seq OWNED BY public.article_images.id;


--
-- TOC entry 224 (class 1259 OID 24851)
-- Name: article_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_tags (
    id integer NOT NULL,
    article_id character varying(50),
    tag character varying(50) NOT NULL,
    tag_ml character varying(50)
);


ALTER TABLE public.article_tags OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24850)
-- Name: article_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

MySQL AUTO_INCREMENT public.article_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_tags_id_seq OWNER TO postgres;

--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 223
-- Name: article_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_tags_id_seq OWNED BY public.article_tags.id;


--
-- TOC entry 220 (class 1259 OID 24827)
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(100) NOT NULL,
    job_title character varying(100),
    works_at character varying(100),
    category character varying(50) NOT NULL,
    image_url character varying(255) NOT NULL,
    alt_LONGTEXT character varying(255) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt LONGTEXT NOT NULL,
    publish_date date NOT NULL,
    read_time integer NOT NULL,
    is_featured TINYINT(1) DEFAULT 0,
    language character varying(2) NOT NULL,
    title_ml LONGTEXT,
    author_ml LONGTEXT,
    job_title_ml LONGTEXT,
    works_at_ml LONGTEXT,
    category_ml LONGTEXT,
    alt_LONGTEXT_ml LONGTEXT,
    content_ml LONGTEXT,
    excerpt_ml LONGTEXT,
    CONSTRAINT proper_encoding CHECK (((title_ml IS NULL) OR (title_ml ~ '^[\u0D00-\u0D7F\s[:punct:]]*$'::LONGTEXT)))
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24906)
-- Name: editorials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.editorials (
    id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt LONGTEXT NOT NULL,
    publish_date date NOT NULL,
    editor_id integer,
    image_url character varying(255),
    month character varying(20) NOT NULL,
    year integer NOT NULL,
    language character varying(2) DEFAULT 'en'::character varying,
    title_ml LONGTEXT,
    content_ml LONGTEXT,
    excerpt_ml LONGTEXT,
    month_ml LONGTEXT
);


ALTER TABLE public.editorials OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24897)
-- Name: editors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.editors (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(100) NOT NULL,
    image_url character varying(255) NOT NULL,
    bio LONGTEXT NOT NULL,
    name_ml LONGTEXT,
    role_ml LONGTEXT,
    bio_ml LONGTEXT
);


ALTER TABLE public.editors OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24896)
-- Name: editors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

MySQL AUTO_INCREMENT public.editors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.editors_id_seq OWNER TO postgres;

--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 225
-- Name: editors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.editors_id_seq OWNED BY public.editors.id;


--
-- TOC entry 219 (class 1259 OID 24770)
-- Name: publication_highlights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publication_highlights (
    id integer NOT NULL,
    publication_id character varying(50),
    title character varying(255) NOT NULL
);


ALTER TABLE public.publication_highlights OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24769)
-- Name: publication_highlights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

MySQL AUTO_INCREMENT public.publication_highlights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publication_highlights_id_seq OWNER TO postgres;

--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 218
-- Name: publication_highlights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.publication_highlights_id_seq OWNED BY public.publication_highlights.id;


--
-- TOC entry 217 (class 1259 OID 24762)
-- Name: publications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publications (
    id character varying(50) NOT NULL,
    publication_month character varying(20) NOT NULL,
    publication_year integer NOT NULL,
    title character varying(255) NOT NULL,
    cover_image character varying(255) NOT NULL,
    pdf_url character varying(255) NOT NULL,
    description LONGTEXT,
    publish_date date NOT NULL,
    issue_number integer NOT NULL
);


ALTER TABLE public.publications OWNER TO postgres;

--
-- TOC entry 4724 (class 2604 OID 24840)
-- Name: article_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_images ALTER COLUMN id SET DEFAULT nextval('public.article_images_id_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 24854)
-- Name: article_tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags ALTER COLUMN id SET DEFAULT nextval('public.article_tags_id_seq'::regclass);


--
-- TOC entry 4726 (class 2604 OID 24900)
-- Name: editors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.editors ALTER COLUMN id SET DEFAULT nextval('public.editors_id_seq'::regclass);


--
-- TOC entry 4722 (class 2604 OID 24773)
-- Name: publication_highlights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publication_highlights ALTER COLUMN id SET DEFAULT nextval('public.publication_highlights_id_seq'::regclass);


--
-- TOC entry 4903 (class 0 OID 24837)
-- Dependencies: 222
-- Data for Name: article_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_images (id, article_id, url, alt, caption, alt_ml, caption_ml) FROM stdin;
1	voice-from-the-heart-beyond-words	assets/images/articles/church-unity-main.jpg	Diverse Christian worship gathering	Christians from different traditions coming together in worship	\N	\N
2	voice-from-the-heart-beyond-words	assets/images/articles/church-history.jpg	Historical church building	A reminder of our rich Christian heritage and traditions	\N	\N
3	for-she-loved-much	assets/images/articles/mary-magdalene-main.jpg	Mary Magdalene at the cross	Mary Magdalene's devotion led her to follow Jesus to the cross	\N	\N
4	for-she-loved-much	assets/images/articles/resurrection-garden.jpg	Garden of resurrection	The garden where the risen Christ appeared to Mary Magdalene	\N	\N
5	women-and-crisis-lessons-from-eve	assets/images/articles/eve-garden-main.jpg	Artistic depiction of Eve in the Garden of Eden	Eve's story begins in the Garden of Eden	\N	\N
6	women-and-crisis-lessons-from-eve	assets/images/articles/eve-legacy.jpg	Symbolic representation of Eve's legacy	Eve's legacy continues through generations of women	\N	\N
7	the-vulture-and-the-little-girl	assets/images/articles/vulture-girl-main.jpg	The Vulture and the Little Girl - Kevin Carter's Pulitzer Prize photograph	Kevin Carter's 1993 Pulitzer Prize-winning photograph from Sudan	\N	\N
8	the-vulture-and-the-little-girl	assets/images/articles/kevin-carter.jpg	Kevin Carter portrait	Photographer Kevin Carter who captured the iconic image	\N	\N
10	authority-and-supremacy	assets/images/articles/authority-main.jpg	Christian leadership concept illustration	Understanding Christian leadership in modern times	ക്രിസ്തീയ നേതൃത്വത്തിന്റെ ചിത്രീകരണം	ആധുനിക കാലത്ത് ക്രിസ്തീയ നേതൃത്വം മനസ്സിലാക്കൽ
\.


--
-- TOC entry 4905 (class 0 OID 24851)
-- Dependencies: 224
-- Data for Name: article_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_tags (id, article_id, tag, tag_ml) FROM stdin;
1	voice-from-the-heart-beyond-words	Christianity	\N
2	voice-from-the-heart-beyond-words	Church Unity	\N
3	voice-from-the-heart-beyond-words	Faith	\N
4	voice-from-the-heart-beyond-words	Worship	\N
5	voice-from-the-heart-beyond-words	Traditions	\N
6	voice-from-the-heart-beyond-words	Spirituality	\N
7	for-she-loved-much	Biblical Studies	\N
8	for-she-loved-much	Women	\N
9	for-she-loved-much	Faith	\N
10	for-she-loved-much	Devotion	\N
11	for-she-loved-much	Jesus	\N
12	for-she-loved-much	Bible Stories	\N
13	women-and-crisis-lessons-from-eve	Biblical Studies	\N
14	women-and-crisis-lessons-from-eve	Women	\N
15	women-and-crisis-lessons-from-eve	Faith	\N
16	women-and-crisis-lessons-from-eve	Redemption	\N
17	women-and-crisis-lessons-from-eve	Genesis	\N
18	women-and-crisis-lessons-from-eve	Bible Stories	\N
19	the-vulture-and-the-little-girl	Faith	\N
20	the-vulture-and-the-little-girl	Society	\N
21	the-vulture-and-the-little-girl	Photojournalism	\N
22	the-vulture-and-the-little-girl	Christianity	\N
23	the-vulture-and-the-little-girl	Social Justice	\N
24	the-vulture-and-the-little-girl	Humanity	\N
25	parenting-with-grace-to-let-go	Christianity	\N
26	parenting-with-grace-to-let-go	Modern Faith	\N
27	parenting-with-grace-to-let-go	Digital Church	\N
33	authority-and-supremacy	Authority	അധികാരം
34	authority-and-supremacy	Leadership	നേതൃത്വം
35	authority-and-supremacy	Society	സമൂഹം
36	authority-and-supremacy	Faith	വിശ്വാസം
37	authority-and-supremacy	Church	സഭ
\.


--
-- TOC entry 4901 (class 0 OID 24827)
-- Dependencies: 220
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, title, author, job_title, works_at, category, image_url, alt_LONGTEXT, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_LONGTEXT_ml, content_ml, excerpt_ml) FROM stdin;
authority-and-supremacy	Authority and Supremacy in Our Society	Dr. M. Stephen	Professor	Faith Theological Seminary	Faith & Society	assets/images/articles/authority.jpg	Illustration representing authority and leadership in society	An exploration of authority and leadership in modern Christian society...	A thoughtful analysis of how authority and leadership manifest in our community...	2024-03-15	12	t	ml	അധികാരവും സർവാധിപത്യവും നമ്മുടെ സമൂഹത്തിൽ	ഡോ. എം. സ്റ്റീഫൻ	പ്രൊഫസർ	ഫെയ്ത്ത് തിയോളജിക്കൽ സെമിനാരി	വിശ്വാസവും സമൂഹവും	\N	കഴിഞ്ഞവർഷം കോഴിക്കോട്ടുവച്ചു നടന്ന കേരള ലിറ്ററേച്ചർ ഫെസ്റ്റിവലിൽ സാഹിത്യകാരനായ ശ്രി. എം.ടി. വാസുദേവൻ നായർ ഇന്നത്തെ പ്രസ്ഥാനങ്ങളുടെ അപചയത്തെപ്പറ്റി സൂചിപ്പിക്കുകയുണ്ടായി. അധികാരത്തെ ആധിപത്യമായും സർവാധിപത്യമായും നാം തെറ്റിദ്ധരിക്കുന്നു എന്നദ്ദേഹം ചൂണ്ടിക്കാട്ടി. കൂടാതെ അധികാരമെന്നാൽ ജനസേവനത്തിനു കിട്ടുന്ന ഒരവസരമെന്ന സിദ്ധാന്തത്തെ പണ്ടേന്നോ നാം കുഴിവെട്ടി മൂടി എന്നും താൻ വിലപിക്കുന്നു. അദ്ദേഹത്തിന്റെ അഭിപ്രായത്തിൽ, ഭരണാധികാരി എറിഞ്ഞു കൊടുക്കുന്ന ഔദാര്യത്തുണ്ടുകളല്ല സ്വാതന്ത്ര്യം. നയിക്കാൻ ഏതാനും പേരും നയിക്കപ്പെടാൻ അനേകം പേരും എന്ന വീക്ഷണം തിരുത്തലിനു വിധേയമാകണമെന്നും താൻ നിർദ്ദേശിച്ചു (മലയാളമനോരമ (ദിനപത്രം), ജനുവരി 12, 2024, പേജ് - 8).\n\nഇറ്റാലിയൻ ചിന്തകനായ അന്റോണിയോ ഗ്രാംഷി, ഒരു ഭൂരിപക്ഷസമൂഹം ന്യൂനപക്ഷസമൂഹത്തിന്റെമേൽ സമ്മർദ്ദം ചെലുത്തുന്നതും അവരെ കീഴ്പ്പെടുത്താൻ ശ്രമിക്കുന്നതുമായ പ്രവണതയെ മേൽക്കോയ്മ (Hegemony) എന്ന് നിരീക്ഷിച്ചിട്ടുണ്ട്. അധികാര വികേന്ദ്രീകരണത്തിനും പങ്കാളിത്തത്തിനും ഒരു സ്ഥാനവുമില്ലാത്ത ഒരു തല്പരകക്ഷികളുടെ സ്വാർത്ഥത നിറഞ്ഞ സമൂഹമായി, ഒരു പ്രസ്ഥാനമായി നാം അധഃപതിച്ചു. പണവും ബലപ്രയോഗവും കുതന്ത്രങ്ങളും ഇന്നത്തെ നേതൃത്വത്തിന്റെ വഴികാട്ടികളാണ്. ആത്മീയ നേതൃത്വം (Spiritual leadership) എന്ന ചിന്തയ്ക്ക് ഇന്ന് സ്ഥാനമില്ല. അനാത്മീക-അധാർമ്മിക മാർഗ്ഗങ്ങളാണ് സ്ഥാനമാനങ്ങൾ നേടാനുള്ള വഴിയായി നാം ഇന്ന് പ്രയോഗിക്കുന്നത്.\n\nപൊതുവേദികളിൽ അവസരം നല്കുന്നതും പണം സംഭാവന ചെയ്യുന്നതിന്റെ അടിസ്ഥാനത്തിലാണ്. വികലമായ വേദപുസ്തകവ്യാഖ്യാനങ്ങളും ഉപരിപ്ലവമായ ആത്മീകതയുമെല്ലാം നമ്മുടെ ശൈലിയായി അംഗീകരിക്കപ്പെട്ടു. സ്വജനപക്ഷപാതവും ഗ്രൂപ്പുകളികളും മറ്റ് കിടമത്സരങ്ങളും നമ്മുടെ സമൂഹത്തിൽ സ്ഥാനം നേടി. എല്ലാവരേയും ചേർത്തുനിർത്തുക എന്ന മനോഭാവത്തെ നാം എപ്പോഴോ കുഴിച്ചു മൂടി. ഇപ്പോൾ കൂടുതൽ കാണുന്നത് വെട്ടിനിരത്തലാണ്. 'ഞാൻ മതി, വേറാരും വേണ്ട' എന്ന ചിന്താഗതി വിശ്വാസസമൂഹത്തിലും ശുശ്രൂഷക്കാർക്കിടയിലും വളർന്നു പന്തലിച്ചിരിക്കുന്നു. മറ്റുള്ളവരുടെ വളർച്ചയ്ക്കും ഉയർച്ചയ്ക്കും തുരങ്കം വയ്ക്കുന്ന പ്രവണത വർദ്ധിച്ചുവരുന്നു. ദൈവജനത്തെ ആത്മീയദർശനം നല്കി വഴിനടത്തുന്നതിനു പകരം ഇപ്പോഴത്തെ നേതൃത്വത്തിന്റെ ദൗത്യം ശുശ്രൂഷകന്മാരേയും സഭാജനങ്ങളേയും രാഷ്ട്രീയവൽക്കരിച്ച് പക്ഷം ചേർത്ത് തങ്ങളുടെ സ്ഥാനവും പദവികളും ഉറപ്പിക്കലാണ്.	അധികാരത്തിന്റെയും നേതൃത്വത്തിന്റെയും പ്രസക്തമായ വിശകലനം
parenting-with-grace-to-let-go	Parenting with grace to let go	Mrs. Renji Sam	Counselor	Director of Extension Department FTS	Faith	assets/images/articles/parenting-grace.jpg	Parenting with Grace to Let Go image	Parenting is a journey unlike any other- a road paved with sleepless nights, heartwarming smiles and countless lessons learned along the way. It is a dance of love, patience, and resilience, where every step shapes not just the child but also the parent. In this intricate tapestry of life, grace becomes the golden thread- a quiet yet powerful force that softens mistakes, bridges gaps, and nurtures connections. Grace is the whisper that reminds us to accept imperfections, to pause when temper rise, and to love unconditionally even when the days feel long and challenging. Grace is when parents are able to silence their inner voice of doubt, conflict and impatience and lend their ears and heart towards their children’s cry for attention, support and understanding at any age.\nImagine a garden, where each child is a seed, unique in its own right. Some sprout quickly while others take their time, quietly growing roots unseen. Parent becomes the gardener that tends to the needs of each seed, providing care and grace as a gentle rain, nourishing the soil and souls. These series of article are an invitation to the parents to embrace grace-filled parenting- where love and understanding triumph over control, mistakes become opportunities and goal is not perfection but connection.\nParent’s must thrive the grace to let go. In today’s world were evil stems deeper, parents feel the urge to hold on to their children closer tightly. Their fear embarks their children’s future. It is a natural instinct to protect our children from the influence of sin and evil. Here, our spiritual perception brings out the true faith in us. A grace-filled parent will always know that God’s grace extends beyond their physical control. Parents at this ripe hour needs to exhibit their faith by rendering their children to the Lord who gave them to us, trusting God’s goodness, entrusting them to Him to mature their faith.\nPsalm 121:1,3,5 says, “Unless the Lord builds the house, they labor in vain who build it; Unless the Lord guards the city, the watchman keeps awake in vain”. God assures to teach our children Himself. This doesn’t undermine our parental role or endeavor. What Scripture tends to say is God has His own ways to their hearts. His loving touch will transform our endless effort and make them powerful and fruitful. Parents anxiety, fear, stress may be felt as vain because children don’t see it as a godly grace but as nagging and forcing. This will make our efforts go in vain. Parents teach truth, model grace and love unconditionally, but it is God who tests and proves our children’s faith. God’s purifying and refining process is necessary for them to go on to spiritual maturity. As James 1:3-4 says, “the testing of your faith produces endurance. And let endurance have its perfect result, so that you may be perfect and complete, lacking in nothing”. Does that sound like Christian parenting? Our faith gets demonstrated in our gracious Father, every single time by having the grace to let go and trust Him to complete the good works that He has begun in our children (Romans 14:10). We have living testimonies around us. \nMarriage is God’s perfect picture of expressing his undying love for humanity. He is our Heavenly Bridegroom and we, the church, are His bride. Marriage is the perfect gift to humankind, same way a family models God’s grace as we learn to serve one another, including our children from infancy to adulthood, with a heart of gratitude for the One who loves us more than any human bonds. It is a period of self-growth, discipline and heavenly progress for the parent more than for the child. Parents goes through a purification stage that showcases areas of strength and weakness untold to others. That is the graceful guidance God has towards us, where He never steps back from connecting with us in all stages of life.\nWord for Parental Encouragement\nIsaiah 54: 13, “All your children shall be taught by the Lord, and great shall be the peace of your children”.\n	An exploration of how Christianity adapts and remains relevant in our modern world...	2024-03-15	8	t	1	\N	\N	\N	\N	\N	\N	\N	\N
women-and-crisis-lessons-from-eve	Women and Crisis: Lessons from the Life of Eve	Dr. Annie George	Principal	Faith Theological Seminary	Biblical Studies	assets/images/articles/eve-garden.jpg	Artistic representation of Eve in the Garden of Eden	Biblical Women, beginning from the first woman, faced various crises and challenges, connected with their personal lives, families, or nation. Some of them overcame it with the help of God, while others failed miserably. Their stories remind us of the importance of relying on God in times of crisis and trusting in Him for strength and guidance. These stories witness the power and grace of God. As we celebrate Women’s Day, the lives of women in the Bible offer valuable insights into not only the crisis women face but also their resilience and victory across generations.\nThis article looks at the story of the first woman, Eve. Genesis chapters 2 to 4 describe various crises in her life. The following struggles and crises in Eve’s life mirror the life of many women today. \n1. Temptation\nThe serpent tempted Eve in the Garden of Eden. The serpent questioned God’s command not to eat from the Tree of the Knowledge of Good and Evil, casting doubt on God’s intentions and authority. She was lured by the idea that eating the fruit would make her "like God, knowing good and evil" (Genesis 3:5).\n2. Disobedience\nEve gave in to temptation, ate the forbidden fruit, and gave some to Adam. This act of doubt, rebellion, and disobedience was the first sin, often called "The Fall."\n3. Judgement\nAfter the sin, Eve and Adam experienced shame and tried to hide from God. God pronounced judgment: Pain in childbirth would increase and her relationship with Adam would involve struggle and imbalance.\nThey were expelled from the Garden of Eden, losing their perfect communion with God.\n4. Sibling Rivalry and Sin\nCain, Eve’s firstborn, became jealous of his brother Abel because God accepted only Abel’s offering. This jealousy led Cain to murder Abel, committing the first act of human violence.\n5. Grief and Loss\nThe murder has caused havoc in the family. Eve experienced the unimaginable pain of losing Abel to death and Cain to sin and separation. Cain was cursed and sent away to wander, which would have deepened Eve’s sorrow as a mother.\nBut the story of Eve does not end there. It is a story of the triumph of a woman at the mercy of God. She continued to live and God blessed her with generations of sons and daughters. \nHow Eve Overcame these crisis with God \n1.\tAcknowledgement of Sin\nWhen God came in search of her, Eve admitted her role, saying, “The serpent deceived me, and I ate” (Genesis 3:13). This acknowledgement is an important step toward restoration.\n2.\tGod’s Mercy and Provision\nDespite the consequences of their sin, God showed mercy: He clothed Adam and Eve with garments of skin, signifying care and covering their shame. He promised a future Redeemer in Genesis 3:15, indicating that through Eve's offspring, sin and Satan would ultimately be defeated.\n3.\tFaith in God’s Promise\nEve demonstrated trust in God’s promise when she named her firstborn, Cain, saying, “With the help of the Lord, I have brought forth a man” (Genesis 4:1).\n4.\tHope for Redemption\nEve’s story is woven into the larger biblical narrative of redemption. Her offspring would eventually lead to Jesus Christ, who provides salvation for all.\n5.\tGod’s Justice and Mercy\nGod confronted Cain about his sin, showing that He is just and holds people accountable. However, God also placed a mark on Cain to protect him, showing mercy even to the sinner. This act demonstrated to Eve that God’s justice is balanced with His grace.\n6.\tGod’s Promise Sustained Her Hope\nIn Genesis 3:15, God promised that her offspring would ultimately crush the serpent’s head, pointing to a future Redeemer. This promise gave Eve hope despite the tragedy in her family.\n7.\tThe Birth of Seth\nAfter Abel’s death and Cain’s exile, Eve bore another son, Seth. She declared, “God has granted me another child in place of Abel since Cain killed him” (Genesis 4:25).\nNoah came from the lineage of Seth and eventually Jesus came, fulfilling God’s redemptive plan.\n8.\tFaith in God’s Sovereignty\nEve trusted that God was, still in control and that His purposes would prevail despite the evil and suffering she witnessed\nLessons for us today from Eve’s life \nThe following lessons from Eve’s life can speak volumes to today's women. \n1.\tThe Reality of Sin: No one can neglect the effect of sin. Sin affects not only individuals but also families and communities. So we must stay grounded in God’s Word to recognise and reject lies. \n2.\tConfess and Repent: Like Eve, acknowledging our sins is essential for reconciliation with God.\n3.\tFaith Amid Pain: Eve’s trust in God’s faithfulness amid grief and loss is a lesson to find strength in God's promises when we face grief and loss.\n4.\tTrust in God’s Plan:  The Birth of Seth reminds us of the surety of God’s promises even in the darkest times.  Even in the face of sin and its judgement in our failures, God’s mercy and redemptive plan are at work. God’s provision and promises are greater than our mistakes.  God’s justice and mercy never change. \nAs we celebrate Women’s Day, Eve’s story reminds us that women are not defined by their struggles and challenges but by God’s grace and redemption. Women’s strength, faith, and resilience will continue to shape the world today. God who remembered Eve and redeemed her, is the One who defines the worth, purpose, and destiny of women in all generations. \n	Exploring the challenges and triumphs of the first woman, Eve, and the valuable lessons her life offers to women today...	2024-03-08	15	t	1	\N	\N	\N	\N	\N	\N	\N	\N
voice-from-the-heart-beyond-words	Voice from the Heart, Beyond Words	Sneha Samuel			Faith & Society	assets/images/articles/church-unity.jpg	A diverse group of Christians worshipping together	“One day, I was traveling with my family in an auto-rickshaw. My father started talking to the auto-driver about Jesus Christ, while the driver, a kind man, shared his experiences from his faith. He mentioned that he used to be an ambulance driver and had traveled all over India, accumulating a lot of life experiences. Even now, as an auto driver, he still prays whenever he passes by a temple, mosque, or church.” (18th June 2024)\nThis isn’t something unusual; we often hear similar feelings from spiritual people. I’ve heard it many times from my school and college friends as well. It made me reflect—if an ordinary man–woman can genuinely pray to any deity regardless of the religious differences, why can’t Christians worship and praise God together, despite belonging to different Christian traditions? After all, we share the same God and faith. When a child is born into a family, they usually adopt that family’s tradition, often leading to other traditions being seen as less significant. Similarly, when someone regularly attends a particular church, they often become identified with that culture. So the ‘Church’ became the medium which makes ‘Christian’ apart from other Christians.\nThe origin of the word ‘church’ can be traced to two foundational words- ‘qahal’ and ‘ekklesia’. The Greek word ekklesia (κκλησα) is used in the Septuagint to translate the Hebrew word qahal ( קהל). Most of the English versions translate Qahal as ‘congregation’ or ‘assembly’, hence its common application to the ‘church’ in the Old Testament. The term ‘Qahal Yehweh’ describes the gathering of the people of God, often for worship and or instruct. The gathering of God’s people is not confined to the New Testament but is evident throughout the Old Testament as well. In the Old Testament, God gathered his people at specific places where His presence dwelled, offering them the opportunity to know Him, worship Him, obey Him and communicate with Him often through His anointed ones. However, these sacred places were not always free from human failings, as irresponsibility, corruption, disobedience and wickedness occasionally occurred. Even in such movement of spiritual decline, God reveals Himself through His faithful ones – kings, judges, prophets – to guide his people back to the true doctrine. He consistently upheld the sanctity of His dwelling place and emphasized the necessity of purity of heart among His people.\nIn the New Testament, Jesus underscores this principle when He declared, ‘My house shall be called a house of prayer, but you have made it a den of thieves’ (Matthew 21: 13), underlining the necessity of holiness and sincerity in worship. This statement was made when Jesus drove out the money changers and merchants from the temple in Jerusalem, expressing His deep concern for the sanctity of the prayer House. His word, ‘My House’, continue to resonate today, offering a powerful reminder of the true purpose of spaces dedicated to worship and prayer. We’ve built 2,000 years of church traditions, missionary values, evangelical customs, and rituals that are important to pass on to future generations with beautiful honouring values. That’s admirable and worth preserving. But when we discuss those histories ‘Where is Christ’? the cornerstone of church, if we truly admire Him? Why, then, do we feel difference when we encounter someone from a different Christian tradition? Can today’s Church truly demonstrate the way Jesus described as the ‘House of God’? Very\n \ntruly, what was intended to be a God-centred assembly has often shifted into an individual- centred congregation, where divisions and separations prevail, with increasing focus on positions, conflicts, and disputes- frequently relying on legal systems to settle internal disagreements.\nIn spite of this, I’m always filled with joy whenever I see churches around me. These ‘prayer houses’ remind me of the faith warriors who shed tears like blood to build them, and the people who come to sit before His altar seeking His grace, love, and fellowship. For me, Christianity is about a personal relationship with God Almighty through Jesus Christ with Holy Spirit, and the Church is the house of His people. Yet, I also feel His presence wherever I go because Christ is within me as reflected in the physical church I see around me. I sin, He forgives. I stumble, He lifts me up. When I felt alone, He loved me. When I strayed, He sought me out. Despite my flaws, He places me on a solid foundation. It’s just me and God. Isn’t this what a true church embodies?\nDisclaimer: These words are not intended to hurt anyone, and I sincerely apologize if they do. Words can only partially express what is truly in our hearts.\n	A heartfelt reflection on Christian unity, church traditions, and the true meaning of worship beyond denominational boundaries...	2024-06-18	8	t	1	\N	\N	\N	\N	\N	\N	\N	\N
for-she-loved-much	For She Loved Much	Rachel John			Biblical Studies	assets/images/articles/mary-magdalene.jpg	Artistic representation of Mary Magdalene	Mary Magdalene from a small town of Magdala was the most inspiring woman character in the Bible. She is appreciated along with the other women who had followed Jesus and His disciples on their preaching tours, and had supplied generously out of their means. (Lk.8:2,3) She had a good reason to quietly serve her Lord and express her gratitude to the One who redeemed her from the tombs of agony and torture of evil spirits. Lord Jesus’ spontaneous response to a disciple who questioned the wastage of precious spikenard flowing from the beautiful alabaster flask is very much applicable to her as well “For She Loved Much.” (Lk.7:47) Love was the foremost reason that prompted Mary to boldly choose the path of shame, betrayal and loneliness. She chose to follow close to her Master and feel the pain, humiliation and anguish that the rugged roads to Golgotha offered Him. Her unusual loyalty, quiet devotion and grateful love was expressed to her Lord in response to His magnificent love that redeemed her wretched soul from eternal condemnation and death.\nMary Magdalene was an integral part of those women that followed Jesus and ministered to Him on His journey from Galilee to Jerusalem. (Matt.27:55,56) Even when there was no sight of His beloved disciples around-the one that reclined with his head on Jesus’s bosom and the one who’s courageous enough to die with Him; Mary daringly followed the cross. She witnessed the insults and physical torture that Jesus silently endured. She saw the heavy cross that He Himself carried to the ground of death. She shuddered at each hammer blow that pierced her Saviour’s hands and feet. She looked narrowly at the crucified criminal who mocked her Lord and questioned His power and authority. How her heart ached for Him who hung on the cross thirsty, bleeding and burdened with the sins of mankind! Mary not only walked with Jesus into Jerusalem, but also stood at the foot of the cross, recollecting His marvellous deeds and innumerable miracles done for multitudes. \nThe heart-wrenching cry of her Master pierced through her gentle soul, “My God, my God, why have You forsaken Me?” Mary knew it was the darkest hour of despair when even the Merciful Father had left His Beloved Son all alone to die for the lost world. She heard the gentle whisper of her Lord “Greater love has no one than this, that someone lay down his life for his friends.” Yes, the beloved friend of a sinner hung on the cross, bereft of all heavenly glory so that we might comprehend the depth of His love, and reflect His divine love to others. Mary watched intently as her Lord gasped for that last breadth and with a loud cry yielded up His Spirit to the Father. She was hesitant to leave the dead body of Jesus for she dearly loved Him. She pushed herself to the place where her Master was laid and sat opposite the tomb. (Matt. 27:61) Nothing less than the presence of Jesus could give solace to her. And lo, the Sabbath brought her glad tidings of her resurrected Lord who appeared to her in the garden by the grave. How excited was Mary to hear her Master call her by her name and commission her with a message of hope and joy to the disciples. (Jn.20:16,17) She was comforted beyond measure to have clearly understood that her beloved Jesus would continue to be with her always, to the end of the age. Dear readers, aren’t we deeply stirred by the love and adoration of Mary Magdalene whose diligent steps directed her all the way from Galilee to the shadow of the cross at Golgotha? Can we like Mary follow closely to Jesus, and express our true love to Him by offering our Lord the best we possess-our precious time and our God-given gifts?\n	Exploring the profound devotion and love of Mary Magdalene, from her redemption to her faithful presence at the cross...	2024-03-22	10	t	1	\N	\N	\N	\N	\N	\N	\N	\N
the-vulture-and-the-little-girl	The Vulture and the Little Girl	Dr. Binu B. Peniel	Principal	Faith Theological Seminary	Faith & Society	assets/images/articles/vulture-girl.jpg	The Vulture and the Little Girl - 1993 Pulitzer Prize winning photograph	Some of you might remember the image titled: The Vulture and the Little Girl, 1993, originally titled: Struggling Girl or The Vulture is Hungry. This image put tears into the eyes of humanity. The vulture is waiting for the girl to die and to eat her flesh, both are hungry. This photograph was taken\nby South African photojournalist, Kevin Carter, while on assignment to Sudan, near the village of Ayod. Careful not to disturb the bird, he waited for 20 long minutes until the vulture was close enough, positioned himself for the best possible image, to get the two in focus, the hungry child and the hungry bird. At that time Kevin Carter was likely unaware that he had captured one of the most controversial photographs in the history of photojournalism and took this photo from approximately 10 meters. Later on when this photograph was sold to\nThe New York Times, when it appeared for the first time on March 26, 1993, overnight hundreds of\npeople contacted the newspaper to ask what happened to the child. Whether the child survive? (Photo credit: Kevin Carter).\nThe newspaper made a special editorial note saying the girl had enough strength to walk away from the vulture, but that her ultimate fate was unknown. Later on, this dramatic photographer received a lot of criticism, Kevin Carter was vehemently criticized for not helping that girl and walking away from the scene after completing his mission. The St. Petersburg Times in Florida wrote: “The man adjusting his lens to take just the right frame of her suffering, might just as well be a predator, another vulture on the scene.” Two vultures are there and one is behind the camera hiding. The attitude matters, yet the photojournalists were told not to touch the famine victims for fear of spreading diseases. Carter estimated during those years, there were twenty people per hour dying at the food center due to starvation.\n\nLater on, Carter committed suicide due to guilt, depression, and lack of financial resources. He said: “I’m really sorry. The pain of life overrides the joy to the point that joy does not exist… I am depressed… without a phone… money for rent … money for child support… money for debts… money!!!… I am haunted by the vivid memories of killings and corpses and anger and pain… of starving or wounded children, of trigger-happy madmen, often police, of killer executioners… I have gone to join Ken Oosterbroek [recently deceased colleague] if I am that lucky”. Of course, dying or suicide is not a solution, he could have had a new storyline, transformed narrative, or rewritten his story for help and standing for the poor and needy.\n\nJesus said to his disciples “Blessed are you who are poor, for yours is the kingdom of God. Blessed are you who hunger now, for you will be satisfied. Blessed are you who weep now, for you will laugh.\n \nBlessed are you when people hate you when they exclude you insult you and reject your name as evil, because of the Son of Man. (Luke: 6: 17-26. This is Luke’s version of the sermon on the Mount, the Sermon on the Plain. This contains the Beatitudes, and it is presented in the context of bringing the good news to the gentles. To a Greco-Roman audience, addressing Theophilus, physician Luke’s account of the gospel appears to be geared towards Gentiles, those in the Hellenistic context. This also has wider significance in the context of the universality, Hellenistic universality in the gospel. While Matthew’s account shows enormous emphasis on the fulfillment of the Old Testament scriptures, presenting Jesus as the fulfillment of the messianic kingdom, Luke presents a universal Savior. Luke specifically calls Jesus a light to the Gentiles in Luke 2. In chapter 3 Luke quotes Isaiah 40 by stating that ‘all flesh will see God’s salvation.’ It was Friedrich Nietzsche who once said: To live is to suffer, to survive is to find some meaning in the suffering. The good news of the gospel is the good news to the poor as the Latin vulgate, (the principal Latin version of the Bible, prepared mainly by St. Jerome in the late 4th century) calls it ‘beati,’ which translates to be happy, rich, or blessed. The corresponding Greek word is μακάριοι (Makarioi) which means blessed.\nWe have so many words in our everyday vocabulary all centered on ourselves. Self-esteem, self-confidence, self-advertisement, self-gratification, self-glorification, self-motivation, self-pity, self-applause, self-centeredness, self-indulgence, self-righteousness, and so forth. At the same time, we are ignorant about our bondage, our shortcomings, our sinfulness, our guilt, our behavioral pattern, our disconnection from reality, and our rebellion. The tragedy of our culture today is that we all know that we are in a sinking ship yet we stand still and watch and wonder. Gospel promotes a counter-culture perspective and an upside-down kingdom. This is an invitation to deeper discipleship with Jesus. Just like Katherine Hawker says, Happy are we when our treasures cannot be quantified. Happy are we when our knowledge is tempered by mystery? Happy are we when our pain is held in the balm of love. Happy are we when our delight comes from beyond ourselves.\nThe gospel is the lifeblood of Christianity and it provides the foundation for countering and confronting culture. Gospel offers a counterculture way of life and it sets attitudes opposed to the prevailing social norm. We all live in the paradox of our humanness. We are both noble and ignoble, we are both rational and irrational, we are both moral and immoral, we are both creative and destructive, we are both loving and selfish, innovative and copycat, we are both Godlike and beast-like or barbaric. We are the same generation that built hospitals for the care of the sick, universities for the acquisition of knowledge, cars, airplanes, and other vehicles for transportation, and beautiful churches for the worship of God, but we also have built concentration camps, torture chambers, nuclear weapons for mass destruction and closed our churches and made restriction not to gather. We are a self-centered generation. How do we transition from a self-centered ego-centric life to a God-centered (Theo-centered) life? Yes for many everything is centered around them, for some everything is geo-centric or cosmo-centric, the question is how do you live in this world God-centered? “I like your Christ, I do not like your Christians. Your Christians are so unlike your Christ,” said Mahatma Gandhi the Father of our nation. Let's make sure we work hard to make Mahatma Gandhi wrong. Let this generation say I like your Christ and I like you just like first-century disciples in Antioch called “Christians,” which essentially means “little Christ.” Acts 11:26.\n	A profound reflection on Kevin Carter's haunting 1993 photograph from Sudan, exploring its impact on humanity and the Christian response to suffering in our world...	2024-03-15	12	t	1	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 4908 (class 0 OID 24906)
-- Dependencies: 227
-- Data for Name: editorials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.editorials (id, title, content, excerpt, publish_date, editor_id, image_url, month, year, language, title_ml, content_ml, excerpt_ml, month_ml) FROM stdin;
march-2025	Analysis is Essential	The modern era presents increasing challenges to human existence...	A thoughtful analysis of modern challenges facing society and the Christian response	2025-03-01	1	assets/images/editorials/march-2024.jpg	March	2025	ml	വിമർശനങ്ങളല്ല; വിശകലനങ്ങൾ അനിവാര്യമാണ്	മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടമാണിത്. പ്രകൃതിയുടെ സന്തുലനാവസ്ഥ താളം തെറ്റുന്നു. അതിന്റെ അടയാളങ്ങൾ കാലാവസ്ഥാ വ്യതിയാനത്തിലൂടെ പ്രകടമായിരിക്കുന്നതിന്റെ ഏറ്റവും ശ്രദ്ധേയമായ തെളിവാണ് ആഗോളതാപനം ഉൾപ്പെടെയുള്ള പ്രതിസന്ധികൾ. വംശ, വർഗീയ, രാഷ്ട്രീയ തീവ്രവാദങ്ങളും മതമൗലികവാദങ്ങളും പെരുകിക്കൊണ്ടിരിക്കുന്നു. യുദ്ധത്തിന്റെ വിനാശങ്ങൾ ഒഴിഞ്ഞ നാളുകൾ ഭൂപരപ്പിൽ ഉണ്ടായിട്ട് കാലം എത്രയായി. രാജ്യങ്ങൾ രാഷ്ട്രീയ സ്വാതന്ത്ര്യം കൈവരിച്ചെങ്കിലും മറ്റ് പല മേഖലകളിലായി അഭിമുഖീകരിക്കുന്ന ആഭ്യന്തര കലാപങ്ങൾ നിത്യസംഭവങ്ങളാണ്. സാമൂഹ്യപരിഷ്കർത്താക്കൾ തുടച്ചുമാറ്റാൻ പരിശ്രമിച്ച അതിർവരമ്പുകൾ ഘനം പ്രാപിക്കുന്നു. ഏത് രംഗത്തും നിറഞ്ഞുനിൽക്കുന്ന മത്സരാധിഷ്ഠിത മനോഭാവം നിമിത്തം സ്വാർത്ഥത സർവസാധാരണമാകുന്നു. ലഹരിയുടെ പ്രത്യാഘാതങ്ങൾ തീവ്രമാണ്. കലാലയങ്ങൾ, ഹോസ്റ്റലുകൾ, തൊഴിലിടങ്ങൾ, പൊതുനിരത്തുകൾ എന്നിവിടങ്ങളിലെല്ലാം അഴിഞ്ഞാടുന്ന ഹൃദയഭേദക സംഭവങ്ങളുടെ പിന്നിലെല്ലാം ലഹരിയുടെ സ്വാധീനം തള്ളിക്കളയാനാവില്ല. ഉറ്റവരുടെ പോലും ജീവനെടുക്കുന്ന കൊലപാതകങ്ങളിലേക്ക് നയിക്കുന്ന മാനസികാവസ്ഥയും വർധിച്ചുവരുന്ന ആത്മഹത്യാ പ്രവണതയും വിശകലന വിധേയമാകേണ്ടതുണ്ട്. പ്രഥമദൃഷ്ട്യാ ആത്മഹത്യയെന്ന് റിപ്പോർട്ട് ചെയ്യപ്പെടുന്നവ ഇന്നത്തെ സമൂഹത്തിൽ വിരളമല്ല. ഇതിന്റെയെല്ലാം നിജസ്ഥിതി പുറത്തുവരാൻ കടമ്പകൾ ഏറെയുണ്ട്. എല്ലാ സംഭവങ്ങളിലും അത്രയും നീണ്ട പ്രക്രിയകൾ താണ്ടിയുള്ള കാത്തിരിപ്പും പ്രയത്നങ്ങളും ഉണ്ടാവണമെന്നില്ല. കുടുംബത്തകർച്ചയും വിവാഹമോചനവും കൂടുന്നതേയുള്ളൂ. പുതിയ തലമുറ മൂല്യബോധം നഷ്ടപ്പെട്ട ഒരു മായാലോകത്തിലാണോ എന്ന് സംശയിക്കണം. സഭാജീവിതത്തിൽ നിന്ന് ഇളം തലമുറ അകന്നു കൊണ്ടിരിക്കുന്ന പ്രവണതയും അമ്പരപ്പുളവാക്കുന്നു. ദൈവഭയം കൈമോശം വന്നിരിക്കുന്നു. ഇതൊക്കെ വിരൽ ചൂണ്ടുന്നത് വലിയ അപായസൂചകങ്ങളായാണ്. ആത്മഹത്യ ഒന്നിനും പരിഹാരമല്ല. ശരിയായ സൗഹൃദങ്ങൾ എന്നത്തെയും പോലെ ഇന്നിന്റെയും അനിവാര്യതയാണ്. ചേർത്തു പിടിക്കുന്ന, ഒപ്പമുള്ള സൗഹൃദങ്ങൾ. സർക്കാർ, സർക്കാരിതര സംവിധാനങ്ങളൊക്കെ പ്രതിവിധികളുമായി ജാഗരൂകരെന്നത് പ്രതീക്ഷ നൽകുന്നു. ക്രൈസ്തവ സഭയുടെ അനിവാര്യമായ ഇടപെടലുകളും കാലിക പ്രാധാന്യതയുള്ള ദൗത്യ നിർവഹണവും ഇവയ്ക്കൊക്കെയുള്ള ശാശ്വത പരിഹാരമാവണം.	മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടത്തെക്കുറിച്ചുള്ള വിശകലനം	മാർച്ച്
\.


--
-- TOC entry 4907 (class 0 OID 24897)
-- Dependencies: 226
-- Data for Name: editors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.editors (id, name, role, image_url, bio, name_ml, role_ml, bio_ml) FROM stdin;
1	Viju Marayamuttom	Chief Editor	assets/images/editors/Viju-Marayamuttom.jpg	Viju Marayamuttom is a respected contributing editor at True Bread Magazine, bringing deep insights into contemporary Christian thought and society.	വിജു മാരായമുറ്റം	എഡിറ്റർ	വിജു മാരായമുറ്റം ട്രൂ ബ്രഡ് മാഗസിനിലെ എഡിറ്ററാണ്, സമകാലിക ക്രിസ്തീയ ചിന്തയിലേക്കും സമൂഹത്തിലേക്കും ആഴമായ കാഴ്ചപ്പാടുകൾ നൽകുന്നു.
\.


--
-- TOC entry 4900 (class 0 OID 24770)
-- Dependencies: 219
-- Data for Name: publication_highlights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publication_highlights (id, publication_id, title) FROM stdin;
1	march-2025	Voice from the Heart, Beyond Words
2	march-2025	For She Loved Much
3	march-2025	The Vulture and the Little Girl
4	february-2025	The Power of Christian Fellowship
5	february-2025	Love in Action
6	february-2025	Building Strong Communities
7	january-2025	New Beginnings in Christ
8	january-2025	Faith Stories for 2025
9	january-2025	Prayer and Meditation Guide
\.


--
-- TOC entry 4898 (class 0 OID 24762)
-- Dependencies: 217
-- Data for Name: publications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) FROM stdin;
march-2025	March	2025	March 2025	assets/images/covers/march25_cover.jpg	assets/files/True Bread _ Mar_2025.pdf	In this issue, we explore the depths of Christian faith in modern times...	2025-03-01	3
february-2025	February	2025	February 2025	assets/images/covers/feb25_cover.jpg	assets/files/True Bread _ Feb_2025.pdf	February's edition focuses on love, fellowship, and community...	2025-02-01	2
january-2025	January	2025	January 2025	assets/images/covers/jan25_cover.jpg	assets/files/True Bread _ Jan_2025.pdf	Start the year with inspiring stories of faith and renewal...	2025-01-01	1
april-2025	April	2025	April 2025	assets/images/covers/apr25_cover.jpg	assets/files/True Bread _ Apr_2025.pdf	Easter a celebration of hope	2025-04-01	4
\.


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 221
-- Name: article_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.article_images_id_seq', 10, 1);


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 223
-- Name: article_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.article_tags_id_seq', 37, 1);


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 225
-- Name: editors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.editors_id_seq', 1, 0);


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 218
-- Name: publication_highlights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publication_highlights_id_seq', 9, 1);


--
-- TOC entry 4739 (class 2606 OID 24844)
-- Name: article_images article_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_images
    ADD CONSTRAINT article_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4741 (class 2606 OID 24856)
-- Name: article_tags article_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 24835)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- TOC entry 4745 (class 2606 OID 24914)
-- Name: editorials editorials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.editorials
    ADD CONSTRAINT editorials_pkey PRIMARY KEY (id);


--
-- TOC entry 4743 (class 2606 OID 24905)
-- Name: editors editors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.editors
    ADD CONSTRAINT editors_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 24775)
-- Name: publication_highlights publication_highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publication_highlights
    ADD CONSTRAINT publication_highlights_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 24768)
-- Name: publications publications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_pkey PRIMARY KEY (id);


--
-- TOC entry 4735 (class 1259 OID 24864)
-- Name: idx_articles_category_ml; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_category_ml ON public.articles USING btree (category_ml);


--
-- TOC entry 4736 (class 1259 OID 24863)
-- Name: idx_articles_content_ml; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_content_ml ON public.articles USING gin (to_tsvector('simple'::regconfig, content_ml));


--
-- TOC entry 4737 (class 1259 OID 24862)
-- Name: idx_articles_title_ml; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_title_ml ON public.articles USING gin (to_tsvector('simple'::regconfig, title_ml));


--
-- TOC entry 4746 (class 1259 OID 24921)
-- Name: idx_editorials_content_ml; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_editorials_content_ml ON public.editorials USING gin (to_tsvector('simple'::regconfig, content_ml));


--
-- TOC entry 4747 (class 1259 OID 24922)
-- Name: idx_editorials_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_editorials_language ON public.editorials USING btree (language);


--
-- TOC entry 4748 (class 1259 OID 24920)
-- Name: idx_editorials_title_ml; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_editorials_title_ml ON public.editorials USING gin (to_tsvector('simple'::regconfig, title_ml));


--
-- TOC entry 4750 (class 2606 OID 24845)
-- Name: article_images article_images_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_images
    ADD CONSTRAINT article_images_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id);


--
-- TOC entry 4751 (class 2606 OID 24857)
-- Name: article_tags article_tags_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id);


--
-- TOC entry 4752 (class 2606 OID 24915)
-- Name: editorials editorials_editor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.editorials
    ADD CONSTRAINT editorials_editor_id_fkey FOREIGN KEY (editor_id) REFERENCES public.editors(id);


--
-- TOC entry 4749 (class 2606 OID 24776)
-- Name: publication_highlights publication_highlights_publication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publication_highlights
    ADD CONSTRAINT publication_highlights_publication_id_fkey FOREIGN KEY (publication_id) REFERENCES public.publications(id);


-- Completed on 2025-04-06 23:59:44

--
-- PostgreSQL database dump complete
--

