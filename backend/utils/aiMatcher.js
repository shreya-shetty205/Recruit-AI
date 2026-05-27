/**
 * AI Resume Matching Utility
 */

const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
  'scala', 'r', 'matlab', 'perl', 'bash', 'shell', 'powershell',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'less',
  'tailwind', 'bootstrap', 'material-ui', 'chakra', 'redux', 'mobx', 'webpack', 'vite', 'babel',
  'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net',
  'graphql', 'rest', 'grpc', 'microservices', 'serverless',
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
  'firebase', 'supabase', 'prisma', 'sequelize', 'mongoose',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions',
  'ci/cd', 'linux', 'nginx', 'apache', 'heroku', 'vercel', 'netlify',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'data analysis', 'data science', 'nlp', 'computer vision', 'ai', 'ml',
  'git', 'github', 'gitlab', 'jira', 'confluence', 'figma', 'postman', 'swagger',
  'agile', 'scrum', 'kanban', 'tdd', 'bdd',
  'react native', 'flutter', 'ios', 'android', 'xamarin',
  'selenium', 'cypress', 'playwright', 'jest', 'mocha', 'chai', 'junit', 'testng',
  'api testing', 'test automation', 'manual testing', 'regression testing', 'performance testing',
  'jmeter', 'k6', 'gatling', 'appium', 'cucumber',
]

