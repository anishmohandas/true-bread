INSERT INTO publications (id, publication_month, publication_year, title, cover_image, pdf_url, description, publish_date, issue_number) VALUES
('january-2025', 'January', 2025, 'January 2025', 'assets/images/covers/jan25_cover.jpg', 'assets/files/TrueBread_Jan_2025.pdf', 'Start the year with inspiring stories of faith and renewal.', '2025-01-01', 1),
('february-2025', 'February', 2025, 'February 2025', 'assets/images/covers/feb25_cover.jpg', 'assets/files/TrueBread_Feb_2025.pdf', 'February''s edition focuses on love, fellowship, and community.', '2025-02-01', 2),
('march-2025', 'March', 2025, 'March 2025', 'assets/images/covers/march25_cover.jpg', 'assets/files/TrueBread_Mar_2025.pdf', 'In this issue, we explore the depths of Christian faith in modern times.', '2025-03-01', 3),
('april-2025', 'April', 2025, 'April 2025', 'assets/images/covers/apr25_cover.jpg', 'assets/files/TrueBread_Apr_2025.pdf', 'Easter a celebration of hope and redemption.', '2025-04-01', 4),
('may-2025', 'May', 2025, 'May 2025', 'assets/images/covers/may25_cover.jpg', 'assets/files/TrueBread_May_2025.pdf', 'Happy Women''s Day! Celebrate the Godly women in your life.', '2025-05-01', 5),
('june-2025', 'June', 2025, 'June 2025', 'assets/images/covers/jun25_cover.jpg', 'assets/files/TrueBread_Jun_2025.pdf', 'In this beatiful spring season let''s renew our love of learning and growth.', '2025-06-01', 6),
('july-2025', 'July', 2025, 'July 2025', 'assets/images/covers/jul25_cover.jpg', 'assets/files/TrueBread_Jul_2025.pdf', 'In this issue, we shine light on the importance of studying the word of God in these times of uncertainty.', '2025-07-01', 7),
;


INSERT INTO publication_highlights (id, publication_id, title) VALUES
(1, 'january-2025', 'New Beginnings in Christ'),
(2, 'january-2025', 'Faith Stories for 2025'),
(3, 'january-2025', 'Prayer and Meditation Guide'),
(4, 'february-2025', 'The Power of Christian Fellowship'),
(5, 'february-2025', 'Love in Action'),
(6, 'february-2025', 'Building Strong Communities'),
(7, 'march-2025', 'Voice from the Heart, Beyond Words'),
(8, 'march-2025', 'For She Loved Much'),
(9, 'march-2025', 'The Vulture and the Little Girl');
(7, 'march-2025', 'Voice from the Heart, Beyond Words'),
(8, 'march-2025', 'For She Loved Much'),
(9, 'march-2025', 'The Vulture and the Little Girl');
(10, 'april-2025', 'The resurrection of Jesus empowers believers in times of crisis'),
(11, 'april-2025', 'Parenting with grace to let go'),
(12, 'april-2025', 'Awakened church now stand and run');
(13, 'may-2025', 'Woman is a wonder'),
(14, 'may-2025', 'Breaking the chains'),
(15, 'may-2025', 'Benaniah the mighty warrior');
(16, 'june-2025', 'Spring season of self-discovery'),
(17, 'june-2025', 'Faith decisions that shake foundations'),
(18, 'june-2025', 'Re-reading of Child Rights of India');
(19, 'july-2025', 'Learn to learn'),
(20, 'july-2025', 'Questioning: An act of spirituality'),
(21, 'july-2025', 'Are we failing the next generation of biblical leaders?');


INSERT INTO editors (id, name, role, image_url, bio, name_ml, role_ml, bio_ml) VALUES
(1, 'Viju Marayamuttom', 'Chief Editor', 'assets/images/editors/Viju-Marayamuttom.jpg', 'Viju Marayamuttom is a respected contributing editor at True Bread Magazine, bringing deep insights into contemporary Christian thought and society.', 'വിജു മാരായമുറ്റം', 'എഡിറ്റർ', 'വിജു മാരായമുറ്റം ട്രൂ ബ്രഡ് മാഗസിനിലെ എഡിറ്ററാണ്, സമകാലിക ക്രിസ്തീയ ചിന്തയിലേക്കും സമൂഹത്തിലേക്കും ആഴമായ കാഴ്ചപ്പാടുകൾ നൽകുന്നു.');



INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml) VALUES
(
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
TRUE,
'ml',
'അധികാരവും സർവാധിപത്യവും നമ്മുടെ സമൂഹത്തിൽ',
'ഡോ. എം. സ്റ്റീഫൻ',
'പ്രൊഫസർ',
'ഫെയ്ത്ത് തിയോളജിക്കൽ സെമിനാരി',
'വിശ്വാസവും സമൂഹവും',
NULL,
'കഴിഞ്ഞവർഷം കോഴിക്കോട്ടുവച്ചു നടന്ന കേരള ലിറ്ററേച്ചർ ഫെസ്റ്റിവലിൽ സാഹിത്യകാരനായ ശ്രി. എം.ടി. വാസുദേവൻ നായർ ഇന്നത്തെ പ്രസ്ഥാനങ്ങളുടെ അപചയത്തെപ്പറ്റി സൂചിപ്പിക്കുകയുണ്ടായി.',
'മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടത്തെക്കുറിച്ചുള്ള വിശകലനം'
);

INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml) VALUES
(
'parenting-with-grace-to-let-go',
'Parenting with grace to let go',
'Mrs. Renji Sam',
'Counselor',
'Director of Extension Department FTS',
'Faith',
'assets/images/articles/parenting-grace.jpg',
'Parenting with Grace to Let Go image',
'Parenting is a journey unlike any other—a road paved with sleepless nights, heartwarming smiles, and countless lessons learned along the way. It is a dance of love, patience, and resilience, where every step shapes not just the child but also the parent. In this intricate tapestry of life, grace becomes the golden thread—a quiet yet powerful force that softens mistakes, bridges gaps, and nurtures connections.

Grace is the whisper that reminds us to accept imperfections, to pause when tempers rise, and to love unconditionally even when the days feel long and challenging. Grace is when parents silence their inner voice of doubt, conflict, and impatience, and instead lend their ears and heart toward their children’s cries for attention, support, and understanding at any age.

Imagine a garden, where each child is a seed, unique in its own right. Some sprout quickly, while others take their time, quietly growing roots unseen. Parents become the gardeners, tending to the needs of each seed, providing care and grace as a gentle rain, nourishing the soil and souls.

These series of articles are an invitation to parents to embrace grace-filled parenting—where love and understanding triumph over control, mistakes become opportunities, and the goal is not perfection but connection.

Parents must learn the grace to let go. In today’s world, where evil stems deeper, parents feel the urge to hold their children tighter. Their fear casts a shadow over their children’s future. It’s natural to want to protect children from the influences of sin and evil. But here, our spiritual perception calls us to true faith.

A grace-filled parent knows that God’s grace extends beyond physical control. Parents must exhibit faith by entrusting their children to the Lord, trusting God’s goodness, and believing He will mature their faith.

Psalm 127:1-3 reminds us: “Unless the Lord builds the house, they labor in vain who build it; unless the Lord guards the city, the watchman keeps awake in vain.” God assures that He Himself will teach our children. This doesn’t undermine parental responsibility—but highlights that God has His own ways of reaching their hearts.

Parental anxiety, fear, and stress may seem wasted when children misinterpret it as nagging or control. Only God’s touch can make our efforts powerful and fruitful. Parents must teach truth, model grace, and love unconditionally—but it is God who tests and matures their children’s faith.

God’s refining process is necessary for spiritual maturity. James 1:3-4 says, “The testing of your faith produces endurance. And let endurance have its perfect result, so that you may be perfect and complete, lacking in nothing.”

That is Christian parenting—trusting our gracious Father, letting go, and believing that God will finish the good work He began in our children (Romans 14:10).

We have living testimonies all around us.

Marriage is God’s picture of His undying love for humanity. He is our Heavenly Bridegroom; we are His bride. Marriage models God’s grace—serving each other with gratitude for the One who loves us more than any human bond.

Parenting is also a period of self-growth, discipline, and heavenly progress—not just for the child, but especially for the parent. Parents are refined, their strengths and weaknesses revealed through the journey. God’s grace guides parents, never stepping back from connecting with them through all life stages.

**Word for Parental Encouragement:**  
Isaiah 54:13 — “All your children shall be taught by the Lord, and great shall be the peace of your children.”',
'An exploration of how Christianity adapts and remains relevant in our modern world...',
'2024-03-15',
8,
TRUE,
'1',
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml) VALUES
(
'women-and-crisis-lessons-from-eve',
'Women and Crisis: Lessons from the Life of Eve',
'Dr. Annie George',
'Principal',
'Faith Theological Seminary',
'Biblical Studies',
'assets/images/articles/eve-garden.jpg',
'Artistic representation of Eve in the Garden of Eden',
'Biblical women, beginning with the first woman, faced various crises and challenges—whether personal, family-related, or affecting their nation. Some overcame them with God’s help, while others failed. Their stories remind us of the importance of relying on God in times of crisis, trusting Him for strength and guidance.

As we celebrate Women’s Day, the lives of biblical women offer valuable insights into the crises women face today, as well as their resilience and victories across generations.

This article focuses on Eve, the first woman, whose story in Genesis 2-4 reflects struggles that continue to resonate with many women today:

1. **Temptation:**  
The serpent tempted Eve by questioning God’s command about the Tree of Knowledge of Good and Evil. She was lured by the promise of wisdom and god-like knowledge (Genesis 3:5).

2. **Disobedience:**  
Eve ate the forbidden fruit and gave some to Adam. This disobedience—known as “The Fall”—brought sin into the world.

3. **Judgment:**  
God’s judgment followed. Eve faced pain in childbirth and a complicated relationship with Adam. They were expelled from Eden, losing direct fellowship with God.

4. **Sibling Rivalry and Sin:**  
Her son Cain killed Abel in jealousy, leading to both family tragedy and the first murder.

5. **Grief and Loss:**  
Eve endured the pain of losing Abel to death and Cain to exile, a profound emotional burden.

---

**How Did Eve Overcome These Crises?**

1. **Acknowledging Sin:**  
Eve admitted her mistake before God, confessing that the serpent deceived her (Genesis 3:13). Confession is a step toward healing.

2. **Receiving God’s Mercy:**  
God clothed Adam and Eve, showing care even in judgment. He also promised a future Redeemer (Genesis 3:15).

3. **Faith in God’s Promise:**  
Eve named her firstborn Cain, expressing faith that God had helped her bear a son (Genesis 4:1).

4. **Hope for Redemption:**  
Despite her sorrow, Eve’s story connects to God’s redemptive plan, which ultimately leads to Christ.

5. **Experiencing God’s Justice and Mercy:**  
God dealt justly with Cain yet also showed mercy by protecting him.

6. **God’s Promise Sustained Her Hope:**  
Genesis 3:15 gave Eve hope that her offspring would one day defeat evil.

7. **Birth of Seth:**  
After Abel’s death, Eve gave birth to Seth, acknowledging God’s provision. From Seth’s line came Noah and eventually Christ.

8. **Faith in God’s Sovereignty:**  
Eve trusted that God’s plans would prevail despite her hardships.

---

**Lessons for Today:**

1. **The Reality of Sin:**  
Sin affects individuals, families, and communities. Staying grounded in God’s Word helps recognize and resist sin.

2. **Confess and Repent:**  
Acknowledging mistakes opens the door to healing.

3. **Faith Amid Pain:**  
Eve’s trust in God amidst suffering encourages us to find strength in His promises.

4. **Trust God’s Plan:**  
God’s promises remain sure even during dark seasons. His mercy and redemption outweigh our mistakes.

---

As we honor women today, Eve’s story reminds us that women are not defined by their struggles, but by God’s grace and redemption. The strength, faith, and resilience of women continue to shape history—and God remains faithful to every generation.',
'Exploring the challenges and triumphs of the first woman, Eve, and the valuable lessons her life offers to women today...',
'2024-03-08',
15,
TRUE,
'1',
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml) VALUES
(
'voice-from-the-heart-beyond-words',
'Voice from the Heart, Beyond Words',
'Sneha Samuel',
NULL,
NULL,
'Faith & Society',
'assets/images/articles/church-unity.jpg',
'A diverse group of Christians worshipping together',
'“One day, I was traveling with my family in an auto-rickshaw. My father started talking to the auto-driver about Jesus Christ, while the driver, a kind man, shared his experiences from his faith. He mentioned that he used to be an ambulance driver and had traveled all over India, accumulating a lot of life experiences. Even now, as an auto driver, he still prays whenever he passes by a temple, mosque, or church.” (18th June 2024)

This isn’t something unusual; we often hear similar feelings from spiritual people. I’ve heard it many times from my school and college friends as well. It made me reflect—if an ordinary man or woman can genuinely pray to any deity regardless of religious differences, why can’t Christians worship and praise God together, despite belonging to different Christian traditions? After all, we share the same God and faith.

When a child is born into a family, they usually adopt that family’s tradition, often leading to other traditions being seen as less significant. Similarly, when someone regularly attends a particular church, they often become identified with that culture. So the ‘Church’ became the medium which makes ‘Christian’ apart from other Christians.

The origin of the word ‘church’ can be traced to two foundational words—‘qahal’ and ‘ekklesia.’ The Greek word *ekklesia* (εκκλησία) is used in the Septuagint to translate the Hebrew word *qahal* (קהל). Most English versions translate *qahal* as ‘congregation’ or ‘assembly,’ hence its common application to the ‘church’ in the Old Testament. The term *Qahal Yehweh* describes the gathering of God’s people, often for worship or instruction. The gathering of God’s people is not confined to the New Testament but is evident throughout the Old Testament as well.

In the Old Testament, God gathered His people at specific places where His presence dwelled, offering them the opportunity to know Him, worship Him, obey Him, and communicate with Him—often through His anointed leaders. However, these sacred places were not always free from human failings, as irresponsibility, corruption, disobedience, and wickedness occasionally occurred.

Even amidst spiritual decline, God revealed Himself through faithful servants—kings, judges, prophets—guiding His people back to true doctrine. He consistently upheld the sanctity of His dwelling place and emphasized the need for purity of heart among His people.

In the New Testament, Jesus emphasized this principle when He declared, “My house shall be called a house of prayer, but you have made it a den of thieves” (Matthew 21:13), underlining the need for holiness and sincerity in worship. This statement was made when Jesus drove out the merchants from the temple in Jerusalem, expressing deep concern for the sanctity of God’s house.

Jesus’ words—“My House”—continue to resonate today, reminding us of the true purpose of spaces dedicated to worship and prayer. Over the past 2,000 years, we’ve built countless church traditions, missionary values, and rituals that are important to preserve. However, when we recount these histories, we must ask ourselves: “Where is Christ?” Are we truly centered on Him?

If we genuinely admire Christ, why do we feel divided when we encounter others from different Christian traditions? Can today’s Church truly reflect the “House of God” as Jesus described?

Sadly, many churches have shifted from being God-centered assemblies to individual-centered congregations, where divisions, conflicts, and disputes abound—often even involving legal action.

Still, I am filled with joy whenever I see churches around me. These “prayer houses” remind me of the faith warriors who built them through tears and sacrifice, and of the people who seek God’s grace within their walls.

For me, Christianity is about a personal relationship with God through Jesus Christ and the Holy Spirit. The Church is the house of His people. Yet, I also feel His presence wherever I go—because Christ dwells within me, just as He is reflected in the physical churches I see around me.

I sin; He forgives. I stumble; He lifts me up. When I feel alone, He loves me. When I stray, He seeks me. Despite my flaws, He places me on solid ground. It’s just me and God.

Isn’t that what the true Church embodies?

**Disclaimer:** These words are not intended to hurt anyone. I sincerely apologize if they do. Words can only partially express what is truly in our hearts.',
'A heartfelt reflection on Christian unity, church traditions, and the true meaning of worship beyond denominational boundaries...',
'2024-06-18',
8,
TRUE,
'1',
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml) VALUES
(
'for-she-loved-much',
'For She Loved Much',
'Rachel John',
NULL,
NULL,
'Biblical Studies',
'assets/images/articles/mary-magdalene.jpg',
'Artistic representation of Mary Magdalene',
'Mary Magdalene from the small town of Magdala was one of the most inspiring women in the Bible. She is often recognized among the women who followed Jesus and His disciples on their preaching journeys, generously supporting them out of her own resources (Luke 8:2-3). She had a profound reason to quietly serve her Lord, showing gratitude to the One who redeemed her from torment and spiritual bondage.

Jesus’ response to a disciple who criticized the perceived “waste” of precious ointment perfectly applies to Mary: “For she loved much” (Luke 7:47). Love was the force behind her bold choice to walk alongside Him through shame, betrayal, and suffering. Mary’s deep devotion, quiet service, and grateful love flowed naturally in response to Christ’s redeeming grace that lifted her from condemnation.

Mary Magdalene was an integral part of the women who accompanied Jesus from Galilee to Jerusalem (Matthew 27:55-56). When Jesus’ male disciples fled in fear, she remained near Him. She witnessed the insults, torture, and suffering He endured. She watched as He carried His cross and saw the soldiers hammering nails into His hands and feet. She heard the mocking criminals beside Him and was there during His moments of agony.

Her heart broke as she heard His anguished cry, “My God, my God, why have You forsaken Me?” Mary understood this was the darkest hour—the moment even the Father turned His face away as Jesus bore the world’s sin. She had already realized the depth of His love, as He willingly gave His life for His friends.

Mary remained near the cross, grieving and contemplating all the miraculous acts Jesus had performed. She watched as He took His final breath and yielded His spirit to God.

Her devotion didn’t end there. Mary stayed near the tomb where Jesus was laid (Matthew 27:61), unwilling to leave the one she loved. She waited in hope and was rewarded on the morning of His resurrection—Jesus appeared to her in the garden and spoke her name, filling her heart with joy and commissioning her to tell the others (John 20:16-17).

Mary’s story is a testimony of steadfast love and unwavering devotion. She teaches us that love for Christ leads us through every hardship and into the joy of His resurrection.

---

**Dear readers,**  
Are we stirred by Mary Magdalene’s passionate devotion—her willingness to follow Jesus to the cross and her eagerness to remain close even after His death?  
Can we, like Mary, draw near to Christ, offering Him the best of our time, talents, and hearts?  

Her story reminds us that loving Christ deeply means walking with Him through every season, no matter the cost.',
'Exploring the profound devotion and love of Mary Magdalene, from her redemption to her faithful presence at the cross...',
'2024-03-22',
10,
TRUE,
'1',
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language, title_ml, author_ml, job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml) VALUES
(
'the-vulture-and-the-little-girl',
'The Vulture and the Little Girl',
'Dr. Binu B. Peniel',
'Principal',
'Faith Theological Seminary',
'Faith & Society',
'assets/images/articles/vulture-girl.jpg',
'The Vulture and the Little Girl - 1993 Pulitzer Prize winning photograph',
'Some of you might remember the haunting photograph titled *The Vulture and the Little Girl* (1993), also known as *Struggling Girl* or *The Vulture is Hungry*. This image stirred the world’s conscience. The vulture waits nearby as the starving child struggles to reach a feeding center—both on the brink of death.

The photograph was taken by South African photojournalist Kevin Carter near the village of Ayod in Sudan. He carefully waited for about 20 minutes to capture the moment when the vulture was near enough to frame both the bird and the child in a single shot.

At the time, Carter didn’t realize the magnitude of what he had captured—one of the most controversial photographs in journalism history. When it appeared in *The New York Times* on March 26, 1993, it prompted thousands of calls from readers asking, “What happened to the child?” Sadly, the child’s fate remains unknown, though she was strong enough to walk away after the photo was taken.

Carter faced immense criticism for not intervening. One editorial noted:  
“The man adjusting his lens to take just the right frame of her suffering might just as well be another vulture.”  
In truth, photographers were instructed not to touch famine victims due to disease risks.

Haunted by this image and others, Carter later took his own life. In his final note, he wrote of being overwhelmed by pain, financial struggles, and trauma from the atrocities he had witnessed.

---

**Reflection:**

This story raises deep questions about human suffering and our response as Christians.

Jesus declared in Luke 6:20-26:  
“Blessed are you who are poor, for yours is the kingdom of God. Blessed are you who hunger now, for you will be satisfied. Blessed are you who weep now, for you will laugh.”

Luke’s Gospel presents the universality of Jesus’ message—hope for the marginalized and oppressed. It reminds us that the Gospel calls us to compassion and action, even when society normalizes suffering.

The photograph forces us to confront uncomfortable truths about ourselves. We live in an age obsessed with “self”—self-esteem, self-promotion, self-gratification—yet we ignore our brokenness, sin, and moral failures.

The Gospel offers a countercultural message:  
We are called to live God-centered lives—not ego-centered ones.

Friedrich Nietzsche wrote, “To live is to suffer; to survive is to find meaning in the suffering.”  
The Gospel goes further, offering hope, redemption, and an upside-down kingdom where the last become first, and where suffering is met with grace.

---

**Challenge:**

We are both noble and flawed.  
We build hospitals and churches—but also prisons and weapons of destruction.  
We are both compassionate and selfish.

How do we move from self-centeredness to God-centeredness?

Mahatma Gandhi famously said, “I like your Christ. I do not like your Christians. Your Christians are so unlike your Christ.”

Let us strive to prove him wrong—not through mere words, but through lives of love, sacrifice, and grace, reflecting Christ in all we do.

Let us live as the early disciples did—so Christ-like that others called them “Christians,” or “little Christs” (Acts 11:26).',
'A profound reflection on Kevin Carter\'s haunting 1993 photograph from Sudan, exploring its impact on humanity and the Christian response to suffering in our world...',
'2024-03-15',
12,
TRUE,
'1',
NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);


