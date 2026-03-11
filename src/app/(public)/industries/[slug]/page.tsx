import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, MessageSquare, Calendar, Users, Bot } from 'lucide-react';
import { notFound } from 'next/navigation';

const INDUSTRY_DATA: Record<string, {
  name: string;
  icon: string;
  headline: string;
  subheadline: string;
  painPoints: string[];
  solutions: { title: string; desc: string }[];
  useCases: string[];
}> = {
  hvac: {
    name: 'HVAC',
    icon: '🔧',
    headline: 'AI sales agents for HVAC businesses',
    subheadline: 'Capture emergency repair leads, schedule maintenance calls, and book estimates — all on autopilot.',
    painPoints: ['Emergency calls come in at night and on weekends when no one is answering', 'Seasonal demand spikes overwhelm your team with lead volume', 'Follow-up on estimates takes days, and customers move on', 'You are too busy on job sites to return calls promptly'],
    solutions: [
      { title: 'Instant Emergency Response', desc: 'AI agents triage emergency vs. routine requests 24/7 and book priority service slots.' },
      { title: 'Seasonal Campaign Handling', desc: 'Handle high-volume AC/heating season inquiries without hiring temp staff.' },
      { title: 'Estimate Follow-Up', desc: 'Automated follow-up sequences after quotes to close more deals.' },
      { title: 'Maintenance Reminders', desc: 'Proactive outreach to existing customers for seasonal tune-ups and maintenance plans.' },
    ],
    useCases: ['Emergency repair scheduling', 'Free estimate bookings', 'Maintenance plan renewals', 'Seasonal tune-up campaigns', 'New construction HVAC quotes'],
  },
  roofing: {
    name: 'Roofing',
    icon: '🏠',
    headline: 'AI sales agents for roofing companies',
    subheadline: 'Respond to storm-damage leads instantly, qualify prospects, and book inspections while you are on the roof.',
    painPoints: ['Storm events create massive lead surges you cannot handle', 'Inspection requests go unanswered during busy season', 'Insurance claim leads need fast qualification', 'Competitors respond faster and win the job'],
    solutions: [
      { title: 'Storm Surge Handling', desc: 'Process hundreds of damage-inquiry leads simultaneously after major weather events.' },
      { title: 'Insurance Lead Qualification', desc: 'AI agents gather claim details, policy info, and damage descriptions before the first visit.' },
      { title: 'Inspection Scheduling', desc: 'Book roof inspections directly into your calendar, with address and access details.' },
      { title: 'Follow-Up Automation', desc: 'Keep leads warm with automated check-ins until they are ready to move forward.' },
    ],
    useCases: ['Storm damage inspections', 'Free roof estimates', 'Insurance claim assistance', 'Gutter and siding inquiries', 'Commercial roofing quotes'],
  },
  dental: {
    name: 'Dental',
    icon: '🦷',
    headline: 'AI sales agents for dental practices',
    subheadline: 'Fill your appointment book with new patients. AI agents handle inquiries, schedule visits, and reduce no-shows.',
    painPoints: ['New patient calls go to voicemail during appointments', 'Front desk staff are too busy to follow up on inquiries', 'No-shows and cancellations leave gaps in your schedule', 'Online inquiries sit unanswered for hours'],
    solutions: [
      { title: 'New Patient Capture', desc: 'AI agents respond to website and SMS inquiries instantly, qualifying new patient leads.' },
      { title: 'Appointment Scheduling', desc: 'Book cleanings, consultations, and procedures directly into your practice management calendar.' },
      { title: 'No-Show Reduction', desc: 'Automated 24-hour and 1-hour reminders via SMS reduce no-shows by up to 40%.' },
      { title: 'Recall Campaigns', desc: 'Proactive outreach to patients overdue for cleanings and check-ups.' },
    ],
    useCases: ['New patient scheduling', 'Cleaning and check-up reminders', 'Cosmetic dentistry consultations', 'Emergency appointment triage', 'Insurance verification questions'],
  },
  'med-spa': {
    name: 'Med Spa',
    icon: '💆',
    headline: 'AI sales agents for med spas',
    subheadline: 'Book more consultations and treatments. AI agents answer questions, qualify leads, and fill your schedule.',
    painPoints: ['Potential clients browse treatments at night and want immediate info', 'Consultations require pre-qualification that takes staff time', 'Competitive market means slow response loses the client', 'Seasonal promotions generate more leads than staff can handle'],
    solutions: [
      { title: 'Treatment Inquiry Handling', desc: 'AI agents answer questions about Botox, fillers, laser treatments, and more — 24/7.' },
      { title: 'Consultation Booking', desc: 'Qualify leads by treatment interest and budget, then book directly.' },
      { title: 'Promotion Campaigns', desc: 'Handle surge demand from seasonal deals and new treatment launches.' },
      { title: 'Follow-Up Sequences', desc: 'Nurture interested leads who are not ready to book immediately.' },
    ],
    useCases: ['Free consultation bookings', 'Treatment package inquiries', 'Seasonal promotion campaigns', 'Membership plan sign-ups', 'Post-treatment follow-ups'],
  },
  plumbing: {
    name: 'Plumbing',
    icon: '🔩',
    headline: 'AI sales agents for plumbing companies',
    subheadline: 'Never miss an emergency call. AI agents respond instantly, triage urgency, and book service appointments.',
    painPoints: ['Emergency plumbing calls come at all hours', 'You are under a sink and cannot answer the phone', 'Routine maintenance requests get lost in the shuffle', 'Quoting takes time you do not have'],
    solutions: [
      { title: 'Emergency Triage', desc: 'AI agents distinguish burst pipe emergencies from dripping faucets and respond accordingly.' },
      { title: '24/7 Availability', desc: 'Respond to every inquiry instantly — even at 2am on a Sunday.' },
      { title: 'Service Scheduling', desc: 'Book service windows, gather problem descriptions, and get access details upfront.' },
      { title: 'Quote Follow-Up', desc: 'Automated check-ins after sending estimates to close more jobs.' },
    ],
    useCases: ['Emergency leak calls', 'Drain cleaning scheduling', 'Water heater installation quotes', 'Bathroom remodel consultations', 'Maintenance plan sign-ups'],
  },
  electrical: {
    name: 'Electrical',
    icon: '⚡',
    headline: 'AI sales agents for electrical contractors',
    subheadline: 'Respond to service requests instantly. AI agents qualify electrical work and schedule visits while you are on the job.',
    painPoints: ['Service calls come in while your crew is on-site', 'Residential and commercial leads need different handling', 'Estimating is complex and time-consuming', 'Weekend inquiries go unanswered until Monday'],
    solutions: [
      { title: 'Request Qualification', desc: 'AI agents gather details about the electrical work needed before dispatching.' },
      { title: 'Emergency vs. Routine', desc: 'Triage power outages and safety hazards from routine panel upgrades.' },
      { title: 'Project Scheduling', desc: 'Book site visits and gather project scope details automatically.' },
      { title: 'Commercial Lead Routing', desc: 'Route commercial inquiries to your commercial team instantly.' },
    ],
    useCases: ['Electrical panel upgrades', 'Emergency power restoration', 'EV charger installations', 'Lighting design consultations', 'New construction wiring quotes'],
  },
  legal: {
    name: 'Legal',
    icon: '⚖️',
    headline: 'AI sales agents for law firms',
    subheadline: 'Capture potential client inquiries 24/7. AI agents qualify case types, gather details, and book consultations.',
    painPoints: ['Potential clients search for lawyers at night and on weekends', 'Initial intake is time-consuming for staff', 'High-value cases go to the first firm that responds', 'Marketing campaigns generate more leads than intake can handle'],
    solutions: [
      { title: 'Case Qualification', desc: 'AI agents gather case type, timeline, and basic facts before the first consultation.' },
      { title: 'Consultation Booking', desc: 'Schedule initial consultations directly into attorney calendars.' },
      { title: '24/7 Intake', desc: 'Capture client inquiries around the clock — never miss a high-value case.' },
      { title: 'Practice Area Routing', desc: 'Route leads to the right attorney based on case type and practice area.' },
    ],
    useCases: ['Personal injury consultations', 'Family law intake', 'Criminal defense inquiries', 'Estate planning appointments', 'Business law consultations'],
  },
  'real-estate': {
    name: 'Real Estate',
    icon: '🏡',
    headline: 'AI sales agents for real estate professionals',
    subheadline: 'Engage every buyer and seller lead. AI agents qualify prospects, answer questions, and schedule showings.',
    painPoints: ['Zillow and Realtor.com leads need instant response', 'You are showing properties and cannot answer new inquiries', 'Lead nurturing over weeks and months is hard to maintain', 'Open house follow-up falls through the cracks'],
    solutions: [
      { title: 'Instant Lead Response', desc: 'AI agents respond to portal leads in seconds with personalized messages.' },
      { title: 'Buyer Qualification', desc: 'Gather budget, timeline, pre-approval status, and property preferences.' },
      { title: 'Showing Scheduling', desc: 'Book property showings and open house RSVPs automatically.' },
      { title: 'Long-Term Nurture', desc: 'Keep in touch with leads who are months away from buying or selling.' },
    ],
    useCases: ['Buyer lead qualification', 'Listing inquiry responses', 'Open house follow-up', 'Showing scheduling', 'Market update campaigns'],
  },
  'auto-repair': {
    name: 'Auto Repair',
    icon: '🚗',
    headline: 'AI sales agents for auto repair shops',
    subheadline: 'Fill your bays. AI agents handle repair inquiries, provide rough estimates, and book drop-off appointments.',
    painPoints: ['Phone rings while technicians are under cars', 'Customers want quick estimates before committing', 'Service reminders fall through the cracks', 'Walk-in vs. appointment scheduling is chaotic'],
    solutions: [
      { title: 'Repair Inquiry Handling', desc: 'AI agents gather vehicle info, symptoms, and provide rough time/cost estimates.' },
      { title: 'Drop-Off Scheduling', desc: 'Book vehicle drop-off appointments with make, model, and issue pre-filled.' },
      { title: 'Service Reminders', desc: 'Automated oil change, tire rotation, and inspection reminders.' },
      { title: 'Warranty Follow-Up', desc: 'Proactive outreach for warranty-covered maintenance services.' },
    ],
    useCases: ['Repair estimate requests', 'Drop-off appointment booking', 'Oil change and maintenance reminders', 'Tire and brake service inquiries', 'Warranty service scheduling'],
  },
  landscaping: {
    name: 'Landscaping',
    icon: '🌿',
    headline: 'AI sales agents for landscaping companies',
    subheadline: 'Win more seasonal contracts. AI agents respond to quote requests and schedule consultations while you are in the field.',
    painPoints: ['Spring rush overwhelms your ability to respond to every quote request', 'You are mowing lawns and cannot answer the phone', 'Seasonal customers need re-engagement each year', 'Commercial contracts require detailed scope conversations'],
    solutions: [
      { title: 'Quote Request Handling', desc: 'AI agents gather property details, service needs, and budget before your first visit.' },
      { title: 'Seasonal Re-Engagement', desc: 'Automated outreach to previous customers when your season starts.' },
      { title: 'Consultation Scheduling', desc: 'Book site consultations with address and scope details pre-gathered.' },
      { title: 'Maintenance Plan Upsell', desc: 'Convert one-time customers to recurring maintenance contracts.' },
    ],
    useCases: ['Lawn care estimate requests', 'Hardscaping consultations', 'Spring cleanup scheduling', 'Tree and shrub service', 'Commercial property bids'],
  },
  cleaning: {
    name: 'Cleaning',
    icon: '✨',
    headline: 'AI sales agents for cleaning companies',
    subheadline: 'Book more recurring clients. AI agents qualify residential and commercial leads and schedule walkthroughs.',
    painPoints: ['Residential leads want quick quotes based on square footage', 'Commercial cleaning requires detailed scope discussions', 'Recurring client acquisition is key to sustainable revenue', 'You are cleaning and cannot take every call'],
    solutions: [
      { title: 'Instant Quoting', desc: 'AI agents gather home size, frequency, and special requirements to provide quick estimates.' },
      { title: 'Walkthrough Scheduling', desc: 'Book in-home or commercial walkthroughs with full details pre-gathered.' },
      { title: 'Recurring Plan Setup', desc: 'Convert one-time cleans to weekly/biweekly/monthly recurring service.' },
      { title: 'Move-In/Out Coordination', desc: 'Handle time-sensitive move-in and move-out cleaning requests.' },
    ],
    useCases: ['Residential deep cleaning', 'Recurring house cleaning', 'Commercial office cleaning', 'Move-in/move-out cleaning', 'Post-construction cleanup'],
  },
};

