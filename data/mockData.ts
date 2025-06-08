import { format } from 'date-fns';

// Mock dreams for the home screen
export const mockDreams = [
  {
    id: '1',
    title: 'Flying Over Mountains',
    content: 'I was soaring over snow-capped mountains, feeling incredibly free. The air was crisp and I could see for miles in every direction. At one point, I saw a golden eagle flying beside me, guiding me toward a glowing city in the distance.',
    date: new Date(2025, 2, 10), // March 10, 2025
    emotion: 'Joy',
    sleepQuality: 5,
  },
  {
    id: '2',
    title: 'Lost in a Maze',
    content: 'I found myself wandering through an endless maze with walls that seemed to shift when I wasn\'t looking. The maze was made of dark hedges, and I could hear whispers coming from beyond the walls. Eventually, I found a small mirror in the center that showed a different version of myself.',
    date: new Date(2025, 2, 7), // March 7, 2025
    emotion: 'Confusion',
    sleepQuality: 2,
  },
  {
    id: '3',
    title: 'Ocean Depths',
    content: 'I was swimming deep in the ocean, able to breathe underwater. Colorful fish and strange luminescent creatures surrounded me. I discovered an ancient temple with hieroglyphics that somehow I could read, telling a story about humanity\'s origins.',
    date: new Date(2025, 2, 4), // March 4, 2025
    emotion: 'Neutral',
    sleepQuality: 4,
  },
  {
    id: '4',
    title: 'Childhood Home',
    content: 'I returned to my childhood home, but all the rooms were much larger than I remembered. Family members I haven\'t seen in years were there, but they didn\'t seem to notice me. When I tried to speak, my voice made no sound.',
    date: new Date(2025, 1, 28), // February 28, 2025
    emotion: 'Sadness',
    sleepQuality: 3,
  },
  {
    id: '5',
    title: 'Storm Chaser',
    content: 'I was driving down a long, empty highway with massive storm clouds gathering ahead. Instead of feeling afraid, I felt drawn to the storm. Lightning illuminated strange shapes in the clouds that seemed to be watching me.',
    date: new Date(2025, 1, 25), // February 25, 2025
    emotion: 'Fear',
    sleepQuality: 2,
  },
];

// Mock analysis for the analysis screen
export const mockAnalysis = {
  dreamTitle: 'Flying Over Mountains',
  date: format(new Date(2025, 2, 10), 'MMMM d, yyyy'),
  summary: 'In this dream, you were flying over snow-capped mountains with a sense of freedom and exhilaration. The environment was crisp and clear, allowing for expansive visibility. A golden eagle appeared and guided you toward a distant, glowing city.',
  symbols: [
    {
      name: 'Flying',
      meaning: 'Flying in dreams often represents freedom, liberation from constraints, or a desire to escape from pressures in waking life. It can symbolize a new perspective on problems or transcending limitations.',
    },
    {
      name: 'Mountains',
      meaning: 'Mountains typically symbolize challenges, obstacles, or personal goals. Snow-capped mountains can represent clarity of thought, purity of purpose, or the highest aspirations you hold.',
    },
    {
      name: 'Eagle',
      meaning: 'An eagle often represents perspective, spiritual awareness, and freedom. As a guide in your dream, it suggests inner wisdom leading you toward your true path or purpose.',
    },
    {
      name: 'Glowing City',
      meaning: 'A distant, glowing city typically symbolizes aspirations, goals, or a community you wish to join. The illumination suggests enlightenment or a destination that promises fulfillment.',
    },
  ],
  interpretation: 'This dream reflects a period of personal growth and expanded perspective in your life. The act of flying suggests you may be overcoming limitations or gaining a broader view of your circumstances. The snow-capped mountains represent significant challenges you\'ve faced or are currently navigating, while their majesty acknowledges the impressive nature of your journey.\n\nThe golden eagle appearing as a guide is particularly significant, suggesting that your intuition or higher wisdom is actively directing you toward your true path. The distant, glowing city represents your aspirations and the sense of belonging or achievement you\'re working toward.',
  reflectionQuestions: [
    'What areas of your life have recently made you feel more free or unbounded?',
    'In what ways might you be gaining a "higher perspective" on challenges in your waking life?',
    'What does the golden eagle as a guide mean to you personally? Is there wisdom you\'re currently following?',
    'What "glowing city" or destination are you currently working toward in your life?',
    'How might you embrace more of the freedom and clarity represented in this dream?'
  ]
};

