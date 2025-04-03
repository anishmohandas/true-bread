-- First, temporarily disable any problematic constraints
ALTER TABLE editors DROP CONSTRAINT IF EXISTS editors_proper_encoding;
ALTER TABLE editorials DROP CONSTRAINT IF EXISTS editorials_proper_encoding;

-- Set proper encoding
SET client_encoding = 'UTF8';

-- Insert the editor
INSERT INTO editors (
    id,
    name,
    role,
    image_url,
    bio,
    name_ml,
    role_ml,
    bio_ml
) VALUES (
    1,
    'Viju Marayamuttom',
    'Contributing Editor',
    'assets/images/editors/viju-Marayamuttom.jpg',
    'Viju Marayamuttom is a respected contributing editor at True Bread Magazine, bringing deep insights into contemporary Christian thought and society.',
    E'വിജു മാരായമുറ്റം',
    E'എഡിറ്റർ',
    E'വിജു മാരായമുറ്റം ട്രൂ ബ്രഡ് മാഗസിനിലെ എഡിറ്ററാണ്, സമകാലിക ക്രിസ്തീയ ചിന്തയിലേക്കും സമൂഹത്തിലേക്കും ആഴമായ കാഴ്ചപ്പാടുകൾ നൽകുന്നു.'
);

-- Insert the editorial
INSERT INTO editorials (
    id,
    title,
    content,
    excerpt,
    publish_date,
    editor_id,
    image_url,
    month,
    year,
    language,
    title_ml,
    content_ml,
    excerpt_ml,
    month_ml
) VALUES (
    'march-2024',
    'Analysis is Essential',
    'The modern era presents increasing challenges to human existence...',
    'A thoughtful analysis of modern challenges facing society and the Christian response',
    '2024-03-01',
    1,
    'assets/images/editorials/march-2024.jpg',
    'March',
    2024,
    'ml',
    E'വിമർശനങ്ങളല്ല; വിശകലനങ്ങൾ അനിവാര്യമാണ്',
    E'മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടമാണിത്. പ്രകൃതിയുടെ സന്തുലനാവസ്ഥ താളം തെറ്റുന്നു. അതിന്റെ അടയാളങ്ങൾ കാലാവസ്ഥാ വ്യതിയാനത്തിലൂടെ പ്രകടമായിരിക്കുന്നതിന്റെ ഏറ്റവും ശ്രദ്ധേയമായ തെളിവാണ് ആഗോളതാപനം ഉൾപ്പെടെയുള്ള പ്രതിസന്ധികൾ. വംശ, വർഗീയ, രാഷ്ട്രീയ തീവ്രവാദങ്ങളും മതമൗലികവാദങ്ങളും പെരുകിക്കൊണ്ടിരിക്കുന്നു. യുദ്ധത്തിന്റെ വിനാശങ്ങൾ ഒഴിഞ്ഞ നാളുകൾ ഭൂപരപ്പിൽ ഉണ്ടായിട്ട് കാലം എത്രയായി. രാജ്യങ്ങൾ രാഷ്ട്രീയ സ്വാതന്ത്ര്യം കൈവരിച്ചെങ്കിലും മറ്റ് പല മേഖലകളിലായി അഭിമുഖീകരിക്കുന്ന ആഭ്യന്തര കലാപങ്ങൾ നിത്യസംഭവങ്ങളാണ്.

സാമൂഹ്യപരിഷ്കർത്താക്കൾ തുടച്ചുമാറ്റാൻ പരിശ്രമിച്ച അതിർവരമ്പുകൾ ഘനം പ്രാപിക്കുന്നു. ഏത് രംഗത്തും നിറഞ്ഞുനിൽക്കുന്ന മത്സരാധിഷ്ഠിത മനോഭാവം നിമിത്തം സ്വാർത്ഥത സർവസാധാരണമാകുന്നു.

ലഹരിയുടെ പ്രത്യാഘാതങ്ങൾ തീവ്രമാണ്. കലാലയങ്ങൾ, ഹോസ്റ്റലുകൾ, തൊഴിലിടങ്ങൾ, പൊതുനിരത്തുകൾ എന്നിവിടങ്ങളിലെല്ലാം അഴിഞ്ഞാടുന്ന ഹൃദയഭേദക സംഭവങ്ങളുടെ പിന്നിലെല്ലാം ലഹരിയുടെ സ്വാധീനം തള്ളിക്കളയാനാവില്ല. ഉറ്റവരുടെ പോലും ജീവനെടുക്കുന്ന കൊലപാതകങ്ങളിലേക്ക് നയിക്കുന്ന മാനസികാവസ്ഥയും വർധിച്ചുവരുന്ന ആത്മഹത്യാ പ്രവണതയും വിശകലന വിധേയമാകേണ്ടതുണ്ട്.

പ്രഥമദൃഷ്ട്യാ ആത്മഹത്യയെന്ന് റിപ്പോർട്ട് ചെയ്യപ്പെടുന്നവ ഇന്നത്തെ സമൂഹത്തിൽ വിരളമല്ല. ഇതിന്റെയെല്ലാം നിജസ്ഥിതി പുറത്തുവരാൻ കടമ്പകൾ ഏറെയുണ്ട്. എല്ലാ സംഭവങ്ങളിലും അത്രയും നീണ്ട പ്രക്രിയകൾ താണ്ടിയുള്ള കാത്തിരിപ്പും പ്രയത്നങ്ങളും ഉണ്ടാവണമെന്നില്ല.

കുടുംബത്തകർച്ചയും വിവാഹമോചനവും കൂടുന്നതേയുള്ളൂ. പുതിയ തലമുറ മൂല്യബോധം നഷ്ടപ്പെട്ട ഒരു മായാലോകത്തിലാണോ എന്ന് സംശയിക്കണം. സഭാജീവിതത്തിൽ നിന്ന് ഇളം തലമുറ അകന്നു കൊണ്ടിരിക്കുന്ന പ്രവണതയും അമ്പരപ്പുളവാക്കുന്നു. ദൈവഭയം കൈമോശം വന്നിരിക്കുന്നു. ഇതൊക്കെ വിരൽ ചൂണ്ടുന്നത് വലിയ അപായസൂചകങ്ങളായാണ്.

ആത്മഹത്യ ഒന്നിനും പരിഹാരമല്ല. ശരിയായ സൗഹൃദങ്ങൾ എന്നത്തെയും പോലെ ഇന്നിന്റെയും അനിവാര്യതയാണ്. ചേർത്തു പിടിക്കുന്ന, ഒപ്പമുള്ള സൗഹൃദങ്ങൾ. സർക്കാർ, സർക്കാരിതര സംവിധാനങ്ങളൊക്കെ പ്രതിവിധികളുമായി ജാഗരൂകരെന്നത് പ്രതീക്ഷ നൽകുന്നു.

ക്രൈസ്തവ സഭയുടെ അനിവാര്യമായ ഇടപെടലുകളും കാലിക പ്രാധാന്യതയുള്ള ദൗത്യ നിർവഹണവും ഇവയ്ക്കൊക്കെയുള്ള ശാശ്വത പരിഹാരമാവണം.',
    E'മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടത്തെക്കുറിച്ചുള്ള വിശകലനം',
    E'മാർച്ച്'
);

-- Re-add the constraints with proper Unicode support
ALTER TABLE editors ADD CONSTRAINT editors_proper_encoding 
CHECK (name_ml IS NULL OR name_ml ~ '^[\\u0D00-\\u0D7F\\s\\p{P}]+$');

ALTER TABLE editorials ADD CONSTRAINT editorials_proper_encoding 
CHECK (title_ml IS NULL OR title_ml ~ '^[\\u0D00-\\u0D7F\\s\\p{P}]+$');