INSERT INTO article_images (id, article_id, url, alt, caption, alt_ml, caption_ml) VALUES
(1, 'voice-from-the-heart-beyond-words', 'assets/images/articles/church-unity-main.jpg', 'Diverse Christian worship gathering', 'Christians from different traditions coming together in worship', NULL, NULL),
(2, 'voice-from-the-heart-beyond-words', 'assets/images/articles/church-history.jpg', 'Historical church building', 'A reminder of our rich Christian heritage and traditions', NULL, NULL),
(3, 'for-she-loved-much', 'assets/images/articles/mary-magdalene-main.jpg', 'Mary Magdalene at the cross', 'Mary Magdalene\'s devotion led her to follow Jesus to the cross', NULL, NULL),
(4, 'for-she-loved-much', 'assets/images/articles/resurrection-garden.jpg', 'Garden of resurrection', 'The garden where the risen Christ appeared to Mary Magdalene', NULL, NULL),
(5, 'women-and-crisis-lessons-from-eve', 'assets/images/articles/eve-garden-main.jpg', 'Artistic depiction of Eve in the Garden of Eden', 'Eve\'s story begins in the Garden of Eden', NULL, NULL),
(6, 'women-and-crisis-lessons-from-eve', 'assets/images/articles/eve-legacy.jpg', 'Symbolic representation of Eve\'s legacy', 'Eve\'s legacy continues through generations of women', NULL, NULL),
(7, 'the-vulture-and-the-little-girl', 'assets/images/articles/vulture-girl-main.jpg', 'The Vulture and the Little Girl - Kevin Carter\'s Pulitzer Prize photograph', 'Kevin Carter\'s 1993 Pulitzer Prize-winning photograph from Sudan', NULL, NULL),
(8, 'the-vulture-and-the-little-girl', 'assets/images/articles/kevin-carter.jpg', 'Kevin Carter portrait', 'Photographer Kevin Carter who captured the iconic image', NULL, NULL),
(10, 'authority-and-supremacy', 'assets/images/articles/authority-main.jpg', 'Christian leadership concept illustration', 'Understanding Christian leadership in modern times', 'ക്രിസ്തീയ നേതൃത്വത്തിന്റെ ചിത്രീകരണം', 'ആധുനിക കാലത്ത് ക്രിസ്തീയ നേതൃത്വം മനസ്സിലാക്കൽ');