// Mock symbol dictionary for the dictionary screen
export const dreamSymbols = [
  {
    id: 1,
    name: 'Flying',
    category: 'Actions',
    shortMeaning: 'Freedom, transcendence, escape from limitations',
    fullMeaning: 'Flying in dreams often symbolizes freedom, transcendence of limitations, or a desire to escape from pressures in waking life. It can represent a new perspective on problems, spiritual elevation, or the ability to rise above challenges. Flying with ease suggests confidence and control, while struggling to fly might indicate obstacles to personal freedom or self-expression.'
  },
  {
    id: 2,
    name: 'Falling',
    category: 'Actions',
    shortMeaning: 'Loss of control, fear, letting go',
    fullMeaning: 'Falling dreams are among the most common and often reflect feelings of insecurity, anxiety, or loss of control in waking life. They may occur during times of transition or stress. Falling can also represent the release of tension or letting go of something that no longer serves you. The landing (or lack thereof) in the dream provides additional context—a soft landing might suggest resilience, while falling endlessly might reflect ongoing uncertainty.'
  },
  {
    id: 3,
    name: 'Water',
    category: 'Nature',
    shortMeaning: 'Emotions, the unconscious, purification',
    fullMeaning: 'Water is one of the most common dream symbols and generally represents your emotional state and unconscious mind. Clear, calm water often reflects emotional clarity or peace, while turbulent or murky water can indicate emotional turmoil or confusion. Oceans might represent the vastness of your unconscious, rivers can symbolize life\'s journey, and rain might suggest emotional release or cleansing. Swimming in water often relates to how you navigate your emotional world.'
  },
  {
    id: 4,
    name: 'House',
    category: 'Places',
    shortMeaning: 'Self, mind, personal life and relationships',
    fullMeaning: 'Houses in dreams typically represent the self, with different rooms corresponding to different aspects of your personality or life. The condition of the house often reflects how you perceive yourself—a well-maintained home suggests good self-care, while a damaged or neglected house might indicate self-neglect or unresolved issues. Exploring unfamiliar rooms can represent discovering new aspects of yourself or unlocking new potential. Childhood homes often connect to memories or formative experiences.'
  },
  {
    id: 5,
    name: 'Teeth',
    category: 'Objects',
    shortMeaning: 'Power, confidence, communication, anxiety',
    fullMeaning: 'Dreams about teeth—particularly losing teeth—are very common and often relate to concerns about appearance, power, or communication. Losing teeth can symbolize anxiety about how others perceive you, fear of embarrassment, or worries about aging and mortality. Healthy, strong teeth might represent confidence and personal power, while broken or decayed teeth could reflect insecurities or feelings of powerlessness. Teeth dreams may also relate to communication issues—what\'s being expressed or what remains unsaid.'
  },
  {
    id: 6,
    name: 'Snake',
    category: 'Animals',
    shortMeaning: 'Transformation, healing, hidden fears, wisdom',
    fullMeaning: 'Snakes are complex dream symbols with varied meanings across cultures. They often represent transformation and renewal (due to shedding their skin), healing (as in the medical caduceus symbol), hidden fears or unconscious drives, or wisdom and knowledge. The snake\'s behavior in the dream provides important context—a threatening snake might represent a perceived danger or betrayal, while a peaceful snake could symbolize wisdom or personal transformation. In some contexts, snakes may have sexual connotations or represent temptation.'
  },
  {
    id: 7,
    name: 'Door',
    category: 'Objects',
    shortMeaning: 'Opportunity, transition, choices',
    fullMeaning: 'Doors in dreams represent opportunities, choices, or transitions between different states of being or phases of life. Open doors suggest available opportunities or willingness to embrace change, while locked or jammed doors might indicate obstacles, limitations, or resistance to change. The act of searching for a door can symbolize seeking a way out of a difficult situation, while finding a previously undiscovered door might represent a new opportunity or perspective that has recently become available to you.'
  },
  {
    id: 8,
    name: 'Baby',
    category: 'People',
    shortMeaning: 'New beginnings, vulnerability, responsibility',
    fullMeaning: 'Babies in dreams often symbolize new beginnings, fresh starts, or budding potential. They may represent a new project, relationship, or phase of personal growth. Dreams of babies can also reflect feelings about vulnerability—either your own or your concern for something fragile in your life. For some dreamers, baby dreams connect to feelings about parenthood, responsibility, or nurturing aspects of the self. The baby\'s condition and your emotional response to it in the dream provide important context for interpretation.'
  },
  {
    id: 9,
    name: 'Flying Vehicle',
    category: 'Objects',
    shortMeaning: 'Journey, life path, control over direction',
    fullMeaning: 'Vehicles that fly—such as airplanes, helicopters, or fantastical flying machines—typically represent your life journey and the degree of control you feel over your direction. Smooth flights suggest confidence in your life path, while turbulence or mechanical problems might indicate challenges or uncertainties. Being a passenger versus piloting the craft reflects your sense of agency in life situations. The altitude and speed of flight can represent your ambitions and the pace at which you\'re moving toward goals.'
  },
  {
    id: 10,
    name: 'Mountains',
    category: 'Nature',
    shortMeaning: 'Challenges, obstacles, spiritual elevation',
    fullMeaning: 'Mountains in dreams often symbolize challenges, obstacles, or aspirations. Climbing a mountain can represent striving toward a goal or overcoming difficulties, while standing at the summit might symbolize achievement or a higher perspective on life. Mountains can also have spiritual connotations, representing transcendence or connection to higher consciousness. The condition of the mountain—whether snow-capped, lush, barren, or volcanic—adds layers of meaning to the interpretation.'
  },
  {
    id: 11,
    name: 'Moon',
    category: 'Nature',
    shortMeaning: 'Intuition, unconscious, feminine energy',
    fullMeaning: 'The moon in dreams typically symbolizes intuition, the unconscious mind, and the feminine or receptive aspects of the self. A full moon might represent completeness or heightened intuition, while a new or crescent moon could symbolize beginnings or partial understanding. The moon\'s association with night connects it to the hidden, mysterious aspects of life and the self. Changes in the moon\'s appearance or behavior (such as a red moon or the moon falling from the sky) often represent shifts in intuitive understanding or emotional states.'
  },
  {
    id: 12,
    name: 'Key',
    category: 'Objects',
    shortMeaning: 'Access, solutions, knowledge, opportunity',
    fullMeaning: 'Keys in dreams symbolize access, opportunity, or solutions to problems. Finding a key often represents discovering an answer or approach to a challenging situation, while losing keys might reflect anxiety about missed opportunities or inability to access important resources. The type of key and what it opens provide additional meaning—a skeleton key that opens many doors suggests versatility or universal solutions, while an ornate or unusual key might represent specialized knowledge or a unique opportunity. Keys can also represent control and authority in certain contexts.'
  },
  {
    id: 13,
    name: 'Bridge',
    category: 'Places',
    shortMeaning: 'Transition, connection, crossing obstacles',
    fullMeaning: 'Bridges in dreams represent transitions, connections between different aspects of life, or the means to overcome obstacles. Crossing a bridge often symbolizes moving from one life phase or state of being to another. The bridge\'s condition is significant—a solid, well-constructed bridge suggests confidence in transitions, while a rickety or broken bridge might indicate anxiety about change or insufficient resources for current challenges. Bridges over water particularly connect to emotional transitions, while the destination visible across the bridge often represents desired outcomes or new possibilities.'
  },
  {
    id: 14,
    name: 'Mirror',
    category: 'Objects',
    shortMeaning: 'Self-reflection, identity, truth',
    fullMeaning: 'Mirrors in dreams invite self-reflection and contemplation of identity. Looking into a mirror represents examination of the self, while what you see reflected often symbolizes your self-perception or aspects of yourself you\'re ready to acknowledge. Distorted reflections might indicate a skewed self-image or confusion about identity, while multiple reflections could represent different facets of your personality. Breaking a mirror might symbolize a disruption in self-image or liberation from limiting self-perceptions. Mirrors can also represent truth—what\'s being revealed or recognized.'
  },
  {
    id: 15,
    name: 'Forest',
    category: 'Nature',
    shortMeaning: 'Unconscious mind, unknown territory, life journey',
    fullMeaning: 'Forests in dreams often represent the unconscious mind, with trees symbolizing aspects of the self or life situations. Dense forests can represent confusion, uncertainty, or the unknown aspects of life or the self, while clearings might symbolize clarity or revelations. Being lost in a forest often connects to feeling directionless in some aspect of waking life, while finding a path through the forest suggests progress or guidance. The forest\'s condition—whether lush and vibrant or dark and threatening—reflects emotional states or perceptions of the unknown.'
  }
];