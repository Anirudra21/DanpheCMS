export const NAV_ITEMS = [
  { label: 'Company', href: '/company' },
  { label: 'Our Solution', href: '/solutions' },
  { label: 'Our Clients', href: '/clients' },
  { label: 'News & Events', href: '/news-events' },
  { label: 'Career', href: '/careers' },
  { label: 'Danphe Community', href: '/danphe-community' },
] as const;

export const MODULES = [
  {
    name: 'Patient Administration',
    slug: 'patient-administration',
    href: '/solution/patient-administration',
    icon: '/images/icons/o8LhlIHosonN1ss1Xbnx4BuPQIH2j5kTJLsqkWUF.svg',
    title: 'Enhancing Patient Care and Staff Incentives',
    description:
      'This system assists patients in scheduling appointments online, as well as registering walk-in patients. It facilitates the collection of demographic, insurance, and other essential information related to patients for treatment. It also incorporates billing for outpatient, inpatient, and discharge services, among others.',
    fullDescription:
      'This system assists patients in scheduling appointments online, as well as registering walk-in patients. It facilitates the collection of demographic, insurance, and other essential information related to patients for treatment. It also incorporates billing for outpatient, inpatient, and discharge services, among others. The incentive module deals with calculating and managing incentives for hospital staff, including doctors, nurses, and other staff members. It involves features such as defining incentive plans, tracking performance, and calculating incentives.',
    features: [
      'Online/ Phone/ Physical appointments',
      'General information of patients',
      'Follow-up patient management',
      'Doctor/ Department management',
      'Referral management (third party referral)',
      'Referral management (inter-departmental)',
      'Tests items, billing items and other services billing management',
      'Health package billing management',
      'Membership and schemes management',
      'Zero price item-wise billing',
      'Referred by, Prescriber and Performer auto captured',
      'Dr. Fraction configuration',
      'Multi-Level Auto fraction setups and captures',
      'Payment management with account integration',
    ],
    image: '/images/content/B06yY9y2MQiUCBEHpIcSITBjuN4yhkH4mLGvejX0.jpg',
  },
  {
    name: 'OPD Management',
    slug: 'opd-management',
    href: '/solution/opd-management',
    icon: '/images/icons/1FLzrtg52EKgMbKXaPPcngIBl8ThbVT5f93VKn5U.svg',
    title: 'In Person OPD Management',
    description:
      'An organized OPD is crucial for managing a large number of patients attended by multiple doctors. The complete cycle of an effective OPD, from registration through patient history, diagnosis, and prescriptions, is efficiently stored and managed by DANPHE Software.',
    fullDescription:
      'An organized OPD is crucial for managing a large number of patients attended by multiple doctors. The complete cycle of an effective OPD, from registration through patient history, diagnosis, and prescriptions, is efficiently stored and managed by DANPHE Software. The system enhances functionality with health insurance and SSF tracking, alongside the integration of ICDX codes. It boasts powerful reporting capabilities, enabling the scanning and storage of comprehensive patient demographics, including X-rays, ultrasound images, pathology reports, and other diagnostic documents.',
    features: [
      'OPD Appointments',
      'OPD Registration',
      'OPD Charges',
      'Medical Observation',
      'Consultant wise OPD',
      'Case wise/ Department wise OPD',
      'Procedure and clinical services requests',
      'LAB service request',
      'Pharmacy service request',
    ],
    image: '/images/content/3BiXFrnlBFMoMRwWZkoNm4XuMbUw1kNJgDkGIYdo.jpg',
  },
  {
    name: 'IPD Management',
    slug: 'ipd-management',
    href: '/solution/ipd-management',
    icon: '/images/icons/JZb6vJSIzCQZjvPUKBy1ds3KmAL8FMlvVL1XhtV7.svg',
    title: 'The Comprehensive Inpatient Management Solution',
    description:
      'The Complete Inpatient Management Module efficiently handles all inpatient functionalities in your hospital, from patient registration to billing, along with comprehensive tracking of patient records.',
    fullDescription:
      'The Complete Inpatient Management Module efficiently handles all inpatient functionalities in your hospital, from patient registration to billing, along with comprehensive tracking of patient records. Featuring built-in ward management and nursing station management, as well as ICU and NICU availability, the IPD offers a 360-degree view of the entire admitted patient\'s journey from admission to discharge.',
    features: [
      'Wards, Floor, Room & Bed Configuration',
      'Bed occupation status',
      'Admission and bed allocation (live)',
      'Payment receipts',
      'Medical observation and Nursing notes',
      'LAB & Radiology Investigation requests',
      'Procedure and clinical services requests',
      'Patient payment and dues reports',
    ],
    image: '/images/content/91ujO9IGH8LC6R1nc1fwwGeEiLrNIJQMSDegvElw.jpg',
  },
  {
    name: 'OT Management',
    slug: 'ot-management',
    href: '/solution/ot-management',
    icon: '/images/icons/CACHu7gc6zeiiyuUvDBzfZIn2tBT51gzsKA0wpLj.svg',
    title: 'Innovations in Operation Theater Management',
    description:
      'The Operation Theater module facilitates the scheduling of operation theaters, surgical teams, patient tracking, operation theater rosters, and notes, along with managing death and birth certificates. The purpose of OT management is to optimize the utilization of operation theaters, reduce patient wait times, and ensure timely and efficient surgical procedures.',
    fullDescription:
      'The Operation Theater module facilitates the scheduling of operation theaters, surgical teams, patient tracking, operation theater rosters, and notes, along with managing death and birth certificates. The purpose of OT management is to optimize the utilization of operation theaters, reduce patient wait times, and ensure timely and efficient surgical procedures.',
    features: [
      'OT Scheduling of the patient',
      'Team of Doctors/ Assistance involved in the operations',
      'Consent forms',
      'OT Reporting\'s',
      'Birth/ Death Certificates',
    ],
    image: '/images/content/bBYlK3VeJuVsh9FG2yR6gS2Y11p3dUJmWPNmE7nX.jpg',
  },
  {
    name: 'SSF Management',
    slug: 'ssf-management',
    href: '/solution/ssf-management',
    icon: '/images/icons/aSIoLyT5ERWOjXCnvgrP9PKL5797LBQc2MQY0lim.svg',
    title: 'SSF Insurance Scheme Management Module for Hospitals',
    description:
      'This module aids in managing the Social Security Fund (SSF) insurance scheme in hospitals. It supports registration, billing, pharmacy, and claim management and is equipped with API integration with the SSF system.',
    fullDescription:
      'This module aids in managing the Social Security Fund (SSF) insurance scheme in hospitals. It supports registration, billing, pharmacy, and claim management and is equipped with API integration with the SSF system.',
    features: [
      'SSF rate list mapping with hospital item lists',
      'Eligibility mapping of the SSF patient via API',
      'Balance sync and update as per SSF',
      'Claim booking in SSF',
      'Claim submission',
      'Copayment management',
      'Integration with accounting module so as to book the sales etc.',
    ],
    image: '/images/content/qFoZIpGXbbatD2dCVlfzh7RqWhUuOx9t3Dl5pQpA.jpg',
  },
  {
    name: 'Pathology Software',
    slug: 'pathology-software',
    href: '/solution/pathology-software',
    icon: '/images/icons/KFsFp99lsTgyXnVKJbiUi7gCRmRp2NR1umxVb19S.svg',
    title: 'Automating Processes and Enhancing Efficiency',
    description:
      'The Pathology Lab Management module facilitates the definition of laboratory tests, supporting fully configurable laboratory test reports that can be ordered for both outpatients and inpatients instantaneously.',
    fullDescription:
      'The Pathology Lab Management module facilitates the definition of laboratory tests, supporting fully configurable laboratory test reports that can be ordered for both outpatients and inpatients instantaneously.',
    features: [
      'Receive investigation request from OP/IP department',
      'Receipt printing',
      'Investigation sample collection',
      'Patient and test sticker printing',
      'Integration with patient billing system',
      'Generate investigation reports',
      'Warning and alerts for abnormal reports',
      'Report output to PDF',
      'Report validation before dispatch',
    ],
    image: '/images/content/PsJBHIIIEf0rhUAtYiK14G1fZx0lB76ZKIr90GS2.jpg',
  },
  {
    name: 'Pharmacy',
    slug: 'pharmacy',
    href: '/solution/pharmacy',
    icon: '/images/icons/lBnFUPj2tIcbTR3o0nL771yPqyvn9iy538SOfRrH.svg',
    title: 'Optimizing Workflow and Administration',
    description:
      'The pharmacy module encompasses both central and distributed pharmacies, incorporating several functional units such as stock tracking, ordering, and receiving medicines from vendors.',
    fullDescription:
      'The pharmacy module encompasses both central and distributed pharmacies, incorporating several functional units such as stock tracking, ordering, and receiving medicines from vendors.',
    features: [
      'Purchase and orders',
      'Good receipt notes/ Purchase returns',
      'Drugs/ Medical supplies to patients and wards',
      'Batch and expiry management',
      'Fast moving/ Nonmoving drugs',
      'Stock transfer between sub-stores',
      'Stock re-order reports',
      'Drug stocks',
      'Supplies outstanding etc.',
    ],
    image: '/images/content/toh9opS0qNh9sYaC0VLqXpjHSYnJUrfowh50Ogkh.jpg',
  },
  {
    name: 'Inventory Management',
    slug: 'inventory-management',
    href: '/solution/inventory-management',
    icon: '/images/icons/Yn3oJlVoSPd36iYdBg85CBZADxQrdi5TjpDPepKe.svg',
    title: 'Streamlining Hospital Stock Management',
    description:
      'The inventory module spans across the entire hospital, encompassing wards, OT, pharmacy, and other departments, regulating the complete stock movement throughout the institution.',
    fullDescription:
      'The inventory module spans across the entire hospital, encompassing wards, OT, pharmacy, and other departments, regulating the complete stock movement throughout the institution.',
    features: [
      'Purchase Indents & Approval',
      'Quotation & Follow-ups',
      'PO generation',
      'Goods receipts',
      'Purchase invoicing and returns',
      'Goods issue to different department',
      'Stock reorder management',
      'Suppliers outstanding',
      'Financial posting to account section',
    ],
    image: '/images/content/MQfWurB0r1HXok9nRVNTJ0B4iNaxVgI7XMhyNJ6g.jpg',
  },
  {
    name: 'Queue Management',
    slug: 'queue-management',
    href: '/solution/queue-management',
    icon: '/images/icons/3ifn90GrhvLTmH9h79XwY4ebCxajfC8ivC1JHe3L.svg',
    title: 'DANPHE HIMS Queue Management Feature',
    description:
      'The queue management feature in DANPHE HIMS is utilized to manage patient queues and prioritize patient flow within the hospital. It ensures that patients are attended to promptly and efficiently, thereby reducing waiting times and enhancing patient satisfaction.',
    fullDescription:
      'The queue management feature in DANPHE HIMS is utilized to manage patient queues and prioritize patient flow within the hospital. It ensures that patients are attended to promptly and efficiently, thereby reducing waiting times and enhancing patient satisfaction.',
    features: [
      'Queue display',
      'Appointment scheduling with token number',
      'Patient tracking with status',
      'Patient check-in',
    ],
    image: '/images/content/nlWH1aOywuLS90YcmM2ZCMZrYkB7xv9eFNtulLV0.jpg',
  },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Mark International Kidney Center',
    quote:
      'MI Kidney Centre is focusing on spreading Dialysis services in different districts of Nepal, prioritizing rural cities with frequent screening and awareness programs for Kidney diseases.',
    image: '/images/content/CvegKrVeoWfcXC7sMrXLVmB6Vj5ikChWIPZEln7d.png',
  },
  {
    name: 'Buddhanilkantha Healthcare Pvt. Ltd.',
    quote:
      'A team of doctors committed to providing affordable and high-quality basic medical services believes in preventing and reducing illness within an affordable setup.',
    image: '/images/content/WJhqEGEa3RoG8kMO0vitnHKhk5L3LDixj72dxwfm.png',
  },
  {
    name: 'Charak Hospital Pvt. Ltd.',
    quote:
      'Charak Memorial Hospital strives for excellence in quality, hygiene, and technology, meeting public health needs in the Western Region through innovation and cost-effective solutions.',
    image: '/images/content/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg',
  },
  {
    name: 'Maya Metro Hospital pvt. Ltd.',
    quote:
      'MMTH, part of NEHCO, champions equitable healthcare and quality education through collaborative efforts.',
    image: '/images/content/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png',
  },
  {
    name: 'Manmohan Hospital',
    quote:
      'This hospital plays a vital role related to health issues and their solution in the far west development region in Nepal, with great experience and an expert doctors team.',
    image: '/images/content/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg',
  },
] as const;