INSERT INTO article_tags (id, article_id, tag, tag_ml) VALUES
(1, 'voice-from-the-heart-beyond-words', 'Christianity', NULL),
(2, 'voice-from-the-heart-beyond-words', 'Church Unity', NULL),
(3, 'voice-from-the-heart-beyond-words', 'Faith', NULL),
(4, 'voice-from-the-heart-beyond-words', 'Worship', NULL),
(5, 'voice-from-the-heart-beyond-words', 'Traditions', NULL),
(6, 'voice-from-the-heart-beyond-words', 'Spirituality', NULL),
(7, 'for-she-loved-much', 'Biblical Studies', NULL),
(8, 'for-she-loved-much', 'Women', NULL),
(9, 'for-she-loved-much', 'Faith', NULL),
(10, 'for-she-loved-much', 'Devotion', NULL),
(11, 'for-she-loved-much', 'Jesus', NULL),
(12, 'for-she-loved-much', 'Bible Stories', NULL),
(13, 'women-and-crisis-lessons-from-eve', 'Biblical Studies', NULL),
(14, 'women-and-crisis-lessons-from-eve', 'Women', NULL),
(15, 'women-and-crisis-lessons-from-eve', 'Faith', NULL),
(16, 'women-and-crisis-lessons-from-eve', 'Redemption', NULL),
(17, 'women-and-crisis-lessons-from-eve', 'Genesis', NULL),
(18, 'women-and-crisis-lessons-from-eve', 'Bible Stories', NULL),
(19, 'the-vulture-and-the-little-girl', 'Faith', NULL),
(20, 'the-vulture-and-the-little-girl', 'Society', NULL),
(21, 'the-vulture-and-the-little-girl', 'Photojournalism', NULL),
(22, 'the-vulture-and-the-little-girl', 'Christianity', NULL),
(23, 'the-vulture-and-the-little-girl', 'Social Justice', NULL),
(24, 'the-vulture-and-the-little-girl', 'Humanity', NULL),
(25, 'parenting-with-grace-to-let-go', 'Christianity', NULL),
(26, 'parenting-with-grace-to-let-go', 'Modern Faith', NULL),
(27, 'parenting-with-grace-to-let-go', 'Digital Church', NULL),
(33, 'authority-and-supremacy', 'Authority', 'അധികാരം'),
(34, 'authority-and-supremacy', 'Leadership', 'നേതൃത്വം'),
(35, 'authority-and-supremacy', 'Society', 'സമൂഹം'),
(36, 'authority-and-supremacy', 'Faith', 'വിശ്വാസം'),
(37, 'authority-and-supremacy', 'Church', 'സഭ');


