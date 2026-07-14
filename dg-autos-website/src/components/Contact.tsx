function Contact() {
return (
<section id="contact" className="bg-[#111111] py-24 text-white">
<div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
<div>
<p className="mb-3 font-semibold uppercase tracking-[0.25em] text-red-500">
Contact DG Autos
</p>

<h2 className="mb-6 text-4xl font-bold md:text-5xl">
Request a free estimate
</h2>

<p className="mb-10 max-w-xl leading-7 text-gray-400">
Tell us about your vehicle and the repair you need. We will contact
you to discuss the next steps.
</p>

<div className="space-y-6">
<div>
<p className="text-sm uppercase tracking-widest text-gray-500">
Address
</p>
<p className="mt-2 text-xl font-semibold">
7574 Dillon St, Houston, TX 77061
</p>
</div>

<div>
<p className="text-sm uppercase tracking-widest text-gray-500">
Phone
</p>

<div className="mt-2 flex flex-col gap-2">
<a
href="tel:8322032136"
className="text-xl font-semibold hover:text-red-500"
>
(832) 203-2136
</a>

<a
href="tel:2815202517"
className="text-xl font-semibold hover:text-red-500"
>
(281) 520-2517
</a>
</div>
</div>

<div>
<p className="text-sm uppercase tracking-widest text-gray-500">
Hours
</p>
<p className="mt-2 text-xl font-semibold">
Monday - Saturday
</p>
<p className="text-gray-400">
8:00 AM - 6:00 PM
</p>
</div>
</div>
</div>

<form className="rounded-2xl border border-gray-800 bg-[#1a1a1a] p-8">
<div className="grid gap-6 sm:grid-cols-2">
<div>
<label className="mb-2 block text-sm font-semibold">
Name
</label>

<input
type="text"
className="w-full rounded-lg border border-gray-700 bg-[#111111] px-4 py-3 outline-none transition focus:border-red-600"
placeholder="Your name"
/>
</div>

<div>
<label className="mb-2 block text-sm font-semibold">
Phone
</label>

<input
type="tel"
className="w-full rounded-lg border border-gray-700 bg-[#111111] px-4 py-3 outline-none transition focus:border-red-600"
placeholder="Your phone number"
/>
</div>
</div>

<div className="mt-6">
<label className="mb-2 block text-sm font-semibold">
Vehicle
</label>

<input
type="text"
className="w-full rounded-lg border border-gray-700 bg-[#111111] px-4 py-3 outline-none transition focus:border-red-600"
placeholder="Year, make, and model"
/>
</div>

<div className="mt-6">
<label className="mb-2 block text-sm font-semibold">
Repair needed
</label>

<textarea
rows={5}
className="w-full rounded-lg border border-gray-700 bg-[#111111] px-4 py-3 outline-none transition focus:border-red-600"
placeholder="Describe the damage or mechanical issue"
/>
</div>

<button
type="submit"
className="mt-6 w-full rounded-lg bg-red-600 px-6 py-4 text-lg font-bold transition hover:bg-red-700"
>
Request Free Estimate
</button>

<p className="mt-4 text-center text-sm text-gray-500">
This form is only visual for now. We will connect it later.
</p>
</form>
</div>
</section>
);
}

export default Contact;