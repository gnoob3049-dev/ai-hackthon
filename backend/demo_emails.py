DEMO_EMAILS = [
    """Subject: URGENT: $10,000 AI Research Scholarship - Deadline in 5 Days

Dear CS Students,

The National AI Foundation is offering a $10,000 scholarship for outstanding Computer Science students passionate about Artificial Intelligence and Machine Learning research.

Eligibility:
- Computer Science or related major
- Minimum GPA: 3.5
- Currently enrolled (graduating 2025-2027)
- US universities only

Deadline: April 23, 2025

Required documents:
- Official transcript
- 2 faculty recommendation letters  
- 1000-word research statement on AI ethics
- CV/Resume

Apply at: nationalai.org/scholarship2025

Do not miss this opportunity!""",

    """Subject: Google STEP Internship - Now Accepting Applications

Hi there,

Google's STEP (Student Training in Engineering Program) internship is now open for applications.

About STEP:
- 12-week paid summer internship at Google
- For students in their 1st or 2nd year (or penultimate year internationally)
- Focus areas: Software Engineering, AI/ML, Data Science
- Stipend: $35/hr + relocation assistance

Preferred background:
- Strong programming skills (Python, Java, or C++)
- Interest in large-scale systems
- Any GPA considered, competitive applicants typically 3.4+

Application portal: careers.google.com/students/step
Rolling deadline, apply before May 15, 2025

Best,
Google University Programs""",

    """Subject: MIT OpenCourseWare Research Fellowship - Application Open

Dear Graduate and Advanced Undergraduate Students,

MIT's Computer Science and AI Laboratory (CSAIL) is accepting applications for summer research fellowships.

Fellowship Details:
- 10-week intensive research position
- Work alongside MIT PhD students and faculty
- Stipend: $6,000 for the summer
- Focus: Machine Learning, Computer Vision, NLP

Requirements:
- Junior or Senior CS/EE student (3.6+ GPA preferred)
- Prior research experience a plus
- Must be available June - August 2025

Application deadline: May 1, 2025
Submit at: csail.mit.edu/fellowships

Contact: fellowships@csail.mit.edu""",

    """Subject: HackFest 2025 - 48-Hour Hackathon Registration Now Open

Yo hackers!

HackFest 2025 is back and we need YOU!

Event Details:
- Date: May 3-4, 2025
- Location: Engineering Building, Room 301
- Prizes: $2000 first place, $1000 second, $500 third
- Theme: AI for Social Good
- Team size: 2-4 people
- Free food and swag!

All majors welcome! No experience needed! Just bring your laptop and your ideas.

Register at: hackfest2025.devpost.com
Spots limited to 200 participants.

See you there,
HackFest Team""",

    """Subject: DINING SERVICES: New Lunch Menu This Week!

Hi Campus Community,

Check out our new spring lunch menu available Monday-Friday 11am-2pm.

This week's specials:
- Monday: Grilled chicken with roasted veggies - $8.50
- Tuesday: Veggie burger deluxe - $7.00
- Wednesday: Fish tacos - $9.00

Swipe your student card for 10% discount!

Location: Main Cafeteria, Building A

Bon appetit!
Dining Services Team""",

    """Subject: Final Reminder: Course Registration Opens Monday

Dear Students,

This is your final reminder that Spring 2025 course registration opens this Monday at 8:00 AM.

Important notes:
- Log in to your student portal
- Have your advisor PIN ready
- Check prerequisites before registering
- Some courses fill within hours

Popular CS courses expected to fill fast:
- CS 445: Machine Learning
- CS 478: Computer Vision  
- CS 492: Natural Language Processing

Contact registrar@university.edu with questions.

Academic Affairs Office"""
]

if __name__ == '__main__':
    for i, email in enumerate(DEMO_EMAILS):
        print(f'--- EMAIL {i} ({len(email)} chars) ---')
        print(email[:100] + '...')
        print()