export const TRUSTED_HOSPITALS = [
  {
    name: 'Manipal College of Medical Science',
    logo: '/images/content/4IY4SO3BaLokN5TATWTijwqOSQvnAq880dX06swm.png',
  },
  {
    name: 'Tilganga Institute of Ophthalmology (Tilganga)',
    logo: '/images/content/YRlPFHdotC4yL6OpPwfpJi6W0S8G0kcPNNmvL5JG.png',
  },
  {
    name: 'APF (Armed Police Force) Hospital',
    logo: '/images/content/LvNtx7mQtJlbz9ycPe8pQZVoPzLBiFsuMyfRY1Pr.png',
  },
  {
    name: 'Siddhartha Nagar City Hospital Pvt.Ltd.',
    logo: '/images/content/dpOuibvB4foJdzuMpROb1Xaduko2KPZ8h5sof1Nz.png',
  },
  {
    name: 'Charak Hospital Pvt. Ltd.',
    logo: '/images/content/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg',
  },
  {
    name: 'Fishtail Hospital Pvt. Ltd.',
    logo: '/images/content/rqjKdONW5AKP4sX49m4IIgKAx8zo4I6qm9pHLIdw.png',
  },
  {
    name: 'Manakamana Hospital Pvt. Ltd.',
    logo: '/images/content/DvtgZd0LZopNWutTMb8AYZ7AnQRKHH4ROmN7zCIw.png',
  },
  {
    name: 'Maya Metro Hospital pvt. Ltd.',
    logo: '/images/content/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png',
  },
  {
    name: 'Neuro Cardio Hospital',
    logo: '/images/content/PSjGCpwlgqK620FI8qTz4h6vkUvexhNIq0iQUvEz.png',
  },
  {
    name: 'Manmohan Hospital',
    logo: '/images/content/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg',
  },
  {
    name: 'Lumbini Provincial Hospital',
    logo: '/images/content/XwKrcFgg8NzD5hs58C8dz91oiCFZ0MnLJNKoqdaQ.png',
  },
  {
    name: 'SGM Hospital Pvt. Ltd',
    logo: '/images/content/roKTGWaMI1ZvCpKyogTJV22ri3QYifaTXylgCdcC.png',
  },
] as const;

