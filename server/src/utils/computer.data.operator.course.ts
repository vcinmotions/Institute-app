// src/data/computerDataOperatorCourse.ts

export const computerDataOperatorCourse = {
  courseName: "Computer Data Operator",
  durationWeeks: 24,
  description:
    "A complete training program designed to equip students with skills in computer operations, data management, office productivity tools, and advanced data handling for real-world office environments.",

  modules: [
    {
      level: "Basic",
      topics: [
        {
          moduleTitle: "Introduction to Computers",
          topics: [
            "What is a Computer?",
            "History and Generations of Computers",
            "Types of Computers and Devices",
            "Input, Output and Storage Devices",
            "Understanding Operating Systems (Windows, Linux Basics)",
            "Basic Computer Terminology",
          ],
        },
        {
          moduleTitle: "Operating System & File Management",
          topics: [
            "Windows Interface and Navigation",
            "Creating, Copying, Renaming and Deleting Files/Folders",
            "Using File Explorer Effectively",
            "Basic Troubleshooting and Shortcuts",
            "Installing and Uninstalling Software",
          ],
        },
        {
          moduleTitle: "Typing and Data Entry Basics",
          topics: [
            "Touch Typing Techniques",
            "Numeric Keypad Practice",
            "Speed and Accuracy Improvement",
            "Data Entry Forms and Record Validation",
          ],
        },
      ],
    },
    {
      level: "Intermediate",
      topics: [
        {
          moduleTitle: "Microsoft Office Tools",
          topics: [
            "MS Word – Formatting, Page Setup, Mail Merge, Templates",
            "MS Excel – Formulas, Functions, Charts, Data Validation",
            "MS PowerPoint – Presentations, Animations, Slide Design",
            "MS Access – Database Creation, Tables, Queries, Reports",
            "MS Outlook – Email Management and Scheduling",
          ],
        },
        {
          moduleTitle: "Google Workspace Tools",
          topics: [
            "Google Docs and Sheets",
            "Google Forms and Data Collection",
            "Collaborating with Google Drive",
            "Cloud Storage and Sharing Permissions",
          ],
        },
        {
          moduleTitle: "Internet and Online Communication",
          topics: [
            "Web Browsing, Search Engines and Effective Searching",
            "Online Forms and Applications",
            "Email Writing Etiquette",
            "Using Cloud-Based Data Tools",
          ],
        },
      ],
    },
    {
      level: "Advanced",
      topics: [
        {
          moduleTitle: "Database and Data Management",
          topics: [
            "Introduction to Databases and SQL",
            "Working with Spreadsheets as Databases",
            "Data Import/Export between Excel and Access",
            "Backup, Restore and Security of Data",
            "Data Cleaning and Validation Techniques",
          ],
        },
        {
          moduleTitle: "Automation and Productivity",
          topics: [
            "Using Excel Macros for Automation",
            "Introduction to Google App Scripts",
            "Creating Automated Reports",
            "Batch File Processing",
          ],
        },
        {
          moduleTitle: "Basic Data Analysis and Reporting",
          topics: [
            "Understanding Data Types and Formats",
            "Sorting, Filtering and Pivot Tables",
            "Creating Dashboards in Excel",
            "Using Charts for Data Visualization",
            "Exporting Reports to PDF and Excel",
          ],
        },
        {
          moduleTitle: "Professional Skills",
          topics: [
            "Office Communication and Email Drafting",
            "Report Formatting and Presentation",
            "Time Management and Accuracy",
            "Cybersecurity Awareness and Safe Practices",
          ],
        },
      ],
    },
  ],

  assessment: {
    type: "Project + Practical Test",
    description:
      "Students will complete a real-world data entry and reporting project involving Excel, Access, and automated reporting workflows.",
  },

  certification: {
    title: "Certificate in Computer Data Operation",
    issuedBy: "Your Institute Name",
    criteria: "Minimum 70% in final project and attendance above 80%",
  },
};
