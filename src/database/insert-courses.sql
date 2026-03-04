-- Insert dummy courses (run in psql or any PostgreSQL client)
-- Requires: courses table exists (start the backend once so CoursesInitService creates it)

INSERT INTO courses (id, title, description, image, "freeOrPaid", amount, level, "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid(),
    'Detecting Financial Deception Risks from the Inside',
    'Occupational fraud involves the use of one''s occupation for personal enrichment through the deliberate misuse or misapplication of the employing organization''s resources or assets. This session will help you understand common fraud schemes, recognise red flags, and implement preventive measures.' || E'\n\n' || 'By the end of this session, participants will be able to: Establish a foundational understanding of what occupational fraud is and why it matters; Recognise common fraud schemes; Identify red flags and detection methods; Appreciate stakeholder responsibility in fraud prevention and governance; Implement preventive measures.',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    false,
    0,
    'Intermediate',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'The Power of Speaking Up - Conversations on Whistleblowing',
    'Learn about the importance of ethical reporting and whistleblowing in organisations. Understand protections, processes, and how to create a culture where speaking up is valued.',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80',
    false,
    0,
    'Beginner',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Key Differences Between US GAAP and IFRS: Presentation and Disclosure',
    'A practical guide to the main presentation and disclosure differences between US GAAP and IFRS. Essential for finance professionals working in global reporting environments.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    true,
    49.99,
    'Advanced',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'A Business First Approach to AI in Fusion Applications',
    'Explore how AI is transforming business processes in modern ERP and fusion applications. Learn to leverage AI for efficiency and decision-making.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    false,
    0,
    'Beginner',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Sanctions Compliance for Finance Professionals',
    'Understand sanctions regimes, compliance obligations, and best practices for screening and reporting. Stay ahead in a rapidly changing regulatory landscape.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    true,
    39.99,
    'Intermediate',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'IAS 36 in Action: Practical Case Studies on Asset Impairment',
    'Apply IAS 36 to real-world scenarios. Work through case studies on impairment of goodwill, cash-generating units, and disclosure requirements.',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    false,
    0,
    'Advanced',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Getting Started on Sustainability Reporting for Your SME',
    'Introduction to sustainability reporting frameworks and how small and medium enterprises can begin their reporting journey effectively.',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
    false,
    0,
    'Beginner',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Navigating APAC''s Economic Currents: Building Resilient Strategies',
    'Understand economic trends across the Asia-Pacific region and how to build resilient business and investment strategies.',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    true,
    59.99,
    'Intermediate',
    now(),
    now()
  );