INSERT INTO editorials 
(id, title, content, excerpt, publish_date, editor_id, image_url, month, year, language, title_ml, content_ml, excerpt_ml, month_ml) VALUES
(
  'march-2025',
  'Analysis is Essential',
  'The modern era presents increasing challenges to human existence...',
  'A thoughtful analysis of modern challenges facing society and the Christian response',
  '2025-03-01',
  1,
  'assets/images/editorials/march-2024.jpg',
  'March',
  2025,
  'ml',
  'വിമർശനങ്ങളല്ല; വിശകലനങ്ങൾ അനിവാര്യമാണ്',
  '"മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടമാണിത്. പ്രകൃതിയുടെ സന്തുലനാവസ്ഥ താളം തെറ്റുന്നു. അതിന്റെ അടയാളങ്ങൾ കാലാവസ്ഥാ വ്യതിയാനത്തിലൂടെ പ്രകടമായിരിക്കുന്നതിന്റെ ഏറ്റവും ശ്രദ്ധേയമായ തെളിവാണ് ആഗോളതാപനം ഉൾപ്പെടെയുള്ള പ്രതിസന്ധികൾ. വംശ, വർഗീയ, രാഷ്ട്രീയ തീവ്രവാദങ്ങളും മതമൗലികവാദങ്ങളും പെരുകിക്കൊണ്ടിരിക്കുന്നു. യുദ്ധത്തിന്റെ വിനാശങ്ങൾ ഒഴിഞ്ഞ നാളുകൾ ഭൂപരപ്പിൽ ഉണ്ടായിട്ട് കാലം എത്രയായി. രാജ്യങ്ങൾ രാഷ്ട്രീയ സ്വാതന്ത്ര്യം കൈവരിച്ചെങ്കിലും മറ്റ് പല മേഖലകളിലായി അഭിമുഖീകരിക്കുന്ന ആഭ്യന്തര കലാപങ്ങൾ നിത്യസംഭവങ്ങളാണ്. സാമൂഹ്യപരിഷ്കർത്താക്കൾ തുടച്ചുമാറ്റാൻ പരിശ്രമിച്ച അതിർവരമ്പുകൾ ഘനം പ്രാപിക്കുന്നു. ഏത് രംഗത്തും നിറഞ്ഞുനിൽക്കുന്ന മത്സരാധിഷ്ഠിത മനോഭാവം നിമിത്തം സ്വാർത്ഥത സർവസാധാരണമാകുന്നു. ലഹരിയുടെ പ്രത്യാഘാതങ്ങൾ തീവ്രമാണ്. കലാലയങ്ങൾ, ഹോസ്റ്റലുകൾ, തൊഴിലിടങ്ങൾ, പൊതുനിരത്തുകൾ എന്നിവിടങ്ങളിലെല്ലാം അഴിഞ്ഞാടുന്ന ഹൃദയഭേദക സംഭവങ്ങളുടെ പിന്നിലെല്ലാം ലഹരിയുടെ സ്വാധീനം തള്ളിക്കളയാനാവില്ല. ഉറ്റവരുടെ പോലും ജീവനെടുക്കുന്ന കൊലപാതകങ്ങളിലേക്ക് നയിക്കുന്ന മാനസികാവസ്ഥയും വർധിച്ചുവരുന്ന ആത്മഹത്യാ പ്രവണതയും വിശകലന വിധേയമാകേണ്ടതുണ്ട്. പ്രഥമദൃഷ്ട്യാ ആത്മഹത്യയെന്ന് റിപ്പോർട്ട് ചെയ്യപ്പെടുന്നവ ഇന്നത്തെ സമൂഹത്തിൽ വിരളമല്ല. ഇതിന്റെയെല്ലാം നിജസ്ഥിതി പുറത്തുവരാൻ കടമ്പകൾ ഏറെയുണ്ട്. എല്ലാ സംഭവങ്ങളിലും അത്രയും നീണ്ട പ്രക്രിയകൾ താണ്ടിയുള്ള കാത്തിരിപ്പും പ്രയത്നങ്ങളും ഉണ്ടാവണമെന്നില്ല. കുടുംബത്തകർച്ചയും വിവാഹമോചനവും കൂടുന്നതേയുള്ളൂ. പുതിയ തലമുറ മൂല്യബോധം നഷ്ടപ്പെട്ട ഒരു മായാലോകത്തിലാണോ എന്ന് സംശയിക്കണം. സഭാജീവിതത്തിൽ നിന്ന് ഇളം തലമുറ അകന്നു കൊണ്ടിരിക്കുന്ന പ്രവണതയും അമ്പരപ്പുളവാക്കുന്നു. ദൈവഭയം കൈമോശം വന്നിരിക്കുന്നു. ഇതൊക്കെ വിരൽ ചൂണ്ടുന്നത് വലിയ അപായസൂചകങ്ങളായാണ്. ആത്മഹത്യ ഒന്നിനും പരിഹാരമല്ല. ശരിയായ സൗഹൃദങ്ങൾ എന്നത്തെയും പോലെ ഇന്നിന്റെയും അനിവാര്യതയാണ്. ചേർത്തു പിടിക്കുന്ന, ഒപ്പമുള്ള സൗഹൃദങ്ങൾ. സർക്കാർ, സർക്കാരിതര സംവിധാനങ്ങളൊക്കെ പ്രതിവിധികളുമായി ജാഗരൂകരെന്നത് പ്രതീക്ഷ നൽകുന്നു. ക്രൈസ്തവ സഭയുടെ അനിവാര്യമായ ഇടപെടലുകളും കാലിക പ്രാധാന്യതയുള്ള ദൗത്യ നിർവഹണവും ഇവയ്ക്കൊക്കെയുള്ള ശാശ്വത പരിഹാരമാവണം."',
  'മനുഷ്യരാശിയുടെ നിലനിൽപ്പിന് വെല്ലുവിളി വർധിച്ചുകൊണ്ടിരിക്കുന്ന കാലഘട്ടത്തെക്കുറിച്ചുള്ള വിശകലനം',
  'മാർച്ച്'
);

