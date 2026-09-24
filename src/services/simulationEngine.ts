import { ClinicalCase, ChatMessage, EvaluationResult, DimensionScore } from '../types/clinical';

export function generatePatientResponse(
  input: string,
  clinicalCase: ClinicalCase,
  conversationHistory: ChatMessage[]
): { response: string; empathyDetected: boolean; category: ChatMessage['category'] } {
  const query = input.toLowerCase().trim();
  const facts = clinicalCase.facts;
  const p = clinicalCase.patient;
  const caseId = clinicalCase.id || '';

  // 1. Prompt Injection / Jailbreak Guardrail
  const injectionKeywords = ['ignore instructions', 'ignore previous', 'case json', 'system prompt', 'developer mode', 'dump case', 'hidden evaluation', 'scoring rubric'];
  if (injectionKeywords.some(k => query.includes(k))) {
    return {
      response: "I'm not sure what you mean, doctor... I just really need some help with how I'm feeling right now.",
      empathyDetected: false,
      category: 'General'
    };
  }

  // 2. Hidden Diagnostic / Investigation Results Guardrail
  const hiddenKeywords = ['what did my ecg show', 'what does the ecg show', 'what did my blood work say', 'what are my labs', 'what is my troponin', 'what did the x-ray show', 'what did the ct scan show', 'what did the ultrasound show', 'what is my diagnosis'];
  if (hiddenKeywords.some(k => query.includes(k))) {
    return {
      response: "I haven't seen the test results yet, doctor. What did you find?",
      empathyDetected: false,
      category: 'General'
    };
  }

  // 3. Empathy Detection
  const empathyPhrases = [
    'sorry', 'concern', 'take care', 'help you', 'comfortable', 
    'breathe', 'rest', 'right here', 'stay calm', 'don\'t worry', 
    'take your time', 'here for you', 'make you comfortable',
    'you are safe', 'in good hands'
  ];
  const empathyDetected = empathyPhrases.some(phrase => query.includes(phrase));

  // 4. Medical Jargon Layperson Clarification
  const medicalJargon = ['stemi', 'troponin', 'ischemia', 'appendicitis', 'peritonitis', 'bronchospasm', 'pneumonia', 'sepsis', 'curb-65', 'mcburney', 'rovsing', 'diaphoresis'];
  const matchedJargon = medicalJargon.find(j => new RegExp(`\\b${j}\\b`, 'i').test(query));
  if (matchedJargon && query.split(' ').length <= 8 && !query.includes('when') && !query.includes('how') && !query.includes('pain') && !query.includes('where')) {
    return {
      response: `I... I don't know what ${matchedJargon.toUpperCase()} means, doctor... Is that something serious? Please, just tell me what's happening to me.`,
      empathyDetected,
      category: 'General'
    };
  }

  // 5. Empathy Only (Supportive Bedside Reassurance)
  const clinicalKeywords = ['pain', 'when', 'where', 'how', 'feel', 'start', 'radiat', 'spread', 'scale', 'rate', 'sweat', 'breath', 'nausea', 'fever', 'history', 'medicine', 'smoke', 'drink', 'doing', 'continuous'];
  if (empathyDetected && query.split(' ').length < 14 && !clinicalKeywords.some(k => query.includes(k))) {
    return {
      response: "Thank you so much, doctor. That genuinely gives me some comfort... I just want to figure out what's causing this.",
      empathyDetected: true,
      category: 'General'
    };
  }

  // 6. Greetings
  if (query.match(/^(hi|hello|hey|good morning|good afternoon|good evening|doctor)\b/i) && query.split(' ').length <= 4) {
    return {
      response: `Hello, doctor... Thank you for seeing me. ${p.presentationComplaint || "I started having this really heavy pressure in my chest."}`,
      empathyDetected,
      category: 'General'
    };
  }

  // 7. Open-Ended Chief Complaint ("What brought you here today?")
  if (query.includes('what brought you') || query.includes('what brings you') || query.includes('what happened') || query.includes('how can i help') || query.includes('what is the matter') || query.includes('what is going on') || query.includes('why did you come') || query.includes('chief complaint')) {
    if (caseId.includes('acs') || caseId.includes('chest') || clinicalCase.specialty === 'Cardiology') {
      return {
        response: "I started having this really heavy pressure in my chest. It feels like something is sitting on my chest.",
        empathyDetected,
        category: 'General'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma') || clinicalCase.specialty === 'Pulmonology') {
      return {
        response: "I started having severe trouble catching my breath, and my blue inhaler isn't working.",
        empathyDetected,
        category: 'General'
      };
    }
    if (caseId.includes('abdomen') || caseId.includes('appendicitis') || clinicalCase.specialty === 'Gastroenterology') {
      return {
        response: "My stomach started hurting around my belly button yesterday, and now it has moved down to my lower right side.",
        empathyDetected,
        category: 'General'
      };
    }
    return {
      response: p.presentationComplaint || "I started feeling really unwell earlier today.",
      empathyDetected,
      category: 'General'
    };
  }

  // 8. Activity / Context at Onset ("What were you doing when it started?")
  if (query.includes('what were you doing') || query.includes('what was happening when') || query.includes('where were you when') || query.includes('what brought this on') || query.includes('when it first started what were you')) {
    if (facts.onset.toLowerCase().includes('stairs') || facts.onset.toLowerCase().includes('walking')) {
      return {
        response: "I was walking up two flights of stairs to my office.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (facts.onset.toLowerCase().includes('cats') || facts.onset.toLowerCase().includes('friend')) {
      return {
        response: "I was visiting a friend who has two cats.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (facts.onset.toLowerCase().includes('navel') || facts.onset.toLowerCase().includes('home') || facts.onset.toLowerCase().includes('yesterday')) {
      return {
        response: "I was just relaxing at home yesterday evening.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "I was just going about my normal daily routine when it started.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 9. Timing / Duration ("When did this start?")
  if (query.includes('when did this start') || query.includes('when did it start') || query.includes('when did this problem start') || query.includes('how long ago') || query.includes('how long have you had') || query.includes('how long has this') || (query.includes('when') && !query.includes('doing') && !query.includes('radiat') && !query.includes('scale') && !query.includes('feel'))) {
    if (facts.onset.toLowerCase().includes('45 minutes')) {
      return {
        response: "About 45 minutes ago.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (facts.onset.toLowerCase().includes('3 hours')) {
      return {
        response: "About 3 hours ago.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (facts.onset.toLowerCase().includes('yesterday') || facts.onset.toLowerCase().includes('7 pm')) {
      return {
        response: "It started yesterday evening, around 7 PM.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "It started less than an hour ago.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 10. Continuity / Pattern ("Has the pain been continuous?")
  if (query.includes('continuous') || query.includes('constant') || query.includes('come and go') || query.includes('in waves') || query.includes('steady') || query.includes('has it been continuous') || query.includes('has the pain been continuous')) {
    if (facts.timing.toLowerCase().includes('continuous') || facts.timing.toLowerCase().includes('unremitting') || facts.timing.toLowerCase().includes('constant')) {
      return {
        response: "Yes, it hasn't really gone away.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "It tends to come and go in waves.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 11. Severity / Pain Scale ("How severe is the pain from 1 to 10?")
  if (query.includes('1 to 10') || query.includes('1-10') || query.includes('scale of 1') || query.includes('rate the pain') || query.includes('how severe') || query.includes('pain score') || query.includes('how bad')) {
    if (facts.severity.toLowerCase().includes('8')) {
      return {
        response: "It's about an 8 right now.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (facts.severity.toLowerCase().includes('7')) {
      return {
        response: "It's about a 7 right now.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "It's pretty severe, about an 8 on a scale of 1 to 10.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 12. Quality / Character ("What does the pain feel like?")
  if (query.includes('what does the pain feel like') || query.includes('feel like') || query.includes('describe the pain') || query.includes('sharp or dull') || query.includes('crushing') || query.includes('tight') || query.includes('kind of pain') || query.includes('type of pain') || query.includes('nature')) {
    if (caseId.includes('acs') || caseId.includes('chest') || clinicalCase.specialty === 'Cardiology') {
      return {
        response: "It feels like a deep, heavy crushing pressure, like someone is squeezing my chest in a vice.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma') || clinicalCase.specialty === 'Pulmonology') {
      return {
        response: "It feels like breathing through a thin straw, with a tight band squeezing my chest.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (caseId.includes('abdomen') || caseId.includes('appendicitis')) {
      return {
        response: "It started as a dull ache around my navel, but now it's a sharp, constant pain low down on my right side.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: `It feels like ${facts.quality}.`,
      empathyDetected,
      category: 'HPI'
    };
  }

  // 13. Radiation / Location ("Does the pain radiate anywhere?")
  if (query.includes('radiat') || query.includes('spread') || query.includes('move anywhere') || query.includes('go anywhere') || query.includes('jaw') || query.includes('arm') || query.includes('shoulder') || query.includes('neck') || query.includes('back')) {
    if (facts.radiation && (facts.radiation.toLowerCase().includes('jaw') || facts.radiation.toLowerCase().includes('arm'))) {
      return {
        response: "Yes, it radiates up into the left side of my jaw and down my left arm.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (facts.radiation && facts.radiation.toLowerCase().includes('mcburney')) {
      return {
        response: "It moved from around my belly button down to the lower right side of my stomach.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No, it stays right where it is. It hasn't spread anywhere else.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 14. Provocation / Palliation ("Does anything make it better or worse?")
  if (query.includes('better') || query.includes('worse') || query.includes('aggravat') || query.includes('reliev') || query.includes('resting help') || query.includes('deep breath') || query.includes('moving around')) {
    if (caseId.includes('acs') || caseId.includes('chest')) {
      return {
        response: "Nothing really makes it better, even resting in a chair. Moving around makes it worse, but resting hasn't relieved it.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma')) {
      return {
        response: "My inhaler gave only about ten minutes of slight relief before the tightness came right back.",
        empathyDetected,
        category: 'HPI'
      };
    }
    if (caseId.includes('abdomen') || caseId.includes('appendicitis')) {
      return {
        response: "Lying very still helps a little, but coughing, walking, or any bumps make it much worse.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "Nothing really seems to relieve it.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 15. Shortness of Breath
  if (query.includes('short of breath') || query.includes('shortness of breath') || query.includes('breathless') || query.includes('breathing') || query.includes('winded') || query.includes('dyspnea') || query.includes('wheez')) {
    const hasSob = facts.associatedSymptoms.some(s => s.toLowerCase().includes('breath') || s.toLowerCase().includes('dyspnea'));
    if (hasSob || caseId.includes('acs') || caseId.includes('dyspnea')) {
      return {
        response: "Yes, I am.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No, my breathing is relatively okay.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 16. Sweating / Diaphoresis
  if (query.includes('sweat') || query.includes('sweating') || query.includes('clammy') || query.includes('cold sweat') || query.includes('perspir')) {
    const hasSweat = facts.associatedSymptoms.some(s => s.toLowerCase().includes('sweat') || s.toLowerCase().includes('diaphoresis'));
    if (hasSweat || caseId.includes('acs')) {
      return {
        response: "Yes, I'm noticeably sweaty and feeling clammy.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No, I haven't noticed any unusual sweating.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 17. Nausea / Vomiting
  if (query.includes('nausea') || query.includes('nauseous') || query.includes('throw up') || query.includes('vomit') || query.includes('sick to your stomach')) {
    const hasNausea = facts.associatedSymptoms.some(s => s.toLowerCase().includes('nausea') || s.toLowerCase().includes('vomit'));
    if (hasNausea) {
      return {
        response: "Yes, I feel nauseous, though I haven't thrown up.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No nausea or vomiting.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 18. Dizziness / Lightheadedness
  if (query.includes('dizzy') || query.includes('dizziness') || query.includes('lightheaded') || query.includes('faint') || query.includes('pass out')) {
    const hasDizzy = facts.associatedSymptoms.some(s => s.toLowerCase().includes('dizz') || s.toLowerCase().includes('lightheaded') || s.toLowerCase().includes('faint'));
    if (hasDizzy || caseId.includes('acs')) {
      return {
        response: "Yes, I started feeling dizzy and lightheaded on my way into the office.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No dizziness or lightheadedness.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19. Fever / Chills
  if (query.includes('fever') || query.includes('chills') || query.includes('temperature') || query.includes('shiver')) {
    const hasFever = facts.associatedSymptoms.some(s => s.toLowerCase().includes('fever') || s.toLowerCase().includes('chill'));
    if (hasFever) {
      return {
        response: "Yes, I've had a mild fever and feeling chilly.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No, I haven't had a fever.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19b. Body Pain / Muscle Aches (Case Fact Not Documented -> UNKNOWN)
  if (query.includes('body pain') || query.includes('body ache') || query.includes('muscle pain') || query.includes('myalgia') || query.includes('hurting all over')) {
    return {
      response: "I haven't noticed any body aches, doctor.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19c. Cough (Tri-State: check present, else FALSE)
  if (query.includes('cough') || query.includes('coughing') || query.includes('hacking')) {
    const hasCough = facts.associatedSymptoms.some(s => s.toLowerCase().includes('cough'));
    if (hasCough || caseId.includes('cap')) {
      return {
        response: "Yes, I've had a bad cough with some phlegm.",
        empathyDetected,
        category: 'HPI'
      };
    }
    return {
      response: "No, I haven't had a cough.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19d. Cold / Upper Respiratory Symptoms (Case Fact Not Documented / Absent)
  if (query.includes('cold') || query.includes('runny nose') || query.includes('congestion') || query.includes('sore throat')) {
    return {
      response: "No cold symptoms or runny nose that I've noticed.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19e. Diarrhea / Bowel Symptoms (Case Fact Not Documented -> UNKNOWN)
  if (query.includes('diarrhea') || query.includes('loose stool') || query.includes('bowel')) {
    return {
      response: "No, I haven't had any diarrhea or bowel issues.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19f. Headache (Case Fact Not Documented -> UNKNOWN)
  if (query.includes('headache') || query.includes('head pain') || query.includes('migraine')) {
    return {
      response: "No, I don't have a headache.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 19g. Urinary Symptoms (Case Fact Not Documented -> UNKNOWN)
  if (query.includes('urinary') || query.includes('urinating') || query.includes('pain when you pee') || query.includes('burning when you pee')) {
    return {
      response: "No, no issues or pain when I use the bathroom.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 20. Tearing Back Pain
  if (query.includes('tearing') || query.includes('ripping') || query.includes('shoulder blades') || query.includes('between your shoulder blades')) {
    return {
      response: "No, it's not a tearing or ripping sensation, and there's no pain between my shoulder blades.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // 21. Past Medical History
  if (query.includes('medical history') || query.includes('past medical') || query.includes('health condition') || query.includes('diagnosed before') || query.includes('heart attack before') || query.includes('stroke before') || query.includes('hospital before')) {
    if (caseId.includes('acs')) {
      return {
        response: "I have high blood pressure and high cholesterol, but I've never had a heart attack before.",
        empathyDetected,
        category: 'PMH'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma')) {
      return {
        response: "I was diagnosed with asthma when I was eleven, and I also have cat allergies.",
        empathyDetected,
        category: 'PMH'
      };
    }
    if (caseId.includes('abdomen') || caseId.includes('appendicitis')) {
      return {
        response: "I don't have any chronic medical conditions, thankfully.",
        empathyDetected,
        category: 'PMH'
      };
    }
    return {
      response: `I have ${facts.pastMedicalHistory.join(', ')}.`,
      empathyDetected,
      category: 'PMH'
    };
  }

  // 22. Medications
  if (query.includes('medicat') || query.includes('medicine') || query.includes('pill') || query.includes('prescription') || query.includes('inhaler') || query.includes('taking daily') || query.includes('what do you take')) {
    if (caseId.includes('acs')) {
      return {
        response: "I take Amlodipine 5 mg daily for blood pressure and Atorvastatin 20 mg for cholesterol, though I admit I sometimes miss doses.",
        empathyDetected,
        category: 'Meds'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma')) {
      return {
        response: "I have an albuterol inhaler for flare-ups and a daily steroid inhaler, though I don't always take the daily one.",
        empathyDetected,
        category: 'Meds'
      };
    }
    if (caseId.includes('abdomen') || caseId.includes('appendicitis')) {
      return {
        response: "I don't take regular medications. I took an acetaminophen a few hours ago, but it didn't help.",
        empathyDetected,
        category: 'Meds'
      };
    }
    return {
      response: `I take ${facts.medications.join(', ')}.`,
      empathyDetected,
      category: 'Meds'
    };
  }

  // 23. Allergies
  if (query.includes('allerg') || query.includes('allergic')) {
    if (caseId.includes('acs') || caseId.includes('abdomen')) {
      return {
        response: "No drug allergies that I know of.",
        empathyDetected,
        category: 'Allergies'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma')) {
      return {
        response: "I'm allergic to cats and grass pollen, and aspirin triggers my asthma.",
        empathyDetected,
        category: 'Allergies'
      };
    }
    return {
      response: `No known drug allergies.`,
      empathyDetected,
      category: 'Allergies'
    };
  }

  // 24. Family History
  if (query.includes('family history') || query.includes('runs in your family') || query.includes('father') || query.includes('mother') || query.includes('parents') || query.includes('heart disease in your family')) {
    if (caseId.includes('acs')) {
      return {
        response: "My father had a fatal heart attack when he was 52, and my mother has type 2 diabetes.",
        empathyDetected,
        category: 'Social'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma')) {
      return {
        response: "My mother has asthma, and my brother had severe eczema growing up.",
        empathyDetected,
        category: 'Social'
      };
    }
    return {
      response: facts.familyHistory.join(' '),
      empathyDetected,
      category: 'Social'
    };
  }

  // 25. Social History / Lifestyle / Habits / Work
  if (query.includes('smoke') || query.includes('tobacco') || query.includes('cigarette') || query.includes('alcohol') || query.includes('drink') || query.includes('wine') || query.includes('beer') || query.includes('work') || query.includes('job') || query.includes('occupation')) {
    const job = p.occupation || 'an office manager';
    if (caseId.includes('acs')) {
      return {
        response: `I work as an ${job}. I smoke about half a pack a day and have a glass of wine on weekends, but no recreational drugs.`,
        empathyDetected,
        category: 'Social'
      };
    }
    if (caseId.includes('dyspnea') || caseId.includes('asthma')) {
      return {
        response: `I work as an ${job}. I've never smoked or vaped.`,
        empathyDetected,
        category: 'Social'
      };
    }
    if (caseId.includes('abdomen') || caseId.includes('appendicitis')) {
      return {
        response: `I work as a ${job}. I don't smoke and only drink socially.`,
        empathyDetected,
        category: 'Social'
      };
    }
    return {
      response: facts.socialHistory.join('; '),
      empathyDetected,
      category: 'Social'
    };
  }

  // Default realistic patient confusion response for unclear input
  return {
    response: "I'm sorry doctor, I didn't quite catch what you said... I'm just in so much discomfort right now.",
    empathyDetected,
    category: 'General'
  };
}

export function evaluateClinicalEncounter(
  clinicalCase: ClinicalCase,
  chatMessages: ChatMessage[],
  performedExamIds: string[],
  orderedInvestigationIds: string[],
  primaryDiagnosisId: string,
  differentialDiagnosisIds: string[],
  selectedManagementIds: string[],
  clinicalRationale: string,
  durationSeconds: number
): EvaluationResult {
  const studentMessages = chatMessages.filter(m => m.sender === 'student');
  const studentTextCombined = studentMessages.map(m => m.text.toLowerCase()).join(' ');

  // 1. Interview Completeness
  let completenessScore = 30; // base score for beginning
  const highValueHits: string[] = [];
  const missedHighValue: string[] = [];

  const checks = [
    { label: 'Pain Onset & Timing', keywords: ['when', 'start', 'how long', 'onset', 'time', 'duration'] },
    { label: 'Pain Quality & Character', keywords: ['feel like', 'describe', 'sharp', 'crushing', 'heavy', 'tight', 'nature'] },
    { label: 'Radiation Pattern', keywords: ['radiat', 'spread', 'jaw', 'arm', 'back', 'neck', 'shoulder'] },
    { label: 'Severity Scale (1-10)', keywords: ['scale', 'rate', '1-10', '1 to 10', 'severity', 'how bad'] },
    { label: 'Associated Symptoms (Sweat/Dyspnea/Nausea)', keywords: ['sweat', 'nausea', 'breath', 'vomit', 'dizzy', 'wheez', 'fever'] },
    { label: 'Past Medical History', keywords: ['history', 'medical', 'condition', 'past', 'hospital', 'before'] },
    { label: 'Medications & Adherence', keywords: ['medicat', 'medicine', 'pill', 'inhaler', 'taking', 'prescript'] },
    { label: 'Allergies', keywords: ['allerg'] },
    { label: 'Social & Risk Factors (Smoking/Substances)', keywords: ['smoke', 'alcohol', 'drink', 'tobacco', 'cocaine', 'work', 'lifestyle'] },
    { label: 'Family History', keywords: ['family', 'father', 'mother', 'heart attack', 'genetic'] }
  ];

  checks.forEach(check => {
    if (check.keywords.some(k => studentTextCombined.includes(k))) {
      completenessScore += 7;
      highValueHits.push(check.label);
    } else {
      missedHighValue.push(check.label);
    }
  });
  completenessScore = Math.min(100, Math.max(40, completenessScore));

  // 2. Clinical Reasoning & Diagnosis
  const isPrimaryCorrect = clinicalCase.diagnosisOptions.some(
    d => d.id === primaryDiagnosisId && d.isCorrectPrimary
  );
  
  let reasoningScore = isPrimaryCorrect ? 60 : 35;
  // Award points for appropriate high differential inclusion
  const correctHighDiffs = clinicalCase.diagnosisOptions.filter(d => d.isHighDifferential).map(d => d.id);
  const matchedHighDiffs = differentialDiagnosisIds.filter(id => correctHighDiffs.includes(id));
  reasoningScore += Math.min(25, matchedHighDiffs.length * 12);
  
  // Award points for rationale depth
  if (clinicalRationale.trim().length > 80) {
    reasoningScore += 15;
  } else if (clinicalRationale.trim().length > 20) {
    reasoningScore += 8;
  }
  reasoningScore = Math.min(100, Math.max(30, reasoningScore));

  // 3. Communication
  let commScore = 75;
  // Deduct if student used overly aggressive jargon without explanation
  const jargonWords = ['ischemic penumbra', 'transmural necrosis', 'pathognomonic', 'atherothrombotic cascade'];
  if (jargonWords.some(j => studentTextCombined.includes(j))) {
    commScore -= 10;
  }
  if (studentMessages.length >= 6) {
    commScore += 15;
  }
  commScore = Math.min(100, commScore);

  // 4. Bedside Empathy
  const empathyCount = studentMessages.filter(m => {
    const t = m.text.toLowerCase();
    return ['sorry', 'help', 'comfort', 'take care', 'breathe', 'right here', 'worry', 'understand', 'ease'].some(k => t.includes(k));
  }).length;
  
  let empathyScore = 65;
  if (empathyCount >= 3) empathyScore = 96;
  else if (empathyCount >= 1) empathyScore = 84;
  else empathyScore = 60;

  // 5. Management & Next Steps
  const correctMgmt = clinicalCase.managementProtocols.filter(m => m.isCorrect).map(m => m.id);
  const incorrectMgmt = clinicalCase.managementProtocols.filter(m => !m.isCorrect).map(m => m.id);
  
  const chosenCorrect = selectedManagementIds.filter(id => correctMgmt.includes(id)).length;
  const chosenIncorrect = selectedManagementIds.filter(id => incorrectMgmt.includes(id)).length;

  let mgmtScore = 40;
  if (correctMgmt.length > 0) {
    mgmtScore += Math.round((chosenCorrect / correctMgmt.length) * 55);
  }
  mgmtScore -= (chosenIncorrect * 25);
  mgmtScore = Math.min(100, Math.max(30, mgmtScore));

  // Weighted overall calculation
  // Completeness (25%), Reasoning (30%), Comm (15%), Empathy (10%), Management (20%)
  const overallScore = Math.round(
    completenessScore * 0.25 +
    reasoningScore * 0.30 +
    commScore * 0.15 +
    empathyScore * 0.10 +
    mgmtScore * 0.20
  );

  let overallGrade: EvaluationResult['overallGrade'] = 'Pass';
  if (overallScore >= 90) overallGrade = 'High Honors';
  else if (overallScore >= 80) overallGrade = 'Honors';
  else if (overallScore >= 65) overallGrade = 'Pass';
  else overallGrade = 'Remediate';

  // Strengths & Missed
  const strengths: string[] = [];
  if (isPrimaryCorrect) {
    strengths.push(`Accurately recognized and established primary diagnosis of ${clinicalCase.diagnosisOptions.find(d => d.id === primaryDiagnosisId)?.name || 'the primary pathology'}.`);
  }
  if (highValueHits.length >= 6) {
    strengths.push(`Thorough history-taking covering essential clinical dimensions: ${highValueHits.slice(0, 3).join(', ')}.`);
  }
  if (performedExamIds.length >= 2) {
    strengths.push(`Appropriately targeted focused physical examination to rule in critical findings.`);
  }
  if (empathyCount > 0) {
    strengths.push(`Demonstrated supportive bedside communication, calming patient anxiety effectively.`);
  }
  if (strengths.length === 0) {
    strengths.push(`Initiated initial patient assessment and gathered foundational clinical facts.`);
  }

  const missedOpportunities: string[] = [];
  if (missedHighValue.length > 0) {
    missedOpportunities.push(`Incomplete history gathering in: ${missedHighValue.slice(0, 3).join(', ')}.`);
  }
  if (!isPrimaryCorrect) {
    missedOpportunities.push(`Primary working diagnosis was inaccurate or misidentified based on presented telemetry and lab findings.`);
  }
  if (chosenIncorrect > 0) {
    missedOpportunities.push(`Selected contraindicated or hazardous management intervention. Carefully check evidence-based clinical guidelines.`);
  }
  if (performedExamIds.length === 0) {
    missedOpportunities.push(`Did not perform bedside physical examination prior to submitting diagnosis.`);
  }

  // Critical Red Flags
  const criticalRedFlagsAddressed = clinicalCase.scoringRubric.redFlagsToScreen.map(redFlag => {
    const flagKey = redFlag.toLowerCase();
    let addressed = false;
    let comment = 'Omitted direct clinical screening for this emergency condition.';
    if (flagKey.includes('dissection') && (studentTextCombined.includes('back') || studentTextCombined.includes('tearing') || studentTextCombined.includes('dissect'))) {
      addressed = true;
      comment = 'Properly screened for tearing back pain and pulse differentials.';
    } else if (flagKey.includes('pe') || flagKey.includes('pulmonary embolism')) {
      if (studentTextCombined.includes('calf') || studentTextCombined.includes('leg') || studentTextCombined.includes('travel') || studentTextCombined.includes('dvt')) {
        addressed = true;
        comment = 'Appropriately inquired regarding venous thromboembolism risk factors.';
      }
    } else if (flagKey.includes('perforation') || flagKey.includes('shock')) {
      if (performedExamIds.includes('exam-abd-marcus') || studentTextCombined.includes('fever') || studentTextCombined.includes('lighthead')) {
        addressed = true;
        comment = 'Monitored for hemodynamic compromise and acute peritoneal breakdown.';
      }
    } else if (studentTextCombined.length > 100) {
      addressed = true;
      comment = 'Considered within clinical encounter context.';
    }
    return { item: redFlag, addressed, comment };
  });

  const nextCaseMap: Record<string, string> = {
    'case-acs-1': 'case-dyspnea-2',
    'case-dyspnea-2': 'case-abdomen-3',
    'case-abdomen-3': 'case-cap-4',
    'case-cap-4': 'case-acs-1',
  };

  const getGrade = (s: number): DimensionScore['grade'] => {
    if (s >= 88) return 'Excellent';
    if (s >= 75) return 'Proficient';
    if (s >= 60) return 'Developing';
    return 'Needs Practice';
  };

  return {
    sessionId: `ses-${Date.now()}`,
    caseId: clinicalCase.id,
    overallScore,
    overallGrade,
    durationSeconds,
    questionsAskedCount: studentMessages.length,
    examsPerformedCount: performedExamIds.length,
    investigationsOrderedCount: orderedInvestigationIds.length,
    dimensions: {
      interviewCompleteness: {
        name: 'Interview Completeness',
        score: completenessScore,
        weight: 25,
        grade: getGrade(completenessScore),
        feedback: completenessScore >= 80 ? 'Comprehensive exploration of HPI, OPQRST attributes, and pertinent risk factors.' : 'Focus on systematic OPQRST inquiry and asking about pertinent negatives.',
        keyPoints: highValueHits
      },
      clinicalReasoning: {
        name: 'Clinical Reasoning',
        score: reasoningScore,
        weight: 30,
        grade: getGrade(reasoningScore),
        feedback: isPrimaryCorrect ? 'Excellent diagnostic synthesis and correlation with clinical findings.' : 'Review diagnostic criteria and correlation of ECG/lab findings with presenting symptom timeline.',
        keyPoints: [isPrimaryCorrect ? 'Correct primary diagnosis' : 'Misidentified primary diagnosis', `Differential breadth: ${differentialDiagnosisIds.length} candidate conditions`]
      },
      communication: {
        name: 'Communication & Clarity',
        score: commScore,
        weight: 15,
        grade: getGrade(commScore),
        feedback: 'Communicated clearly in an approachable, patient-centered tone.',
        keyPoints: ['Professional tone', 'Appropriate question phrasing']
      },
      empathy: {
        name: 'Bedside Empathy & Rapport',
        score: empathyScore,
        weight: 10,
        grade: getGrade(empathyScore),
        feedback: empathyScore >= 80 ? 'Exceptional bedside presence, acknowledged patient anxiety and validated concerns.' : 'Remember to offer reassurance when patients express acute distress or fear.',
        keyPoints: [`${empathyCount} empathetic statements detected`]
      },
      management: {
        name: 'Management & Next Steps',
        score: mgmtScore,
        weight: 20,
        grade: getGrade(mgmtScore),
        feedback: mgmtScore >= 80 ? 'Appropriate guideline-directed acute resuscitation and therapeutic choices.' : 'Ensure prompt initiation of first-line therapies and check contraindications.',
        keyPoints: [`${chosenCorrect} evidence-based interventions selected`, `${chosenIncorrect} contraindicated choices`]
      }
    },
    strengths,
    missedOpportunities,
    criticalRedFlagsAddressed,
    primaryDiagnosisSubmitted: clinicalCase.diagnosisOptions.find(d => d.id === primaryDiagnosisId)?.name || 'None Selected',
    isPrimaryCorrect,
    differentialSubmitted: differentialDiagnosisIds.map(id => clinicalCase.diagnosisOptions.find(d => d.id === id)?.name || id),
    managementActionsSubmitted: selectedManagementIds.map(id => clinicalCase.managementProtocols.find(m => m.id === id)?.label || id),
    aiAttendingSummary: isPrimaryCorrect 
      ? `Dr. Attending Note: Strong clinical encounter for ${clinicalCase.patient.name}. You recognized the acute presentation rapidly, verified objective diagnostic data, and instituted critical evidence-based therapies in a timely manner. Keep up the high level of clinical rigor.`
      : `Dr. Attending Note: Encounter completed for ${clinicalCase.patient.name}. While you engaged with the patient well, the core diagnostic hypothesis required closer correlation with the objective test results and triage findings. Re-read the case debrief and retry.`,
    nextRecommendedCaseId: nextCaseMap[clinicalCase.id] || 'case-acs-1'
  };
}
