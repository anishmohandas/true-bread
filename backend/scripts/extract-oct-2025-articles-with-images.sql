
-- Insert English articles from October 2025 issue
INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language) VALUES
('friends-wound-enemy-kiss', 'FRIEND''S WOUND AND ENEMY''S KISS', 'Dr. Viju Wilson', 'Theologian and Author', 'Christian Institute for Cultural Studies', 'Theology', 'assets/images/articles/friends-wound-enemy-kiss.jpg', 'Illustration representing the paradox of friendship and enmity', 'We tend to define friendship through the lens of
comfort, convenience, and compliance. For
many, disagreement is tolerable in a friendship, but
questioning their decisions or attitudes can wound
their psyche. Can a friend hurt us? The words, actions,
or the silence of friends can cause wounds. Often, we
express this saying, ‘I am hurt.’ In life, we typically
encounter two types of friends: first, a true, real, and
genuine friend; and second, a friend who is actually
an enemy, a friend-cum-enemy. Both may appear as
friends but differ in their approaches, motives, and
strategies. They are part of our lives, travelling with us
and sharing our personal and public spaces. The problem
many of us face is the inability to discern who is ‘real’ among them. Too often, we define their
loyalty by how they positively respond to
what we think and affirm.
A real friend may not agree with all our
decisions. They chastise us, contest our thinking,
and appreciate our integrity. They speak
up when we are on the wrong path, offering
face-to-face confrontation and timely advice.
They don’t stab us in the back; instead, they
point out our flaws. They stay with us without
expecting benefits. They expect the least
but attempt for the best in us. They understand
our minds, celebrate our successes, and share
in our pain. They don’t misuse friendship or
exploit our vulnerabilities. They don’t abandon
us, but stand by us in times of crisis. Their
motive is to protect us from the dangers that
arise from our poor choices and conclusions.
Their disagreement is not a sign of disloyalty,
but a form of divine intervention that shapes
our thinking and reroutes our journey. Their
approach may hurt us, even inflict emotional
wounds, which are not ‘wounds’ in true sense.
A friend-cum-enemy agrees with everything
we say: our opinions, decisions, actions,
and convictions. That behavior is a ‘kiss’ to
us. Like a friend, they walk with us, eat with
us, and share our space, but with a different
motive. Ultimately, their goal to take advantage
of what we have and lead us into trouble.
Their words and actions of agreement are a
double-edged sword. They don’t correct us,
but encourage us to pursue our flawed plans.
They have two faces: a pleasant one in front of
us, and a spiteful one when speaking about us
to others. They stay with us as long as we keep
them in good humor. We rarely doubt them,
because they offer both a physical and symbolic
‘kiss’ (approval, support). But their kiss
is not always a sign of true friendship. Tragically,
we value the kiss of a ‘friend-cum-enemy’
over the wound of a real friend, who encounters us with questions, advice, and disagreement.
The wound of a friend may be painful,
but it heals quickly. It carries an inherent healing
power. We often consider it as a wound
because we deceive ourselves with the conviction
that we are always right–making right
decisions, delivering fair judgments, following
the correct paths. The wounds caused by
a real friend’s disagreements and corrections
begin to heal when we realize the truth in
their evaluation of us. Therefore, we should
cultivate openness, tolerance, and critical consciousness
to reach the point of discerning the
truth. No human being is beyond correction.
But who will correct us? Ultimately, God
alone can correct us. A true friend is a tool in
God’s hand to do so.
A ‘kiss’ from a friend-cum-enemy may
feel pleasant, but it is poisonous in the long
run. They always try to ‘kiss’ us with lovely
words and false intimacy. We often enjoy their
‘kiss’ in the form of approval or agreement
with our mistakes and poor judgments, without
realizing the poison of enmity ingrained in
it. As long as we are ensnared by the ‘kiss’ of
an enemy, we do not hear the voice of a true
friend. But the story of the ‘friend-cum-enemy’
often ends in tragedy: they desert us and
may even celebrate our downfall.
Everyone needs someone in their life to
offend, challenge, and question them lovingly
and truthfully. Only a true friend can do this
job with the right intention. We should not be
afraid of their disagreements because they refine
us, purify us, and correct us for a better tomorrow.
A true friend may be a family member,
a colleague, a childhood friend, or a life
partner. They will not ‘kiss’ us like an enemy,
but journey with us like a beacon, showing the
right path. The Bible teaches this truth: “faithful
are the wounds of a friend, but kisses of an
enemy are deceitful” (Proverbs 27: 6).', '2025-10-01', 8, TRUE, 'en');

-- Insert article images for the new articles
INSERT INTO article_images (article_id, url, alt, caption) VALUES
('friends-wound-enemy-kiss', 'assets/images/articles/friends-wound-enemy-kiss.jpg', 'Illustration representing the paradox of friendship and enmity', 'Friend''s Wound and Enemy''s Kiss');

-- Insert article tags for the new articles
INSERT INTO article_tags (article_id, tag) VALUES
('friends-wound-enemy-kiss', 'Friendship'),
('friends-wound-enemy-kiss', 'Enmity'),
('friends-wound-enemy-kiss', 'Christian Life');
