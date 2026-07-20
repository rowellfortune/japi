interface ContactBlockProps {
  heading?: string;
  org?: string;
  address?: string;
  tel?: string;
  mobile?: string;
  fax?: string;
  email?: string;
}

// Reusable navy contact card used across the JAPI info pages (Commercial Affairs, Courtesy, etc.).
export default function ContactBlock({ heading = 'Contact', org, address, tel, mobile, fax, email }: ContactBlockProps) {
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (address) rows.push({ label: 'Address', value: address });
  if (tel) rows.push({ label: 'Telephone', value: tel });
  if (mobile) rows.push({ label: 'Mobile', value: mobile });
  if (fax) rows.push({ label: 'Fax', value: fax });
  if (email)
    rows.push({
      label: 'Email',
      value: (
        <a href={`mailto:${email}`} className="hover:text-cta transition-colors">
          {email}
        </a>
      ),
    });

  return (
    <div className="rounded-xl bg-navy text-white p-6 sm:p-8">
      <h2 className="font-heading text-xl font-bold mb-1">{heading}</h2>
      {org && <p className="text-slate-300 text-sm mb-5">{org}</p>}
      <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-slate-400 uppercase tracking-wide text-xs mb-1">{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
