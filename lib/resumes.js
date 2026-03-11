// lib/resumes.js
// This file will be replaced with your actual resumes from select_form_resumes.py
// For now, contains the structure and 4 examples (one per category)
// REPLACE the resumes array below with your actual 40 resumes

export const JOB_DESCRIPTIONS = {
  "INFORMATION-TECHNOLOGY": `IT Specialist — TechStar Solutions

We are seeking an IT Specialist to support and enhance our technology infrastructure. The ideal candidate has experience in systems administration, software development, or technical support.

Requirements:
• Bachelor's degree in Computer Science, IT, or related field
• 2-5 years of experience in IT roles
• Proficiency in programming languages (Python, Java, JavaScript, or similar)
• Experience with databases, networking, or cloud platforms
• Strong problem-solving and communication skills`,

  "FINANCE": `Financial Analyst — Summit Capital Group

We are looking for a detail-oriented Financial Analyst to support investment decision-making and financial planning.

Requirements:
• Bachelor's degree in Finance, Accounting, or Economics
• 2-4 years of experience in financial analysis or related roles
• Advanced Excel and financial modeling skills
• Knowledge of financial statements and valuation methodologies
• Strong analytical and quantitative reasoning`,

  "SALES": `Sales Representative — GrowthWave Inc.

We are hiring a motivated Sales Representative to drive revenue growth across our product portfolio.

Requirements:
• Bachelor's degree in Business, Marketing, or related field
• 1-4 years of sales experience, preferably B2B
• Proven track record of meeting or exceeding sales targets
• Proficiency with CRM tools (Salesforce, HubSpot)
• Excellent communication and negotiation skills`,

  "HR": `HR Specialist — PeopleFirst Corp.

We are seeking an HR Specialist to support employee lifecycle management, benefits administration, and organizational development.

Requirements:
• Bachelor's degree in Human Resources, Business Administration, or related field
• 2-5 years of HR experience
• Knowledge of employment law and HR compliance (FMLA, EEO, FLSA)
• Experience with HRIS systems and benefits administration
• Strong interpersonal and organizational skills`,
};

// ⚠️ REPLACE THIS ARRAY with output from select_form_resumes.py
// Each object needs: id, category, text
// Run: python select_form_resumes.py > form_output.txt
// Then convert the output to this format
export const RESUMES = [
  {
    id: "sample_1",
    category: "INFORMATION-TECHNOLOGY",
    text: `SOFTWARE DEVELOPER

Summary
Experienced software developer with 4+ years building web applications and backend services.

Experience
Software Developer
Company Name — City, State
Jun 2020 to Current
- Developed REST APIs serving 500K daily requests using Python and Flask
- Migrated legacy monolith to microservices architecture on AWS
- Improved CI/CD pipeline reducing deployment time by 60%

Junior Developer
Company Name — City, State
Aug 2018 to May 2020
- Built frontend components using React and TypeScript
- Maintained PostgreSQL databases and wrote complex SQL queries

Education
B.S. Computer Science, 2018
State University — City, State
GPA: 3.5/4.0

Skills
Python, JavaScript, TypeScript, React, Flask, PostgreSQL, AWS, Docker, Git`
  },
  {
    id: "sample_2",
    category: "FINANCE",
    text: `FINANCIAL ANALYST

Summary
Detail-oriented financial analyst with 3 years of experience in corporate finance and investment analysis.

Experience
Financial Analyst
Company Name — City, State
Mar 2021 to Current
- Built financial models for $200M+ acquisition targets
- Prepared quarterly earnings reports for senior leadership
- Conducted industry research and competitive benchmarking

Junior Analyst
Company Name — City, State
Jun 2019 to Feb 2021
- Assisted in preparing client presentations and pitch books
- Maintained financial databases and automated reporting workflows

Education
B.S. Finance, 2019
State University — City, State
GPA: 3.7/4.0

Skills
Financial Modeling, Excel (Advanced), Bloomberg Terminal, Python, SQL, Valuation, PowerPoint`
  },
  {
    id: "sample_3",
    category: "SALES",
    text: `SALES ACCOUNT EXECUTIVE

Summary
Results-driven sales professional with 3+ years exceeding quota in B2B SaaS environments.

Experience
Account Executive
Company Name — City, State
Jan 2021 to Current
- Closed $1.2M in annual recurring revenue, 130% of quota
- Managed pipeline of 50+ enterprise accounts
- Developed strategic partnerships with 3 channel partners

Sales Development Representative
Company Name — City, State
May 2019 to Dec 2020
- Generated 200+ qualified leads through outbound prospecting
- Consistently exceeded monthly meeting targets by 25%

Education
B.A. Business Administration, 2019
State University — City, State

Skills
Salesforce, HubSpot, Cold Outreach, Pipeline Management, Negotiation, Presentation Skills`
  },
  {
    id: "sample_4",
    category: "HR",
    text: `HR COORDINATOR

Summary
Dedicated HR professional with 2+ years supporting employee relations, benefits administration, and recruitment.

Experience
HR Coordinator
Company Name — City, State
Aug 2021 to Current
- Managed onboarding process for 150+ new hires annually
- Administered benefits enrollment and resolved employee inquiries
- Coordinated recruiting efforts across 5 departments

HR Assistant
Company Name — City, State
Jun 2019 to Jul 2021
- Maintained employee records in HRIS system (Workday)
- Assisted with payroll processing for 300+ employees
- Organized company events and training sessions

Education
B.S. Human Resources Management, 2019
State University — City, State

Skills
HRIS (Workday, ADP), Benefits Administration, Recruiting, Employee Relations, Payroll, FMLA/EEO compliance`
  },
];