export const FEATURE_CARDS = [
  {
    title: 'Built By Doctors For Doctors',
    description:
      'We have your efficiency and ease in mind, so we have developed an user-friendly solution.',
    icon: '/images/icons/fi_2785482.svg',
  },
  {
    title: 'Customizable & Scalable',
    description:
      'We built it from the bottom up, so we can customize to your needs. Also, as your business grows, Danphe can scale to meet your demands',
    icon: '/images/icons/fi_487551.svg',
  },
  {
    title: 'Cloudbase Service',
    description:
      'We offer both on premises and cloud based services catering to your needs.',
    icon: '/images/icons/fi_3305673.svg',
  },
] as const;

export const SHARED_FAQS = [
  {
    question: 'Why DANPHE is different from other available in the market',
    answer:
      'DANPHE-HMIS with EMR by Imark Digital has been offered to customers for many years, providing advantages in managing business processes more effectively. DANPHE is a 100% web-based HMIS solution available in the market with trust. Unlike other HMIS systems on the market that offer inadequate solutions to meet hospital needs, DANPHE from Imark Digital is capable of controlling inventory, purchase orders, entry planning, accounting, human resource management, and clinical management solutions.',
  },
  {
    question: 'What are the security aspects of DANPHE?',
    answer:
      'As we have been in the market for many years, we have always prioritized security. It has been proven that DANPHE HMIS is fully secure from various unexpected technical intrusions. The software provides valuable ways to protect the centralized database and facilitates access for relevant departments or units with accurate permissions. The database in the system is secured in several ways: Access to the system is restricted to only two entities: the admin and individuals with legal authority (user-based permissions and controls). Software and module logins are effectively password protected. All passwords are individually generated. For security reasons, these passwords need to be changed at regular intervals.',
  },
  {
    question: 'Is it true that extremely less time is required to implement DANPHE HMIS?',
    answer:
      'DANPHE follows a phased-based implementation modality that facilitates timely and cost-effective service. We assert that DANPHE HMIS implementation is faster and more reliable compared to others. We provide a guarantee to our respected clients that their proposed software will go live according to defined protocols and within defined time frames.',
  },
  {
    question: 'Is DANPHE HMIS suitable for all small to big healthcare institution?',
    answer:
      "This is an extremely deep and important question that has been asked many times by most growing industry verticals. Well, don't worry about business size or scale, DANPHE is capable enough to easily gather each module and ensure optimum results that are in favor of the institution. We are a proven product in handling small clinics to tertiary and medical colleges, with load testing in a well-integrated business environment. DANPHE not only assists our clients in growing, but we also provide the enterprise with various feasible ways to adopt the business dynamics.",
  },
  {
    question: 'Is it possible to transfer the entire existing data to the newly implemented DANPHE System?',
    answer:
      'Yes, of course. Data migration is feasible in DANPHE, which is a plus point with our latest DANPHE product. In some cases and modules, the facility may not be available as per the rules of the governing body. However, doable data are migrated, and non-migrated data can be viewed as per need without any hassles, and that too in a short time frame.',
  },
  {
    question: 'Does Imark Digital offer after sales support services for DANPHE HMIS System?',
    answer:
      'In case of any inconvenience regarding software operation or implementation, our technical executives are here to resolve all system-related issues and hassles. We have a dedicated team of support engineers assigned to each hospital to take care of their needs.',
  },
] as const;
