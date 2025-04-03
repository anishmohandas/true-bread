-- First, temporarily disable the constraint if it exists
ALTER TABLE articles DROP CONSTRAINT IF EXISTS proper_encoding;

-- Set proper encoding
SET client_encoding = 'UTF8';

-- Update the article with proper Unicode Malayalam content
INSERT INTO articles (
    id, title, author, job_title, works_at, category, 
    image_url, alt_text, content, excerpt, publish_date, 
    read_time, is_featured, language,
    title_ml, author_ml, job_title_ml, works_at_ml, category_ml, 
    content_ml, excerpt_ml
) VALUES (
    'authority-and-supremacy',
    'Authority and Supremacy in Our Society',
    'Dr. M. Stephen',
    'Professor',
    'Faith Theological Seminary',
    'Faith & Society',
    'assets/images/articles/authority.jpg',
    'Illustration representing authority and leadership in society',
    'An exploration of authority and leadership in modern Christian society...',
    'A thoughtful analysis of how authority and leadership manifest in our community...',
    '2024-03-15',
    12,
    true,
    'ml',
    E'അധികാരവും സർവാധിപത്യവും നമ്മുടെ സമൂഹത്തിൽ',
    E'ഡോ. എം. സ്റ്റീഫൻ',
    E'പ്രൊഫസർ',
    E'ഫെയ്ത്ത് തിയോളജിക്കൽ സെമിനാരി',
    E'വിശ്വാസവും സമൂഹവും',
    E'കഴിഞ്ഞവർഷം കോഴിക്കോട്ടുവച്ചു നടന്ന കേരള ലിറ്ററേച്ചർ ഫെസ്റ്റിവലിൽ സാഹിത്യകാരനായ ശ്രി. എം.ടി. വാസുദേവൻ നായർ ഇന്നത്തെ പ്രസ്ഥാനങ്ങളുടെ അപചയത്തെപ്പറ്റി സൂചിപ്പിക്കുകയുണ്ടായി. അധികാരത്തെ ആധിപത്യമായും സർവാധിപത്യമായും നാം തെറ്റിദ്ധരിക്കുന്നു എന്നദ്ദേഹം ചൂണ്ടിക്കാട്ടി. കൂടാതെ അധികാരമെന്നാൽ ജനസേവനത്തിനു കിട്ടുന്ന ഒരവസരമെന്ന സിദ്ധാന്തത്തെ പണ്ടേന്നോ നാം കുഴിവെട്ടി മൂടി എന്നും താൻ വിലപിക്കുന്നു. അദ്ദേഹത്തിന്റെ അഭിപ്രായത്തിൽ, ഭരണാധികാരി എറിഞ്ഞു കൊടുക്കുന്ന ഔദാര്യത്തുണ്ടുകളല്ല സ്വാതന്ത്ര്യം. നയിക്കാൻ ഏതാനും പേരും നയിക്കപ്പെടാൻ അനേകം പേരും എന്ന വീക്ഷണം തിരുത്തലിനു വിധേയമാകണമെന്നും താൻ നിർദ്ദേശിച്ചു (മലയാളമനോരമ (ദിനപത്രം), ജനുവരി 12, 2024, പേജ് - 8).\n\nഇറ്റാലിയൻ ചിന്തകനായ അന്റോണിയോ ഗ്രാംഷി, ഒരു ഭൂരിപക്ഷസമൂഹം ന്യൂനപക്ഷസമൂഹത്തിന്റെമേൽ സമ്മർദ്ദം ചെലുത്തുന്നതും അവരെ കീഴ്പ്പെടുത്താൻ ശ്രമിക്കുന്നതുമായ പ്രവണതയെ മേൽക്കോയ്മ (Hegemony) എന്ന് നിരീക്ഷിച്ചിട്ടുണ്ട്. അധികാര വികേന്ദ്രീകരണത്തിനും പങ്കാളിത്തത്തിനും ഒരു സ്ഥാനവുമില്ലാത്ത ഒരു തല്പരകക്ഷികളുടെ സ്വാർത്ഥത നിറഞ്ഞ സമൂഹമായി, ഒരു പ്രസ്ഥാനമായി നാം അധഃപതിച്ചു. പണവും ബലപ്രയോഗവും കുതന്ത്രങ്ങളും ഇന്നത്തെ നേതൃത്വത്തിന്റെ വഴികാട്ടികളാണ്. ആത്മീയ നേതൃത്വം (Spiritual leadership) എന്ന ചിന്തയ്ക്ക് ഇന്ന് സ്ഥാനമില്ല. അനാത്മീക-അധാർമ്മിക മാർഗ്ഗങ്ങളാണ് സ്ഥാനമാനങ്ങൾ നേടാനുള്ള വഴിയായി നാം ഇന്ന് പ്രയോഗിക്കുന്നത്.\n\nപൊതുവേദികളിൽ അവസരം നല്കുന്നതും പണം സംഭാവന ചെയ്യുന്നതിന്റെ അടിസ്ഥാനത്തിലാണ്. വികലമായ വേദപുസ്തകവ്യാഖ്യാനങ്ങളും ഉപരിപ്ലവമായ ആത്മീകതയുമെല്ലാം നമ്മുടെ ശൈലിയായി അംഗീകരിക്കപ്പെട്ടു. സ്വജനപക്ഷപാതവും ഗ്രൂപ്പുകളികളും മറ്റ് കിടമത്സരങ്ങളും നമ്മുടെ സമൂഹത്തിൽ സ്ഥാനം നേടി. എല്ലാവരേയും ചേർത്തുനിർത്തുക എന്ന മനോഭാവത്തെ നാം എപ്പോഴോ കുഴിച്ചു മൂടി. ഇപ്പോൾ കൂടുതൽ കാണുന്നത് വെട്ടിനിരത്തലാണ്. \'ഞാൻ മതി, വേറാരും വേണ്ട\' എന്ന ചിന്താഗതി വിശ്വാസസമൂഹത്തിലും ശുശ്രൂഷക്കാർക്കിടയിലും വളർന്നു പന്തലിച്ചിരിക്കുന്നു. മറ്റുള്ളവരുടെ വളർച്ചയ്ക്കും ഉയർച്ചയ്ക്കും തുരങ്കം വയ്ക്കുന്ന പ്രവണത വർദ്ധിച്ചുവരുന്നു. ദൈവജനത്തെ ആത്മീയദർശനം നല്കി വഴിനടത്തുന്നതിനു പകരം ഇപ്പോഴത്തെ നേതൃത്വത്തിന്റെ ദൗത്യം ശുശ്രൂഷകന്മാരേയും സഭാജനങ്ങളേയും രാഷ്ട്രീയവൽക്കരിച്ച് പക്ഷം ചേർത്ത് തങ്ങളുടെ സ്ഥാനവും പദവികളും ഉറപ്പിക്കലാണ്.',
    E'അധികാരത്തിന്റെയും നേതൃത്വത്തിന്റെയും പ്രസക്തമായ വിശകലനം'
);

-- Insert Malayalam tags
INSERT INTO article_tags (article_id, tag, tag_ml) VALUES
('authority-and-supremacy', 'Authority', E'അധികാരം'),
('authority-and-supremacy', 'Leadership', E'നേതൃത്വം'),
('authority-and-supremacy', 'Society', E'സമൂഹം'),
('authority-and-supremacy', 'Faith', E'വിശ്വാസം'),
('authority-and-supremacy', 'Church', E'സഭ');

-- Insert article images with Malayalam captions
INSERT INTO article_images (article_id, url, alt, caption, alt_ml, caption_ml) VALUES
('authority-and-supremacy', 
 'assets/images/articles/authority-main.jpg',
 'Christian leadership concept illustration',
 'Understanding Christian leadership in modern times',
 E'ക്രിസ്തീയ നേതൃത്വത്തിന്റെ ചിത്രീകരണം',
 E'ആധുനിക കാലത്ത് ക്രിസ്തീയ നേതൃത്വം മനസ്സിലാക്കൽ'
);

-- Add back the constraint with a more reliable regex pattern
ALTER TABLE articles ADD CONSTRAINT proper_encoding 
CHECK (title_ml IS NULL OR title_ml ~ '^[ഀ-ൿ\s\p{P}]+$');