export function generateStaticParams() {
  return Object.keys(INDUSTRY_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = INDUSTRY_DATA[slug];
  if (!industry) return { title: 'Industry Not Found | LeadSaaS' };
  return {
    title: `AI Sales Agent for ${industry.name} Businesses | LeadSaaS`,
    description: `${industry.name}-specific lead capture and appointment booking powered by AI. ${industry.subheadline}`,
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = INDUSTRY_DATA[slug];
  if (!industry) notFound();

  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[48px] block mb-4">{industry.icon}</span>
          <h1 className="text-[36px] sm:text-[48px] font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>
            {industry.headline}
          </h1>
          <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto mb-8">{industry.subheadline}</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold transition-all hover:opacity-90 shadow-lg shadow-amber-200/50" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-8" style={{ fontFamily: 'Satoshi' }}>
            Sound familiar?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {industry.painPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                <span className="text-red-400 text-[18px] shrink-0">&#10005;</span>
                <p className="text-[14px] text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-8" style={{ fontFamily: 'Satoshi' }}>
            How LeadSaaS solves this for {industry.name} businesses
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {industry.solutions.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: 'Satoshi' }}>{s.title}</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi' }}>
            Common use cases
          </h2>
          <ul className="space-y-3">
            {industry.useCases.map((uc) => (
              <li key={uc} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />
                <span className="text-[14px] font-medium text-gray-700">{uc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(145deg, #0b0e14 0%, #141928 50%, #1a1f2e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-4 text-white" style={{ fontFamily: 'Satoshi' }}>
            Ready to grow your {industry.name.toLowerCase()} business?
          </h2>
          <p className="text-[16px] text-gray-400 mb-8">7-day free trial. AI agents trained for {industry.name.toLowerCase()}. Set up in minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold hover:opacity-90 transition-all" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/industries" className="text-[14px] font-semibold text-gray-400 hover:text-white transition-colors">
              View all industries
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
