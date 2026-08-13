'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const clients = [
  { name: 'Mark International Kidney Center', type: 'Nephrology', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/CvegKrVeoWfcXC7sMrXLVmB6Vj5ikChWIPZEln7d.png' },
  { name: 'National Trauma Center (NAMS)', type: 'Central Hospital', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/o5Zhgt2GGub5BUNAydXVUlUETvmRXeGEIvEriLYl.png' },
  { name: 'Manipal College of Medical Science', type: 'Medical College', location: 'Pokhara, Nepal', logo: 'https://danphehealth.com/storage/uploads/4IY4SO3BaLokN5TATWTijwqOSQvnAq880dX06swm.png' },
  { name: 'Tilganga Institute of Ophthalmology (Tilganga)', type: 'Tertiary Hospital', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/YRlPFHdotC4yL6OpPwfpJi6W0S8G0kcPNNmvL5JG.png' },
  { name: 'APF (Armed Police Force) Hospital', type: 'Central Hospital', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/LvNtx7mQtJlbz9ycPe8pQZVoPzLBiFsuMyfRY1Pr.png' },
  { name: 'Hope International College & Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/fUyQ04tj66mbgHu2q9oWf7BX8O7CXvP1keYHTx6r.png' },
  { name: 'Center for American Medical Specialists (CAMS)', type: 'Multispecialty', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/RqdskDldRTpgBYg5sUUu0OkcmNuBw9QwFK6KKG7e.png' },
  { name: 'Anamiwa Health & Wellness Pvt. Ltd.', type: 'Health Center', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/zNwWDfrw7lORANZr3TVsvRIl4TNt9okcwnV0VyJd.png' },
  { name: 'We care Health Center Pvt. Ltd.', type: 'Dental', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/mrp9fZCqpE7RB9QtJPcaqCtF9D7xPuwW1PdAEYem.png' },
  { name: 'Buddhanilkantha Healthcare Pvt. Ltd.', type: 'Health Center', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/WJhqEGEa3RoG8kMO0vitnHKhk5L3LDixj72dxwfm.png' },
  { name: 'DanpheCare Pvt. Ltd.', type: 'Telehealth Center', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/iT0rlozWMUr6cep6wMmTncN7B6RUaU6YzntOUzC7.png' },
  { name: 'J & J Hospital', type: 'Clinic', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/NGs58eWiZYX8ugT3PgCYYSvIXGWDR0WuhaeYCdql.png' },
  { name: 'Path Minds Pvt. Ltd.', type: 'Diagnostic Center', location: 'Kathmandu, Nepal', logo: 'https://danphehealth.com/storage/uploads/FKitStuvautdQFj0B3RhWI38ThpL4wmjDnE5oQTk.png' },
  { name: 'Siddhartha Nagar City Hospital Pvt.Ltd.', type: 'Multispecialty', location: 'Bhairahawa, Nepal', logo: 'https://danphehealth.com/storage/uploads/dpOuibvB4foJdzuMpROb1Xaduko2KPZ8h5sof1Nz.png' },
  { name: 'United Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Kapilvastu, Lumbini, Nepal', logo: 'https://danphehealth.com/storage/uploads/UY5Nl1ge0eh2V1131Jui5X3yM7p1bcMr1bL8rxh8.png' },
  { name: 'Charak Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Pokhara, Nepal', logo: 'https://danphehealth.com/storage/uploads/s6mv48ri5hDrXDxgzU3E1lIW8qRj9TUrV69b5hQc.jpg' },
  { name: 'Fishtail Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Pokhara, Nepal', logo: 'https://danphehealth.com/storage/uploads/rqjKdONW5AKP4sX49m4IIgKAx8zo4I6qm9pHLIdw.png' },
  { name: 'Medi Plus Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Pokhara, Nepal', logo: '' },
  { name: 'Padma Nursing Home Pvt. Ltd.', type: 'Multispecialty', location: 'Pokhara, Nepal', logo: '' },
  { name: 'Kaligandaki Diagnostic and Research Center Hospital', type: 'Diagnostic Center', location: 'Pokhara, Nepal', logo: '' },
  { name: 'Deep Hospital & Research Center Pvt. Ltd.', type: 'Multispecialty', location: 'Pokhara, Nepal', logo: '' },
  { name: 'Manakamana Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Chitwan, Nepal', logo: 'https://danphehealth.com/storage/uploads/DvtgZd0LZopNWutTMb8AYZ7AnQRKHH4ROmN7zCIw.png' },
  { name: 'Koshish Cancer Center Pvt. Ltd.', type: 'Cancer', location: 'Chitwan, Nepal', logo: '' },
  { name: 'National City Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Chitwan, Nepal', logo: '' },
  { name: 'Raskot Community Hospital', type: 'Health Center', location: 'Raskot, Nepal', logo: '' },
  { name: 'Bhaktapur International Hospital Pvt.Ltd.', type: 'Multispecialty', location: 'Bhaktapur, Nepal', logo: '' },
  { name: 'Clinic One', type: 'Clinic', location: 'Bhaktapur, Nepal', logo: '' },
  { name: 'Rhythm Neuropsychiatry Hospital & Research Center Pvt. Ltd.', type: 'Psychiatry', location: 'Lalitpur, Nepal', logo: '' },
  { name: 'Maya Metro Hospital pvt. Ltd.', type: 'Multispecialty', location: 'Dhangadhi, Nepal', logo: 'https://danphehealth.com/storage/uploads/WQEEaXp58AGxNO61rv0xqypPC4KpMhnvpJb2Q01c.png' },
  { name: 'Radiant Skin Care Pvt. Ltd.', type: 'Pharmacy', location: 'Kathmandu, Nepal', logo: '' },
  { name: 'Dr. Iwamura Hospital', type: 'Multispecialty', location: 'Bhaktapur, Nepal', logo: '' },
  { name: 'Dr. Priyanka\'s Clinic', type: 'Specialit Clinic', location: 'Jhapa, Nepal', logo: '' },
  { name: 'Tillottama Hospital', type: 'Multispecialty', location: 'Butwal, Nepal', logo: '' },
  { name: 'Butwal Hospital', type: 'Multispecialty', location: 'Butwal, Nepal', logo: '' },
  { name: 'Times Care Hospital', type: 'Multispecialty', location: 'Dhadhing, Nepal', logo: '' },
  { name: 'Neuro Cardio Hospital', type: 'Multispecialty', location: 'Biratnagar, Nepal', logo: 'https://danphehealth.com/storage/uploads/PSjGCpwlgqK620FI8qTz4h6vkUvexhNIq0iQUvEz.png' },
  { name: 'Manmohan Hospital', type: 'Multispecialty', location: 'Chandragiri-1, Dahachowk, Kathmandu', logo: 'https://danphehealth.com/storage/uploads/IHeII9hv0UFpBpwTLouWfOOnGMWDtNaFIbmnQZg1.jpg' },
  { name: 'Ministry of Social Development and Health, Gandaki Province', type: 'Telemedicine Services', location: 'Pokhara, Nepal', logo: '' },
  { name: 'Lumbini Provincial Hospital', type: 'Tertiary (Provincial)', location: 'Butwal, Nepal', logo: 'https://danphehealth.com/storage/uploads/XwKrcFgg8NzD5hs58C8dz91oiCFZ0MnLJNKoqdaQ.png' },
  { name: 'SGM Hospital Pvt. Ltd', type: 'Multispeciality', location: 'Maharastra, India', logo: 'https://danphehealth.com/storage/uploads/roKTGWaMI1ZvCpKyogTJV22ri3QYifaTXylgCdcC.png' },
  { name: 'Annapurna Neuro Hospital', type: 'Multispecialty', location: 'Kathmandu, Nepal', logo: '' },
  { name: 'Bhagiratha Buddhashanti Hospital', type: 'PHC', location: 'Jhapa, Nepal', logo: '' },
  { name: 'Gorkha Kalika Hospital Pvt.Ltd.', type: 'Community', location: 'Gorkha, Nepal', logo: '' },
  { name: 'Star Hospital Limited', type: 'Specialized', location: 'Sanepa, Lalitpur & Bidur Nuwakot', logo: '' },
  { name: 'Matrika Eye Center', type: 'Specialized', location: 'Kathmandu, Nepal', logo: '' },
  { name: 'Tilottama Hospital Pvt. Ltd.', type: 'Multispecialty', location: 'Butwal, Nepal', logo: '' },
  { name: 'Sudur Paschim International Dialysis Center', type: 'Multispecialty', location: 'Kailali, Nepal', logo: '' },
];

export default function ClientsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-danphe-primary via-danphe-dark to-danphe-primary py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-danphe-accent/15 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-danphe-primary-light/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 h-1 w-16 origin-center rounded-full bg-danphe-accent"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          >
            Our Clients
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-white/80 sm:text-lg"
          >
            Trusted by 53+ hospitals and healthcare institutions across Nepal and beyond
          </motion.p>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clients.map((client, i) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-danphe-border bg-white p-4 shadow-sm transition-shadow hover:shadow-lg"
              >
                {client.logo ? (
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image src={client.logo} alt={client.name} fill unoptimized className="object-contain" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-danphe-primary/10">
                    <span className="text-lg font-bold text-danphe-primary">{client.name.charAt(0)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-danphe-primary truncate">{client.name}</p>
                  <p className="text-xs text-danphe-text-light">{client.type} · {client.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
