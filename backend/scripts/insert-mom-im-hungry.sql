-- Insert article for Mom, I am Hungry - The Silent Cry of a Starving Generation
-- Uses a custom delimiter because the article text contains semicolons
DELIMITER $$
INSERT INTO articles (id, title, author, job_title, works_at, category, image_url, alt_text, content, excerpt, publish_date, read_time, is_featured, language) VALUES
('mom-im-hungry', '“Mom, I’m Hungry”: The Silent Cry of a Starving Generation', 'Evg. Reji Baby', 'Director, Shalom Ministries', 'Philadelphia Shalem Assembly of God (PSAG)', 'Faith', 'assets/images/articles/mom-im-hungry.jpg', 'A young person sitting alone at a table, longing for real nourishment', '“Mom, I’m hungry.”

These three simple words carry a deep, yearning cry rising from the heart of our time. It is a cry that does not always ring out in formal meetings or public speeches. Yet if we tune our ears to listen beyond the surface chatter of our daily routines, the echo is undeniable.

The younger generation is hungry for reality. They are starving for truth, for genuine connection, and for an enduring sense of purpose. Above all, they are hungry for an authentic experience of belonging and deep meaning.

Perhaps the most heartbreaking part of this struggle is where it is taking place. They are sitting right inside our churches and conference halls, and around our family tables—and they are starving.

Every week, our doors open. We host events, organize structured programs, run workshops, and coordinate activities. We boast impressive facilities and sound systems.

Yet in the midst of all this noise and organization, a generation quietly asks: “Where is the real nourishment?”

The room may be full, but a generation can still remain empty. The music may be loud, but the soul can remain silent. The presentation may be polished, but the heart leaves without substance. The tragedy is not merely that young people are complaining—it is that many have stopped asking altogether.

What Would a Loving Parent Do?

Imagine a child coming home after a long day, looking up, and saying, “Mom, I’m hungry.”

What parent would simply pull out a cookbook, point to pictures of exquisite meals, and say, “Look how beautiful this food is”?

What parent would hand the child a manual and say, “Just read this”?

What parent would smile nostalgically and say, “When I was your age, we used to eat wonderful food”?

A loving parent does not offer pictures, manuals, or memories. A loving parent steps into the kitchen, prepares a real meal, and sets it on the table.

Why, then, are we surprised when a generation disengages from our traditions? We have told them everything about values and community, yet we have failed to model the living reality.

Beyond Yesterday’s Recipes

Our youth do not need another picture of yesterday’s success; they need fresh nourishment today. They do not need only stories about what worked in the past—they want to know what makes a real difference now. They do not need tradition handed down as a rigid routine. They need living relationships they can experience.

When a young person says, “I don’t feel connected,” or “This is boring,” perhaps the issue is not a lack of motivation. Instead of criticizing them, we must ask ourselves deeper questions:

* Have we shown them authentic values, or merely superficial culture?
* Have we lost our own sense of wonder and passion?
* Why do they turn to online spaces for answers instead of feeling safe enough to bring their doubts to us?
* Have we built environments where they can be known, loved, mentored, and challenged?

We cannot criticize a hungry generation for searching for nourishment elsewhere if we have failed to feed them at home.

The sacrifices and achievements of previous generations are a precious foundation. But our youth cannot live forever on memories of past successes. The principles that guided earlier generations must come alive for them. We cannot rely on telling them what worked thirty years ago; we must be able to say, “Come and see what we are building together today.” They must experience the God of Abraham, Isaac, and Jacob in their own lives.

Hungry for Reality

This generation has a low tolerance for inconsistency.

They notice the gap between what we preach in public and how we live in private. They see when we teach tolerance while harboring judgment, talk about unity while sowing division, or call for commitment while pursuing personal comfort.

They are not demanding flawless churches, pastors, or parents. They are simply searching for authentic people—leaders and mentors who can honestly say:

“I don’t have all the answers, but I am committed to the journey. I face struggles, but I know how to work through them. I am still learning, and I refuse to give up. I have fallen, but my Lord lifted me up, and I am standing. I am not perfect.”

Authenticity creates a safe place for a hungry soul to approach the table.

We must also recognize where we have substituted programs for genuine presence. We can organize an exquisite event and still miss the heart of mentorship. The foundational movements of the past lacked modern technology and resources, yet they possessed what was essential: genuine passion, deep connection, selflessness, and mutual love.

We have spent millions building the most modern gathering places, yet too often the presence of God, through which this generation could come to know the truth, is missing. They are being fed—but by the world, and the world knows how to treat them well.

The Challenge Before Us

Our young people are not asking for another program or another entertaining event. At the deepest level, their hearts cry out: “Give us something real.”

Instead of asking why young people walk away, we must ask:

* Why are we not nourishing them?
* Why do they find community everywhere outside our churches and families, yet struggle to find it within?
* Why do they attend our gatherings for years without developing a personal passion for growth?

When the cry “Mom, I’m hungry” reaches our ears, we are being called to account. They are saying to us:

* “Do not merely tell me what to believe; show me how to live.”
* “Do not merely tell me to listen; sit down and talk with me.”
* “Do not criticize my generation; mentor my generation.”
* “Do not merely tell me to join in; empower me to lead.”

Before They Leave the Table

Our churches and homes must be more than gathering venues—they must be places where hungry minds and hearts are fed.

Our platforms must share wisdom like fresh bread. Our spaces must be safe harbors for the weary. Older generations must step up as true mentors and guides who invite the young to sit beside them and learn. We do not need more spectators; we need active participants who carry purpose into the world.

How heartbreaking it would be if a child sat at the family table, cried out in hunger, was ignored, and finally walked away unfed.

This generation is still sitting at the table. They are watching, searching, hurting, and waiting. Let us not grow defensive about their hunger; let us respond to it.

When they say, “Mom, I’m hungry,” let us answer with open arms:

“Come, sit at the table. There is real substance here. There is truth, compassion, and purpose. You belong here.”',

 'A heartfelt call to churches and families to recognize the silent hunger of the younger generation—for truth, authenticity, and belonging—and to answer it with real nourishment rather than programs and memories.', '2026-10-01', 6, TRUE, 'en')$$


-- Insert article images for the new article
INSERT INTO article_images (article_id, url, alt, caption) VALUES
('mom-im-hungry', 'assets/images/articles/mom-im-hungry.jpg', 'A young person sitting alone at a table, longing for real nourishment', '“Mom, I’m Hungry”: The Silent Cry of a Starving Generation')$$

-- Insert article tags for the new article
INSERT INTO article_tags (article_id, tag) VALUES
('mom-im-hungry', 'Faith'),
('mom-im-hungry', 'Youth'),
('mom-im-hungry', 'Mentorship'),
('mom-im-hungry', 'Church'),
('mom-im-hungry', 'Family')$$

DELIMITER ;