const normalize = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s.+#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const extractSkills = (text) => {
  if (!text) return []
  const normalized = normalize(text)
  const found = new Set()

  for (const skill of SKILL_KEYWORDS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?:^|\\s|,|;|\\(|/)${escaped}(?:$|\\s|,|;|\\)|/|\\.)`, 'i')
    if (regex.test(normalized)) {
      found.add(skill)
    }
  }

  const techPattern = /\b([A-Z][a-zA-Z0-9+#.]*(?:\.[a-zA-Z]+)?)\b/g
  const matches = text.match(techPattern) || []
  for (const match of matches) {
    const lower = match.toLowerCase()
    if (SKILL_KEYWORDS.includes(lower) && match.length > 1) {
      found.add(lower)
    }
  }

  return [...found]
}

const extractName = (text) => {
  if (!text) return null
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const skipPattern = /resume|curriculum|vitae|\bcv\b|profile|summary|objective|address|skills|experience|education|contact|technical|professional|personal|declaration|references|projects|certifications|achievements|languages|hobbies|interests|about|institute|university|college|school|technology|engineering|science|management|commerce|arts|department|faculty/i

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i]
    if (/@/.test(line)) continue
    if (/\d{4,}/.test(line)) continue
    if (/http|www\.|linkedin|github/i.test(line)) continue
    if (line.length > 45 || line.length < 3) continue
    if (line.includes(',')) continue
    if (skipPattern.test(line)) continue

    const words = line.split(/\s+/)
    if (words.length >= 2 && words.length <= 4) {
      const looksLikeName = words.every(w => /^[A-Za-z][A-Za-z.]*$/.test(w))
      if (looksLikeName) {
        const isAllCaps = line === line.toUpperCase() && line.length > 3
        return isAllCaps
          ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : line
      }
    }
  }
  return null
}

const extractEmail = (text) => {
  if (!text) return ''
  const match = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  return match ? match[0].toLowerCase() : ''
}

const extractPhone = (text) => {
  if (!text) return ''
  const match = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  return match ? match[0] : ''
}

/**
 * Extract experience — returns one of:
 * 'Fresher' | 'Entry Level' | '1-2 years' | '3-5 years' | '5-8 years' | '8+ years'
 */
const extractExperience = (text) => {
  if (!text) return 'Fresher'
  const normalized = normalize(text)

  // 1. Explicit "X years of experience"
  const yearsMatch = normalized.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp\b)/i)
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1])
    if (years <= 1) return 'Entry Level'
    if (years <= 2) return '1-2 years'
    if (years <= 5) return '3-5 years'
    if (years <= 8) return '5-8 years'
    return '8+ years'
  }

  // 2. Seniority keywords
  if (/\bsenior\b/i.test(normalized)) return '5-8 years'
  if (/\blead\b/i.test(normalized)) return '5-8 years'
  if (/\bjunior\b/i.test(normalized)) return '1-2 years'
  if (/\bfresher\b|entry.?level/i.test(normalized)) return 'Fresher'

  // 3. Look for date ranges inside work experience section only
  const expSectionMatch = normalized.match(
    /(?:work\s+experience|professional\s+experience|employment)([\s\S]{0,1500})/i
  )
  if (expSectionMatch) {
    const expSection = expSectionMatch[1]
    const currentYear = new Date().getFullYear()
    const dateRanges = [...expSection.matchAll(/\b(20\d{2}|19\d{2})\b[\s\S]{0,20}?\b(20\d{2}|present|current|now)\b/gi)]
    if (dateRanges.length > 0) {
      let totalMonths = 0
      for (const match of dateRanges) {
        const startYear = parseInt(match[1])
        const endRaw = match[2].toLowerCase()
        const endYear = (endRaw === 'present' || endRaw === 'current' || endRaw === 'now')
          ? currentYear
          : parseInt(match[2])
        if (endYear > startYear && endYear - startYear < 20) {
          totalMonths += (endYear - startYear) * 12
        }
      }
      const totalYears = totalMonths / 12
      if (totalYears >= 8) return '8+ years'
      if (totalYears >= 5) return '5-8 years'
      if (totalYears >= 3) return '3-5 years'
      if (totalYears >= 1) return '1-2 years'
      if (totalYears > 0) return 'Entry Level'
    }
  }

  // 4. Internship/student indicators → Fresher
  if (/\bintern\b|\binternship\b/i.test(normalized)) return 'Fresher'

  // 5. Currently pursuing degree (e.g. 2022-2026 still in progress)
  const currentYear = new Date().getFullYear()
  const ongoingDegree = normalized.match(/\b(20\d{2})\s*[-–]\s*(20\d{2})\b/g) || []
  for (const range of ongoingDegree) {
    const parts = range.match(/\b(20\d{2})\b/g)
    if (parts && parseInt(parts[1]) >= currentYear) {
      return 'Fresher'
    }
  }

  return 'Fresher'
}

const extractEducation = (text) => {
  if (!text) return 'Not specified'
  const normalized = normalize(text)

  if (/ph\.?d|doctorate|doctoral/i.test(normalized)) return 'PhD'
  if (/master'?s?|m\.s\.|m\.e\.|mba|m\.tech/i.test(normalized)) return "Master's Degree"
  if (/bachelor'?s?|b\.s\.|b\.e\.|b\.tech|b\.a\.|undergraduate/i.test(normalized)) return "Bachelor's Degree"
  if (/associate'?s?|a\.s\.|a\.a\./i.test(normalized)) return "Associate's Degree"
  if (/diploma|certificate|bootcamp/i.test(normalized)) return 'Diploma/Certificate'
  if (/high school|secondary/i.test(normalized)) return 'High School'

  return 'Not specified'
}

const calculateMatchScore = (resumeText, job) => {
  if (!resumeText || !job) {
    return { score: 0, matchingSkills: [], missingSkills: [], summary: '' }
  }

  const resumeSkills = extractSkills(resumeText)
  const jobSkills = job.skills || []
  const jobDescSkills = extractSkills(job.description || '')

  const allJobSkills = [...new Set([
    ...jobSkills.map(s => s.toLowerCase()),
    ...jobDescSkills,
  ])]

  if (allJobSkills.length === 0) {
    const jobKeywords = extractKeywords(job.description || '')
    const resumeKeywords = extractKeywords(resumeText)
    const overlap = jobKeywords.filter(k => resumeKeywords.includes(k))
    const score = Math.min(75, Math.round((overlap.length / Math.max(jobKeywords.length, 1)) * 100))
    return {
      score,
      matchingSkills: overlap.slice(0, 10),
      missingSkills: [],
      summary: generateSummary(score, overlap.slice(0, 5), []),
    }
  }

  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase())
  const matchingSkills = allJobSkills.filter(s => resumeSkillsLower.includes(s))
  const missingSkills = allJobSkills.filter(s => !resumeSkillsLower.includes(s))

  const skillScore = (matchingSkills.length / allJobSkills.length) * 70
  const expScore = calculateExperienceScore(resumeText, job.experience || '') * 15
  const eduScore = calculateEducationScore(resumeText) * 10
  const keywordScore = calculateKeywordDensity(resumeText, job.description || '') * 5

  const totalScore = Math.min(100, Math.round(skillScore + expScore + eduScore + keywordScore))

  return {
    score: totalScore,
    matchingSkills: matchingSkills.slice(0, 15),
    missingSkills: missingSkills.slice(0, 10),
    summary: generateSummary(totalScore, matchingSkills, missingSkills),
  }
}

const extractKeywords = (text) => {
  if (!text) return []
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'able'])
  return normalize(text)
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 50)
}

const calculateExperienceScore = (resumeText, requiredExp) => {
  const normalized = normalize(resumeText)
  const yearsMatch = normalized.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp\b)/)
  const resumeYears = yearsMatch ? parseInt(yearsMatch[1]) : 0

  const expMap = {
    'fresher': 0,
    'entry level': 0,
    '1-2 years': 1.5,
    '3-5 years': 4,
    '5-8 years': 6.5,
    '8+ years': 8,
  }
  const requiredYears = expMap[requiredExp?.toLowerCase()] ?? 0

  if (requiredYears === 0) return 0.8
  if (resumeYears >= requiredYears) return 1.0
  if (resumeYears >= requiredYears * 0.7) return 0.7
  if (resumeYears >= requiredYears * 0.5) return 0.5
  return 0.3
}

const calculateEducationScore = (resumeText) => {
  const normalized = normalize(resumeText)
  if (/ph\.?d|doctorate/i.test(normalized)) return 1.0
  if (/master'?s?|m\.s\.|mba/i.test(normalized)) return 0.9
  if (/bachelor'?s?|b\.s\.|b\.e\.|b\.tech/i.test(normalized)) return 0.8
  if (/associate|diploma|certificate/i.test(normalized)) return 0.6
  return 0.4
}

const calculateKeywordDensity = (resumeText, jobDescription) => {
  const jobKeywords = extractKeywords(jobDescription)
  const resumeKeywords = extractKeywords(resumeText)
  if (jobKeywords.length === 0) return 0.5
  const matches = jobKeywords.filter(k => resumeKeywords.includes(k))
  return Math.min(1, matches.length / jobKeywords.length)
}

const generateSummary = (score, matchingSkills, missingSkills) => {
  let summary = ''
  if (score >= 75) summary = 'Excellent match! This candidate strongly aligns with the job requirements. '
  else if (score >= 55) summary = 'Good match. This candidate meets most of the key requirements. '
  else if (score >= 35) summary = 'Moderate match. The candidate has some relevant skills but gaps exist. '
  else summary = "Low match. The candidate's profile doesn't closely align with the requirements. "

  if (matchingSkills.length > 0) summary += `Key matching skills: ${matchingSkills.slice(0, 5).join(', ')}. `
  if (missingSkills.length > 0) summary += `Missing skills: ${missingSkills.slice(0, 3).join(', ')}.`

  return summary
}

module.exports = {
  extractSkills,
  extractName,
  extractEmail,
  extractPhone,
  extractExperience,
  extractEducation,
  calculateMatchScore,
}