import { useState } from 'react';
import { Printer, ShieldCheck, Download, CheckCircle2, Activity, User, Building2, Calendar, FileText, X } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function EPrescriptionModal({ isOpen, onClose, patient, referral, prescriptionData }) {
  const { lang: globalLang } = useLang();
  const [docMode, setDocMode] = useState('bilingual'); // 'bilingual' | 'en' | 'mr'

  if (!isOpen) return null;

  const patientNameEn = patient?.full_name || referral?.patient_name || 'Sunita Jadhav';
  const patientNameMr = patient?.full_name_mr || 'सुनीता जाधव';
  const age = patient?.age || referral?.patient_age || 26;
  const genderEn = patient?.gender || referral?.patient_gender || 'Female';
  const genderMr = genderEn === 'Female' ? 'महिला' : 'पुरुष';
  const phone = patient?.phone || '9342222160';
  const abhaId = patient?.abha_id || '91-8428-7052-5101';
  const rxId = prescriptionData?.rxId || `Rx-CL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const doctorNameEn = prescriptionData?.doctorName || referral?.referred_by_name || 'Dr. S Saindhavi, MD (OB-GYN & Maternal-Fetal Specialist)';
  const doctorNameMr = 'डॉ. एस सेंधवी (स्त्रीरोग व प्रसूती तज्ज्ञ)';
  const doctorReg = prescriptionData?.doctorReg || 'MMC Reg No: 2014/05/1892 · Contact: +91 9677563417';
  const facilityNameEn = prescriptionData?.facilityName || referral?.to_facility_name || 'District Hospital Satara';
  const facilityNameMr = 'जिल्हा रुग्णालय सातारा';

  const diagnosisEn = prescriptionData?.diagnosis || referral?.reason || 'O14.0 — Mild Pre-eclampsia evaluation & BP monitoring';
  const diagnosisMr = 'O14.0 — सौम्य प्री-क्लॅम्पशिया मूल्यमापन आणि उच्च रक्तदाब नियंत्रण';

  const medicines = prescriptionData?.medicines || [
    {
      nameEn: 'Tab. Labetalol 100mg',
      nameMr: 'टॅब. लॅबेटालोल १००mg',
      timingEn: '1 - 0 - 1 (BD)',
      timingMr: '१ - ० - १ (सकाळी - संध्याकाळी)',
      durationEn: '7 Days',
      durationMr: '७ दिवस',
      instructionsEn: 'Take after food. Monitor BP daily at Sub-centre.',
      instructionsMr: 'जेवणानंतर घ्या. उपकेंद्रावर रोज बीपी तपासा.'
    },
    {
      nameEn: 'Tab. Calcium Carbonate + Vit D3 500mg',
      nameMr: 'टॅब. कॅल्शियम कार्बोनेट + व्हिटॅमिन डी३ ५००mg',
      timingEn: '0 - 1 - 0 (OD)',
      timingMr: '० - १ - ० (दुपारी)',
      durationEn: '30 Days',
      durationMr: '३० दिवस',
      instructionsEn: 'Take after lunch with water.',
      instructionsMr: 'दुपारच्या जेवणानंतर पाण्यासोबत घ्या.'
    },
    {
      nameEn: 'Tab. Iron & Folic Acid (IFA)',
      nameMr: 'टॅब. आयर्न आणि फॉलिक अ‍ॅसिड (IFA)',
      timingEn: '1 - 0 - 0 (OD)',
      timingMr: '१ - ० - ० (सकाळी)',
      durationEn: '30 Days',
      durationMr: '३० दिवस',
      instructionsEn: 'Take in morning. Do not take with tea/coffee.',
      instructionsMr: 'सकाळी घ्या. चहा किंवा कॉफीसोबत घेऊ नका.'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const printElement = document.getElementById('printable-prescription');
    if (!printElement) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>CareLink AI — e-Prescription (${rxId})</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap');
              * { box-sizing: border-box; }
              body {
                font-family: 'Inter', 'Noto Sans Devanagari', system-ui, -apple-system, sans-serif;
                margin: 0;
                padding: 24px 32px;
                color: #0F172A;
                background: #FFFFFF;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              #printable-prescription {
                padding: 0 !important;
              }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { text-align: left; vertical-align: top; padding: 10px 12px !important; }
            </style>
          </head>
          <body>
            ${printElement.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '94vh',
        boxShadow: '0 32px 72px rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Sticky Control Header Bar */}
        <div className="no-print" style={{
          background: '#1E293B',
          color: '#FFFFFF',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#FFFFFF' }}>CareLink AI Digital e-Prescription</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Bilingual (English + मराठी) · Balanced A4 Layout</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Language Mode Selector Tabs */}
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: '8px', display: 'flex', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setDocMode('bilingual')}
                style={{
                  background: docMode === 'bilingual' ? '#0D9488' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Dual (EN + मराठी)
              </button>
              <button
                type="button"
                onClick={() => setDocMode('en')}
                style={{
                  background: docMode === 'en' ? '#2563EB' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setDocMode('mr')}
                style={{
                  background: docMode === 'mr' ? '#7C3AED' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                मराठी
              </button>
            </div>

            {/* Download PDF Button */}
            <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF} style={{ background: '#2563EB', borderColor: '#2563EB', padding: '6px 12px', fontSize: '0.78125rem' }}>
              <Download size={15} /> Download PDF
            </button>

            {/* Print Button */}
            <button className="btn btn-success btn-sm" onClick={handlePrint} style={{ padding: '6px 12px', fontSize: '0.78125rem' }}>
              <Printer size={15} /> Print
            </button>

            {/* Close Button */}
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: '#94A3B8', padding: '6px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DUAL-LANGUAGE E-PRESCRIPTION BODY (BALANCED A4 FILL) */}
        <div id="printable-prescription" style={{ padding: '32px 36px', background: '#FFFFFF', color: '#0F172A', overflowY: 'auto', flex: 1 }}>
          {/* BRAND HEADER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '3px solid #0D9488',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}>
                  <Activity size={26} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                    CareLink AI <span style={{ fontSize: '0.9375rem', color: '#0D9488', fontWeight: 800 }}>/ केरलिंक AI</span>
                  </h1>
                  <div style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 800 }}>
                    {docMode === 'mr' ? 'डिजिटल काळजी-समन्वय स्तर · ई-संजीवनी टेलीकन्सल्टेशन' : 'Digital Care-Coordination Layer · eSanjeevani Teleconsultation'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', fontWeight: 700 }}>
                Public Health Department · Government of Maharashtra / सार्वजनिक आरोग्य विभाग · महाराष्ट्र शासन
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                background: 'rgba(13, 148, 136, 0.15)',
                color: '#0F766E',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'inline-block',
                marginBottom: '6px',
                border: '1px solid rgba(13, 148, 136, 0.3)'
              }}>
                OFFICIAL e-PRESCRIPTION / अधिकृत ई-औषधपत्र
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>Rx ID: {rxId}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Date / दिनांक: {dateStr}</div>
            </div>
          </div>

          {/* PATIENT & FACILITY DETAILS GRID */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PATIENT NAME / रुग्णाचे नाव
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                {docMode === 'mr' ? `${patientNameMr} (${age} वर्षे, ${genderMr})` : docMode === 'en' ? `${patientNameEn} (${age}y, ${genderEn})` : `${patientNameEn} (${patientNameMr}) · ${age}y (${genderEn} / ${genderMr})`}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '4px' }}>
                📱 Mobile: <strong style={{ color: '#0F766E' }}>+91 {phone}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ABHA DIGITAL HEALTH ID / आभा आयडी
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0D9488', marginTop: '3px', fontFamily: 'monospace' }}>
                {abhaId}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '4px' }}>
                ABHA Address: 9342222160@abdm
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FACILITY & SOURCE / रुग्णालय
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                {docMode === 'mr' ? facilityNameMr : docMode === 'en' ? facilityNameEn : `${facilityNameEn} (${facilityNameMr})`}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                eSanjeevani Teleconsultation Hub / ई-संजीवनी केंद्र
              </div>
            </div>
          </div>

          {/* CLINICAL DIAGNOSIS BLOCK */}
          <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#EFF6FF', borderLeft: '4px solid #2563EB', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PHYSICIAN DIAGNOSIS & EVALUATION (ICD-10) / वैद्यकीय निदान आणि मूल्यमापन
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1E3A8A', marginTop: '4px' }}>
              {docMode === 'mr' ? diagnosisMr : docMode === 'en' ? diagnosisEn : `${diagnosisEn}`}
            </div>
            {docMode === 'bilingual' && (
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1D4ED8', marginTop: '2px' }}>
                मराठी: {diagnosisMr}
              </div>
            )}
          </div>

          {/* STRUCTURED RX MEDICATIONS TABLE */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', color: '#0D9488', fontWeight: 800 }}>Rx</span>
              <span>PRESCRIBED MEDICATIONS / दिलेली औषधे</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '28px' }}>#</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155' }}>MEDICINE NAME / औषध</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155' }}>DOSAGE / वेळ</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155', width: '120px' }}>DURATION / कालावधी</th>
                  <th style={{ padding: '10px 12px', fontWeight: 800, color: '#334155' }}>INSTRUCTIONS / सूचना</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#64748B' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>
                      {docMode === 'mr' ? m.nameMr : docMode === 'en' ? m.nameEn : (
                        <>
                          <div>{m.nameEn}</div>
                          <div style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 700, marginTop: '2px' }}>{m.nameMr}</div>
                        </>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0D9488' }}>
                      {docMode === 'mr' ? m.timingMr : docMode === 'en' ? m.timingEn : (
                        <>
                          <div>{m.timingEn}</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>{m.timingMr}</div>
                        </>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#334155' }}>
                      {docMode === 'mr' ? m.durationMr : docMode === 'en' ? m.durationEn : `${m.durationEn} (${m.durationMr})`}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569', fontSize: '0.75rem' }}>
                      {docMode === 'mr' ? m.instructionsMr : docMode === 'en' ? m.instructionsEn : (
                        <>
                          <div>{m.instructionsEn}</div>
                          <div style={{ color: '#0D9488', fontWeight: 600, marginTop: '2px' }}>मराठी: {m.instructionsMr}</div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CLINICAL ADVICE & FOLLOW-UP REMINDER BLOCK */}
          <div style={{ marginBottom: '24px', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.75rem' }}>
            <div style={{ fontWeight: 800, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              GENERAL ADVICE & FOLLOW-UP INSTRUCTIONS / सामान्य सल्ला आणि पाठपुरावा
            </div>
            <div style={{ color: '#334155', fontWeight: 600 }}>
              1. Continue daily Blood Pressure monitoring at Sub-centre Wai. (उपकेंद्रावर दररोज रक्तदाब तपासा.)
            </div>
            <div style={{ color: '#334155', fontWeight: 600, marginTop: '2px' }}>
              2. Avoid excessive salt intake and take adequate bed rest. (मीठ कमी घ्या आणि विश्रांती घ्या.)
            </div>
            <div style={{ color: '#2563EB', fontWeight: 800, marginTop: '2px' }}>
              3. Next Review Date: 10 Sept 2026 at District Hospital Satara OPD. (पुढील तपासणी दिनांक: १० सप्टेंबर २०२६)
            </div>
          </div>

          {/* DOCTOR SIGNATURE & VERIFICATION FOOTER */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '16px',
            borderTop: '2px solid #E2E8F0'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.75rem', fontWeight: 800 }}>
                <CheckCircle2 size={16} /> Digitally Signed via eSanjeevani Protocol / ई-संजीवनी द्वारे डिजिटल स्वाक्षरी केली
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '3px' }}>
                CareLink AI Integrated Healthcare Engine · MoHFW Compliance / सार्वजनिक आरोग्य विभाग
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                {docMode === 'mr' ? doctorNameMr : docMode === 'en' ? doctorNameEn : `${doctorNameEn}`}
              </div>
              {docMode === 'bilingual' && (
                <div style={{ fontSize: '0.75rem', color: '#0D9488', fontWeight: 700, marginTop: '1px' }}>
                  {doctorNameMr}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                {doctorReg}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#0D9488', fontWeight: 700, marginTop: '3px', textTransform: 'uppercase' }}>
                Authorized Teleconsultant Doctor / अधिकृत डॉक्टर
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
