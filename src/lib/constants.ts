export const SITE_URL = "https://danphehealth.com";

export const NAV_ITEMS = [
  { label: "Company", href: `${SITE_URL}/company` },
  { label: "Our Solution", href: `${SITE_URL}/solutions` },
  { label: "Our Clients", href: `${SITE_URL}/clients` },
  { label: "News & Events", href: `${SITE_URL}/news-event` },
  { label: "Career", href: `${SITE_URL}/careers` },
  { label: "Danphe Community", href: `${SITE_URL}/danphe-community` },
] as const;

export const MODULES = [
  {
    name: "Patient Administration",
    href: `${SITE_URL}/solution/patient-administration`,
    icon: "https://danphehealth.com/storage/uploads/o8LhlIHosonN1ss1Xbnx4BuPQIH2j5kTJLsqkWUF.svg",
    title: "Enhancing Patient Care and Staff Incentives",
    description:
      "This system assists patients in scheduling appointments online, as well as registering walk-in patients. It facilitates the collection of demographic, insurance, and other essential information related to patients for treatment. It also incorporates billing for outpatient, inpatient, and discharge services, among others.",
    image: "https://danphehealth.com/storage/uploads/B06yY9y2MQiUCBEHpIcSITBjuN4yhkH4mLGvejX0.jpg",
  },
  {
    name: "OPD Management",
    href: `${SITE_URL}/solution/opd-management`,
    icon: "https://danphehealth.com/storage/uploads/1FLzrtg52EKgMbKXaPPcngIBl8ThbVT5f93VKn5U.svg",
    title: "In Person OPD Management",
    description:
      "An organized OPD is crucial for managing a large number of patients attended by multiple doctors. The complete cycle of an effective OPD, from registration through patient history, diagnosis, and prescriptions, is efficiently stored and managed by DANPHE Software.",
    image: "https://danphehealth.com/storage/uploads/3BiXFrnlBFMoMRwWZkoNm4XuMbUw1kNJgDkGIYdo.jpg",
  },
  {
    name: "IPD Management",
    href: `${SITE_URL}/solution/ipd-management`,
    icon: "https://danphehealth.com/storage/uploads/JZb6vJSIzCQZjvPUKBy1ds3KmAL8FMlvVL1XhtV7.svg",
    title: "The Comprehensive Inpatient Management Solution",
    description:
      "The Complete Inpatient Management Module efficiently handles all inpatient functionalities in your hospital, from patient registration to billing, along with comprehensive tracking of patient records.",
    image: "https://danphehealth.com/storage/uploads/91ujO9IGH8LC6R1nc1fwwGeEiLrNIJQMSDegvElw.jpg",
  },
  {
    name: "OT Management",
    href: `${SITE_URL}/solution/ot-management`,
    icon: "https://danphehealth.com/storage/uploads/CACHu7gc6zeiiyuUvDBzfZIn2tBT51gzsKA0wpLj.svg",
    title: "Innovations in Operation Theater Management",
    description:
      "The Operation Theater module facilitates the scheduling of operation theaters, surgical teams, patient tracking, operation theater rosters, and notes, along with managing death and birth certificates. The purpose of OT management is to optimize the utilization of operation theaters, reduce patient wait times, and ensure timely and efficient surgical procedures.",
    image: "https://danphehealth.com/storage/uploads/bBYlK3VeJuVsh9FG2yR6gS2Y11p3dUJmWPNmE7nX.jpg",
  },
  {
    name: "SSF Management",
    href: `${SITE_URL}/solution/ssf-management`,
    icon: "https://danphehealth.com/storage/uploads/aSIoLyT5ERWOjXCnvgrP9PKL5797LBQc2MQY0lim.svg",
    title: "SSF Insurance Scheme Management Module for Hospitals",
    description:
      "This module aids in managing the Social Security Fund (SSF) insurance scheme in hospitals. It supports registration, billing, pharmacy, and claim management and is equipped with API integration with the SSF system.",
    image: "https://danphehealth.com/storage/uploads/qFoZIpGXbbatD2dCVlfzh7RqWhUuOx9t3Dl5pQpA.jpg",
  },
  {
    name: "Pathology Software",
    href: `${SITE_URL}/solution/pathology-software`,
    icon: "https://danphehealth.com/storage/uploads/KFsFp99lsTgyXnVKJbiUi7gCRmRp2NR1umxVb19S.svg",
    title: "Automating Processes and Enhancing Efficiency",
    description:
      "The Pathology Lab Management module facilitates the definition of laboratory tests, supporting fully configurable laboratory test reports that can be ordered for both outpatients and inpatients instantaneously.",
    image: "https://danphehealth.com/storage/uploads/PsJBHIIIEf0rhUAtYiK14G1fZx0lB76ZKIr90GS2.jpg",
  },
  {
    name: "Pharmacy",
    href: `${SITE_URL}/solution/pharmacy`,
    icon: "https://danphehealth.com/storage/uploads/lBnFUPj2tIcbTR3o0nL771yPqyvn9iy538SOfRrH.svg",
    title: "Optimizing Workflow and Administration",
    description:
      "The pharmacy module encompasses both central and distributed pharmacies, incorporating several functional units such as stock tracking, ordering, and receiving medicines from vendors.",
    image: "https://danphehealth.com/storage/uploads/toh9opS0qNh9sYaC0VLqXpjHSYnJUrfowh50Ogkh.jpg",
  },
  {
    name: "Inventory Management",
    href: `${SITE_URL}/solution/inventory-management`,
    icon: "https://danphehealth.com/storage/uploads/Yn3oJlVoSPd36iYdBg85CBZADxQrdi5TjpDPepKe.svg",
    title: "Streamlining Hospital Stock Management",
    description:
      "The inventory module spans across the entire hospital, encompassing wards, OT, pharmacy, and other departments, regulating the complete stock movement throughout the institution.",
    image: "https://danphehealth.com/storage/uploads/MQfWurB0r1HXok9nRVNTJ0B4iNaxVgI7XMhyNJ6g.jpg",
  },
  {
    name: "Queue Management",
    href: `${SITE_URL}/solution/queue-management`,
    icon: "https://danphehealth.com/storage/uploads/3ifn90GrhvLTmH9h79XwY4ebCxajfC8ivC1JHe3L.svg",
    title: "DANPHE HIMS Queue Management Feature",
    description:
      "The queue management feature in DANPHE HIMS is utilized to manage patient queues and prioritize patient flow within the hospital. It ensures that patients are attended to promptly and efficiently, thereby reducing waiting times and enhancing patient satisfaction.",
    image: "https://danphehealth.com/storage/uploads/nlWH1aOywuLS90YcmM2ZCMZrYkB7xv9eFNtulLV0.jpg",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Mark International Kidney Center",
    quote:
      "MI Kidney Centre is focusing on spreading Dialysis services in different districts of Nepal, prioritizing rural cities with frequent screening and awareness programs for Kidney diseases.",
    image: "https://danphehealth.com/storage/uploads/CvegKrVeoWfcXC7sMrXLVmB6Vj5ikChWIPZEln7d.png",
  },
  {
    name: "Buddhanilkantha Healthcare Pvt. Ltd.",
    quote:
      "A team of doctors committed to providing affordable and high-quality basic medical services believes in preventing and reducing illness within an affordable setup.",
    image: "https://danphehealth.com/storage/uploads/WJhqEGEa3RoG8kMO0vitnHKhk5L3LDixj72dxwfm.png",
  },
  {
    name: "Charak Hospital Pvt. Ltd.",
    quote:
      "Charak Memorial Hospital strives for excellence in quality, hygiene, and technology, meeting public health needs in the Western Region through innovation and cost-effective solutions.",
    image: "https://danphehealth.com/storage/uploads/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg",
  },
  {
    name: "Maya Metro Hospital pvt. Ltd.",
    quote:
      "MMTH, part of NEHCO, champions equitable healthcare and quality education through collaborative efforts.",
    image: "https://danphehealth.com/storage/uploads/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png",
  },
  {
    name: "Manmohan Hospital",
    quote:
      "This hospital plays a vital role related to health issues and their solution in the far west development region in Nepal, with great experience and an expert doctors team.",
    image: "https://danphehealth.com/storage/uploads/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg",
  },
] as const;

