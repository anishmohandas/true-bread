-- First insert the editor
INSERT INTO editors (
    id,
    name,
    role,
    image_url,
    bio,
    -- Malayalam fields
    name_ml,
    role_ml,
    bio_ml
) VALUES (
    1,
    'Viju Marayamuttam',
    'Contributing Editor',
    'assets/images/editors/viju-marayamuttam.jpg',
    'Viju Marayamuttam is a respected contributing editor at True Bread Magazine, bringing deep insights into contemporary Christian thought and society.',
    'hnPp amcmbap«w',
    'FUnäÀ',
    'hnPp amcmbap«w {Sq {_Uv amKkn\nse FUnädmWv, kaImenI {InkvXob Nn´bnte¡pw kaql¯nte¡pw Bgamb ImgvN¸mSpIÄ \ÂIp¶p.'
);

-- Then proceed with your existing editorial insert
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
    -- Malayalam fields
    title_ml,
    content_ml,
    excerpt_ml,
    month_ml
) VALUES (
    'march-2024',
    'Analysis is Essential',
    'English content here...',
    'A thoughtful analysis of modern challenges facing society...',
    '2024-03-01',
    1,
    'assets/images/editorials/march-2024.jpg',
    'March',
    2024,
    -- Malayalam content
    'hnaÀi\§fÃ; hniIe\§Ä A\nhmcyamWv',
    'a\pjycminbpsS \ne\nÂ¸n\v shÃphnfn hÀ[n¨psImïncn¡p¶ ImeL«amWnXv. {]IrXnbpsS k´p e\mhØ Xmfw sXäp¶p. AXnsâ ASbmf§Ä ImemhØm hyXnbm\¯neqsS {]ISambncn¡p¶Xnsâ Gähpw {it²bamb sXfnhmWv BtKmfXm]\w DÄs¸sSbpÅ {]Xn kÔnIÄ. hwi, hÀKob, cm{ãob Xo{hhmZ§fpw aXauenIhmZ§fpw s]cpIns¡mïncn¡p¶p. bp²¯nsâ hn\mi§Ä Hgnª \mfpIÄ `q]c¸nÂ Dïmbn«v Imew F{Xbmbn. cmPy§Ä cm{ãob kzmX{´yw ssIhcns¨¦nepw aäv ]e taJeIfnembn A`napJoIcn¡p¶ B`y´c Iem]§Ä \nXykw`h§fmWv...',
    'a\pjycminbpsS \ne\nÂ¸n\v shÃphnfn hÀ[n¨psImïncn¡p¶ ImeL«s¯¡pdn¨pÅ hniIe\w',
    'amÀ¨v'
);
