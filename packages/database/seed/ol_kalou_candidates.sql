-- VoterCore: Ol Kalou Parliamentary By-Election Candidates
-- Constituency: Ol Kalou, Nyandarua County
-- Update is_our_candidate = true for the candidate this system is managing
-- Update party, threat_level, and bio fields once confirmed

-- NOTE: Set is_our_candidate = true on the candidate you are running this system for.
-- All candidates default to false until confirmed.

insert into candidates (name, party, constituency, aliases, bio, is_our_candidate, threat_level, win_prob, momentum)
values
(
  'Sammy Kamau Ngotho',
  'UDA',
  'Ol Kalou',
  array['Kamau', 'Sammy', 'Sammy Ngotho', 'Kamau Sammy', 'S. Ngotho'],
  'UDA candidate for Ol Kalou parliamentary by-election. Currently leading the race with strong grassroots support across all 7 wards.',
  true,
  'low',
  38.0,
  'rising'
),
(
  'Paul Waiganjo',
  'DCP',
  'Ol Kalou',
  array['Waiganjo', 'Paul', 'P. Waiganjo'],
  'DCP candidate. Second in current standings. Key opposition threat — benefitting from Gachagua impeachment sympathy vote in Mt. Kenya.',
  false,
  'high',
  25.0,
  'rising'
),
(
  'Isaac Kinyua',
  'DCP',
  'Ol Kalou',
  array['Kinyua', 'Isaac', 'I. Kinyua'],
  'DCP candidate. Third in current standings. Splitting the DCP vote with Waiganjo.',
  false,
  'high',
  18.0,
  'stable'
),
(
  'Peter Karanja',
  'Independent',
  'Ol Kalou',
  array['Karanja', 'Peter', 'P. Karanja'],
  'Independent candidate.',
  false,
  'medium',
  6.0,
  'stable'
),
(
  'Mary Nyokabi',
  'Independent',
  'Ol Kalou',
  array['Nyokabi', 'Mary', 'M. Nyokabi'],
  'Independent candidate.',
  false,
  'medium',
  4.0,
  'stable'
),
(
  'Kiragu Wathuita',
  'Independent',
  'Ol Kalou',
  array['Kiragu', 'Wathuita', 'K. Wathuita'],
  'Independent candidate.',
  false,
  'low',
  3.0,
  'stable'
),
(
  'Gabriel Gathure',
  'Independent',
  'Ol Kalou',
  array['Gathure', 'Gabriel', 'G. Gathure'],
  'Independent candidate.',
  false,
  'low',
  2.0,
  'stable'
),
(
  'Samuel Nyagah Muchina',
  'Independent',
  'Ol Kalou',
  array['Muchina', 'Nyagah', 'Samuel Nyagah', 'S. Muchina'],
  'Independent candidate.',
  false,
  'low',
  2.0,
  'stable'
),
(
  'Ndegwa Wahome',
  'Independent',
  'Ol Kalou',
  array['Ndegwa', 'Wahome', 'N. Wahome'],
  'Independent candidate.',
  false,
  'low',
  1.5,
  'stable'
),
(
  'Wambugu George',
  'Independent',
  'Ol Kalou',
  array['Wambugu', 'George', 'W. George'],
  'Independent candidate.',
  false,
  'low',
  1.5,
  'stable'
);