export const TRUSTED_HOSPITALS = [
  {
    name: "Manipal College of Medical Science",
    logo: "https://danphehealth.com/storage/uploads/4IY4SO3BaLokN5TATWTijwqOSQvnAq880dX06swm.png",
  },
  {
    name: "Tilganga Institute of Ophthalmology (Tilganga)",
    logo: "https://danphehealth.com/storage/uploads/YRlPFHdotC4yL6OpPwfpJi6W0S8G0kcPNNmvL5JG.png",
  },
  {
    name: "APF (Armed Police Force) Hospital",
    logo: "https://danphehealth.com/storage/uploads/LvNtx7mQtJlbz9ycPe8pQZVoPzLBiFsuMyfRY1Pr.png",
  },
  {
    name: "Siddhartha Nagar City Hospital Pvt.Ltd.",
    logo: "https://danphehealth.com/storage/uploads/dpOuibvB4foJdzuMpROb1Xaduko2KPZ8h5sof1Nz.png",
  },
  {
    name: "Charak Hospital Pvt. Ltd.",
    logo: "https://danphehealth.com/storage/uploads/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg",
  },
  {
    name: "Fishtail Hospital Pvt. Ltd.",
    logo: "https://danphehealth.com/storage/uploads/rqjKdONW5AKP4sX49m4IIgKAx8zo4I6qm9pHLIdw.png",
  },
  {
    name: "Manakamana Hospital Pvt. Ltd.",
    logo: "https://danphehealth.com/storage/uploads/DvtgZd0LZopNWutTMb8AYZ7AnQRKHH4ROmN7zCIw.png",
  },
  {
    name: "Maya Metro Hospital pvt. Ltd.",
    logo: "https://danphehealth.com/storage/uploads/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png",
  },
  {
    name: "Neuro Cardio Hospital",
    logo: "https://danphehealth.com/storage/uploads/PSjGCpwlgqK620FI8qTz4h6vkUvexhNIq0iQUvEz.png",
  },
  {
    name: "Manmohan Hospital",
    logo: "https://danphehealth.com/storage/uploads/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg",
  },
  {
    name: "Lumbini Provincial Hospital",
    logo: "https://danphehealth.com/storage/uploads/XwKrcFgg8NzD5hs58C8dz91oiCFZ0MnLJNKoqdaQ.png",
  },
  {
    name: "SGM Hospital Pvt. Ltd",
    logo: "https://danphehealth.com/storage/uploads/roKTGWaMI1ZvCpKyogTJV22ri3QYifaTXylgCdcC.png",
  },
] as const;

export const FEATURE_CARDS = [
  {
    title: "Built By Doctors For Doctors",
    description:
      "We have your efficiency and ease in mind, so we have developed an user-friendly solution.",
    icon: "https://danphehealth.com/frontend/img/svg/fi_2785482.svg",
  },
  {
    title: "Customizable & Scalable",
    description:
      "We built it from the bottom up, so we can customize to your needs. Also, as your business grows, Danphe can scale to meet your demands",
    icon: "https://danphehealth.com/frontend/img/svg/fi_487551.svg",
  },
  {
    title: "Cloudbase Service",
    description:
      "We offer both on premises and cloud based services catering to your needs.",
    icon: "https://danphehealth.com/frontend/img/svg/fi_3305673.svg",
  },
] as const;
